<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MeetingMinuteController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', MeetingMinute::class);

        $user = $request->user();
        $query = MeetingMinute::query()->with(['meeting:id,title,date,start_time,end_time', 'recorder:id,name', 'reviewer:id,name']);

        if (! $user->isAdmin() && ! $user->isSekretaris() && ! $user->isPimpinan()) {
            $query->whereHas('meeting.attendees', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('content_summary', 'like', "%{$search}%")
                    ->orWhere('decisions', 'like', "%{$search}%")
                    ->orWhereHas('meeting', fn ($m) => $m->where('title', 'like', "%{$search}%"));
            });
        }

        $minutes = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('minutes/index', [
            'minutes' => $minutes,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function storeOrUpdate(Request $request, Meeting $meeting)
    {
        $existing = $meeting->minute()->first();

        if ($existing) {
            Gate::authorize('update', $existing);
        } else {
            Gate::authorize('update', $meeting);
        }

        $validated = $request->validate([
            'content_summary' => ['required', 'string'],
            'decisions' => ['required', 'string'],
            'submit_for_review' => ['sometimes', 'boolean'],
        ]);

        $submit = (bool) ($validated['submit_for_review'] ?? false);
        $status = $submit ? 'pending_review' : 'draft';

        $minute = $meeting->minute()->updateOrCreate(
            ['meeting_id' => $meeting->id],
            [
                'recorded_by' => $existing->recorded_by ?? $request->user()->id,
                'content_summary' => $validated['content_summary'],
                'decisions' => $validated['decisions'],
                'status' => $status,
            ]
        );

        // ponytail: direct DB notices, add queued Mailable when email copy needed.
        if ($status === 'pending_review') {
            $now = now();
            $recipients = User::whereIn('role', ['pimpinan', 'admin'])->pluck('id');
            foreach ($recipients as $userId) {
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'App\Notifications\MinuteSubmitted',
                    'notifiable_type' => User::class,
                    'notifiable_id' => $userId,
                    'data' => json_encode(['minute_id' => $minute->id, 'meeting_id' => $meeting->id, 'title' => $meeting->title]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        return back();
    }

    public function approve(Request $request, MeetingMinute $minute)
    {
        Gate::authorize('approve', $minute);

        $validated = $request->validate([
            'action' => ['required', 'in:approve,revision'],
            'review_notes' => ['nullable', 'string'],
        ]);

        if ($validated['action'] === 'approve') {
            $minute->update([
                'status' => 'approved',
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_notes' => $validated['review_notes'] ?? null,
            ]);
        } else {
            $minute->update([
                'status' => 'draft',
                'review_notes' => $validated['review_notes'] ?? null,
            ]);
        }

        // ponytail: direct DB notices, add queued Mailable when email copy needed.
        $now = now();
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => 'App\Notifications\MinuteReviewed',
            'notifiable_type' => User::class,
            'notifiable_id' => $minute->recorded_by,
            'data' => json_encode(['minute_id' => $minute->id, 'meeting_id' => $minute->meeting_id, 'status' => $minute->fresh()->status]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return back();
    }

    public function exportPdf(MeetingMinute $minute)
    {
        Gate::authorize('view', $minute);

        $minute->load([
            'meeting.agendas',
            'meeting.attendees.user:id,name,position,department',
            'meeting.actionItems.pic:id,name',
            'recorder:id,name,position',
            'reviewer:id,name,position',
        ]);

        $meeting = $minute->meeting;

        $pdf = Pdf::loadView('pdf.meeting-minute', [
            'minute' => $minute,
            'meeting' => $meeting,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("notulen-{$meeting->id}.pdf");
    }
}
