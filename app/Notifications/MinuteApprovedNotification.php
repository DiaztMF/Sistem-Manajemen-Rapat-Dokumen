<?php

namespace App\Notifications;

use App\Models\MeetingMinute;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MinuteApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(public MeetingMinute $minute) {}

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
        $meeting = $this->minute->meeting;
        $title = $meeting ? $meeting->title : 'Rapat';

        return [
            'title' => 'Notulen Rapat Telah Disetujui',
            'message' => "Notulen untuk rapat '{$title}' telah disetujui oleh Pimpinan.",
            'url' => $meeting ? route('meetings.show', $meeting->id) : route('minutes.index'),
            'minute_id' => $this->minute->id,
            'meeting_id' => $this->minute->meeting_id,
        ];
    }
}
