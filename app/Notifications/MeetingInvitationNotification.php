<?php

namespace App\Notifications;

use App\Models\Meeting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MeetingInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public Meeting $meeting) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Undangan Rapat Baru',
            'message' => "Anda diundang ke rapat '{$this->meeting->title}' pada {$this->meeting->date->format('d M Y')}.",
            'url' => route('meetings.show', $this->meeting->id),
            'meeting_id' => $this->meeting->id,
        ];
    }
}
