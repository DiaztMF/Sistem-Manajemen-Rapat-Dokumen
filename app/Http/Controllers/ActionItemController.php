<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ActionItemController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', ActionItem::class);

        $query = ActionItem::query()->with(['pic:id,name,email', 'meeting:id,title,date']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($picId = $request->integer('pic_id')) {
            $query->where('pic_id', $picId);
        }
        if ($meetingId = $request->integer('meeting_id')) {
            $query->where('meeting_id', $meetingId);
        }

        $items = $query->orderBy('due_date')->paginate(10)->withQueryString();

        return Inertia::render('action-items/index', [
            'actionItems' => $items,
            'filters' => $request->only(['status', 'pic_id', 'meeting_id']),
            'users' => User::where('is_active', true)->select(['id', 'name', 'email'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, Meeting $meeting)
    {
        Gate::authorize('create', ActionItem::class);

        $validated = $request->validate([
            'pic_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['required', 'date'],
        ]);

        $item = $meeting->actionItems()->create([
            'pic_id' => $validated['pic_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        // ponytail: direct DB notice, add queued Mailable when email copy needed.
        $now = now();
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => 'App\Notifications\ActionItemAssigned',
            'notifiable_type' => User::class,
            'notifiable_id' => $item->pic_id,
            'data' => json_encode(['action_item_id' => $item->id, 'meeting_id' => $meeting->id, 'title' => $item->title]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return back();
    }

    public function update(Request $request, ActionItem $actionItem)
    {
        Gate::authorize('update', $actionItem);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:pending,in_progress,completed'],
            'completion_notes' => ['nullable', 'string'],
        ]);

        $status = $validated['status'] ?? $actionItem->status;

        $actionItem->fill(collect($validated)->except(['status'])->toArray());
        $actionItem->status = $status;
        $actionItem->completed_at = $status === 'completed' ? now() : null;
        $actionItem->save();

        return back();
    }

    public function destroy(ActionItem $actionItem)
    {
        Gate::authorize('delete', $actionItem);

        $actionItem->delete();

        return back();
    }
}
