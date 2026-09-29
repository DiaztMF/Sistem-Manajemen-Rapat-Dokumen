<?php

namespace App\Policies;

use App\Models\MeetingMinute;
use App\Models\User;

class MeetingMinutePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MeetingMinute $minute): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $minute->meeting->attendees()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin();
    }

    public function submitForReview(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin();
    }

    public function approve(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin();
    }
}
