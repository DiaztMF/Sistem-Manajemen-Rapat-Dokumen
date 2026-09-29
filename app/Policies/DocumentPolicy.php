<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function download(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (! $document->meeting_id) {
            return true;
        }

        return $document->meeting->attendees()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->isAdmin() || $document->uploader_id === $user->id;
    }
}
