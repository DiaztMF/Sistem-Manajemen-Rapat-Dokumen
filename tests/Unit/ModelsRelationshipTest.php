<?php

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use App\Models\MeetingAgenda;
use App\Models\MeetingAttendee;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelsRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_meeting_has_complete_relationships(): void
    {
        $creator = User::create([
            'name' => 'Creator',
            'email' => 'creator@kantor.id',
            'password' => bcrypt('password'),
            'role' => 'sekretaris',
        ]);

        $attendeeUser = User::create([
            'name' => 'Attendee',
            'email' => 'attendee@kantor.id',
            'password' => bcrypt('password'),
            'role' => 'peserta',
        ]);

        $meeting = Meeting::create([
            'title' => 'Rapat Koordinasi',
            'date' => '2026-10-01',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'Ruang Rapat 1',
            'status' => 'scheduled',
            'created_by' => $creator->id,
        ]);

        $agenda = MeetingAgenda::create([
            'meeting_id' => $meeting->id,
            'title' => 'Pembahasan SOP',
            'order' => 1,
            'duration_minutes' => 45,
        ]);

        $attendee = MeetingAttendee::create([
            'meeting_id' => $meeting->id,
            'user_id' => $attendeeUser->id,
            'role_in_meeting' => 'participant',
            'presence_status' => 'present',
        ]);

        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $creator->id,
            'content_summary' => 'Ringkasan pembahasan',
            'decisions' => 'Keputusan rapat',
            'status' => 'approved',
        ]);

        $actionItem = ActionItem::create([
            'meeting_id' => $meeting->id,
            'minute_id' => $minute->id,
            'pic_id' => $attendeeUser->id,
            'title' => 'Revisi SOP Bab 2',
            'due_date' => '2026-10-10',
            'status' => 'pending',
        ]);

        $doc = Document::create([
            'meeting_id' => $meeting->id,
            'uploader_id' => $creator->id,
            'title' => 'Materi Paparan SOP',
            'file_name' => 'sop.pdf',
            'file_path' => 'documents/sop.pdf',
            'file_size' => 1024,
            'file_type' => 'pdf',
            'category' => 'materi',
        ]);

        $this->assertCount(1, $meeting->agendas);
        $this->assertCount(1, $meeting->attendees);
        $this->assertNotNull($meeting->minute);
        $this->assertCount(1, $meeting->actionItems);
        $this->assertCount(1, $meeting->documents);
        $this->assertEquals($creator->id, $meeting->creator->id);
    }
}
