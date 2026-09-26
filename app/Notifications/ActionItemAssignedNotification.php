<?php

namespace App\Notifications;

use App\Models\ActionItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ActionItemAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public ActionItem $actionItem) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Tugas Tindak Lanjut Baru',
            'message' => "Anda ditugaskan pada tindak lanjut: '{$this->actionItem->title}' dengan tenggat waktu {$this->actionItem->due_date->format('d M Y')}.",
            'url' => route('meetings.show', $this->actionItem->meeting_id),
            'action_item_id' => $this->actionItem->id,
            'meeting_id' => $this->actionItem->meeting_id,
        ];
    }
}
