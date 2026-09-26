<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;

class MeetingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Meeting $meeting): bool
    {
        if ($user->isAdmin() || $user->isSekretaris() || $user->isPimpinan()) {
            return true;
        }

        return $meeting->attendees()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function update(User $user, Meeting $meeting): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function delete(User $user, Meeting $meeting): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }
}
