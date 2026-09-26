<?php

namespace App\Policies;

use App\Models\MeetingMinute;
use App\Models\User;

class MeetingMinutePolicy
{
    public function view(User $user, MeetingMinute $minute): bool
    {
        return true;
    }

    public function update(User $user, MeetingMinute $minute): bool
    {
        if ($minute->status === 'approved' && ! $user->isPimpinan() && ! $user->isAdmin()) {
            return false;
        }

        return $user->isAdmin() || $user->isSekretaris();
    }

    public function submitForReview(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function approve(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin() || $user->role === 'pimpinan';
    }
}
