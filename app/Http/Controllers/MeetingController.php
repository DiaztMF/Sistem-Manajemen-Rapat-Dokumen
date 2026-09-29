<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Meeting::class);

        $user = $request->user();
        $baseQuery = Meeting::query()->with(['creator:id,name', 'attendees'])->withCount(['agendas', 'attendees']);

        if (! $user->isAdmin()) {
            $baseQuery->whereHas('attendees', fn ($q) => $q->where('user_id', $user->id));
        }

        $query = clone $baseQuery;

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($search = $request->string('search')->toString()) {
            $query->where('title', 'like', "%{$search}%");
        }
        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }
        if ($date = $request->string('date')->toString()) {
            $query->whereDate('date', $date);
        }

        $meetings = $query->latest('date')->paginate(10)->withQueryString();

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'scheduled' => (clone $baseQuery)->where('status', 'scheduled')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
        ];

        return Inertia::render('meetings/index', [
            'meetings' => $meetings,
            'filters' => $request->only(['status', 'search', 'type', 'date']),
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Meeting::class);

        return Inertia::render('meetings/create', [
            'users' => User::where('is_active', true)
                ->select(['id', 'name', 'email', 'department', 'position', 'role'])
                ->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Meeting::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'type' => ['required', 'in:offline,online,hybrid'],
            'location_or_link' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:draft,scheduled,in_progress,completed,cancelled'],
            'agendas' => ['sometimes', 'array'],
            'agendas.*.title' => ['required_with:agendas', 'string', 'max:255'],
            'agendas.*.description' => ['nullable', 'string'],
            'agendas.*.duration_minutes' => ['nullable', 'integer', 'min:1'],
            'attendees' => ['sometimes', 'array'],
            'attendees.*.user_id' => ['required_with:attendees', 'exists:users,id'],
            'attendees.*.role_in_meeting' => ['sometimes', 'in:leader,notetaker,participant'],
        ]);

        $meeting = Meeting::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'type' => $validated['type'],
            'location_or_link' => $validated['location_or_link'],
            'status' => $validated['status'] ?? 'scheduled',
            'created_by' => $request->user()->id,
        ]);

        foreach ($validated['agendas'] ?? [] as $i => $agenda) {
            $meeting->agendas()->create([
                'title' => $agenda['title'],
                'description' => $agenda['description'] ?? null,
                'order' => $i + 1,
                'duration_minutes' => $agenda['duration_minutes'] ?? null,
            ]);
        }

        $attendeeRows = [];
        foreach ($validated['attendees'] ?? [] as $attendee) {
            $row = $meeting->attendees()->updateOrCreate(
                ['user_id' => $attendee['user_id']],
                ['role_in_meeting' => $attendee['role_in_meeting'] ?? 'participant']
            );
            $attendeeRows[] = $row;
        }

        // ponytail: direct DB notices, add queued Mailable when email copy needed.
        $now = now();
        foreach ($attendeeRows as $row) {
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\MeetingInvitation',
                'notifiable_type' => User::class,
                'notifiable_id' => $row->user_id,
                'data' => json_encode(['meeting_id' => $meeting->id, 'title' => $meeting->title]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return redirect('/meetings');
    }

    public function show(Meeting $meeting)
    {
        Gate::authorize('view', $meeting);

        $meeting->load([
            'creator:id,name,email',
            'agendas',
            'attendees.user:id,name,email,department,position',
            'minute.recorder:id,name',
            'minute.reviewer:id,name',
            'actionItems.pic:id,name',
            'documents.uploader:id,name',
        ]);

        return Inertia::render('meetings/show', [
            'meeting' => $meeting,
            'users' => User::where('is_active', true)
                ->select(['id', 'name', 'email', 'department', 'role'])
                ->orderBy('name')->get(),
        ]);
    }

    public function edit(Meeting $meeting)
    {
        Gate::authorize('update', $meeting);

        $meeting->load(['agendas', 'attendees.user:id,name,email']);

        return Inertia::render('meetings/edit', [
            'meeting' => $meeting,
            'users' => User::where('is_active', true)
                ->select(['id', 'name', 'email', 'department', 'position', 'role'])
                ->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Meeting $meeting)
    {
        Gate::authorize('update', $meeting);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['sometimes', 'date'],
            'start_time' => ['sometimes'],
            'end_time' => ['sometimes'],
            'type' => ['sometimes', 'in:offline,online,hybrid'],
            'location_or_link' => ['sometimes', 'string', 'max:255'],
            'agendas' => ['sometimes', 'array'],
            'agendas.*.title' => ['required_with:agendas', 'string', 'max:255'],
            'agendas.*.description' => ['nullable', 'string'],
            'agendas.*.duration_minutes' => ['nullable', 'integer', 'min:1'],
            'attendees' => ['sometimes', 'array'],
            'attendees.*.user_id' => ['required_with:attendees', 'exists:users,id'],
            'attendees.*.role_in_meeting' => ['sometimes', 'in:leader,notetaker,participant'],
        ]);

        $meeting->update(collect($validated)->except(['agendas', 'attendees'])->toArray());

        if (array_key_exists('agendas', $validated)) {
            $meeting->agendas()->delete();
            foreach ($validated['agendas'] as $i => $agenda) {
                $meeting->agendas()->create([
                    'title' => $agenda['title'],
                    'description' => $agenda['description'] ?? null,
                    'order' => $i + 1,
                    'duration_minutes' => $agenda['duration_minutes'] ?? null,
                ]);
            }
        }

        if (array_key_exists('attendees', $validated)) {
            $ids = collect($validated['attendees'])->pluck('user_id')->all();
            $meeting->attendees()->whereNotIn('user_id', $ids)->delete();
            foreach ($validated['attendees'] as $attendee) {
                $meeting->attendees()->updateOrCreate(
                    ['user_id' => $attendee['user_id']],
                    ['role_in_meeting' => $attendee['role_in_meeting'] ?? 'participant']
                );
            }
        }

        return redirect("/meetings/{$meeting->id}");
    }

    public function updateStatus(Request $request, Meeting $meeting)
    {
        Gate::authorize('update', $meeting);

        $validated = $request->validate([
            'status' => ['required', 'in:draft,scheduled,in_progress,completed,cancelled'],
        ]);

        $meeting->update(['status' => $validated['status']]);

        return back();
    }

    public function destroy(Meeting $meeting)
    {
        Gate::authorize('delete', $meeting);

        $meeting->delete();

        return redirect('/meetings');
    }
}
