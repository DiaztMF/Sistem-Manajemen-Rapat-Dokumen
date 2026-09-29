<?php

namespace App\Policies;

use App\Models\ActionItem;
use App\Models\User;

class ActionItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, ActionItem $item): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $item->pic_id === $user->id;
    }

    public function delete(User $user, ActionItem $item): bool
    {
        return $user->isAdmin();
    }
}
