<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingAttendee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MeetingAttendeeController extends Controller
{
    public function update(Request $request, Meeting $meeting, MeetingAttendee $attendee)
    {
        Gate::authorize('update', $meeting);
        abort_if($attendee->meeting_id !== $meeting->id, 404);

        $validated = $request->validate([
            'presence_status' => ['required', 'in:pending,present,excused,absent'],
            'notes' => ['nullable', 'string'],
        ]);

        $attendee->update([
            'presence_status' => $validated['presence_status'],
            'notes' => $validated['notes'] ?? $attendee->notes,
            'presence_time' => $validated['presence_status'] === 'present' ? now() : $attendee->presence_time,
        ]);

        return back();
    }
}
