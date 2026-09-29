<?php

use App\Models\ActionItem;
use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndToEndMeetingFlowTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $name, string $email, string $role): User
    {
        return User::forceCreate([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => $role,
            'email_verified_at' => now(),
            'is_active' => true,
        ])->fresh();
    }

    public function test_full_meeting_lifecycle(): void
    {
        $this->withoutVite();

        $admin = $this->makeUser('Admin', 'admin@k.id', 'admin');
        $peserta = $this->makeUser('Peserta', 'peserta@k.id', 'peserta');

        // 1. Create Meeting with Agenda and Attendees
        $createRes = $this->actingAs($admin)->post('/meetings', [
            'title' => 'Rapat Koordinasi E2E',
            'date' => '2026-11-20',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'R. Rapat 1',
            'agendas' => [
                ['title' => 'Agenda 1', 'order' => 1, 'duration_minutes' => 30],
            ],
            'attendees' => [
                ['user_id' => $peserta->id, 'role_in_meeting' => 'participant'],
            ],
        ]);
        $createRes->assertRedirect('/meetings');
        $meeting = Meeting::where('title', 'Rapat Koordinasi E2E')->first();
        $this->assertNotNull($meeting);

        // 2. Admin checks in attendee
        $attendee = $meeting->attendees->first();
        $this->actingAs($admin)->patch("/meetings/{$meeting->id}/attendees/{$attendee->id}", [
            'presence_status' => 'present',
        ])->assertSessionHasNoErrors();

        // 3. Create minutes and submit for review
        $this->actingAs($admin)->post("/meetings/{$meeting->id}/minutes", [
            'content_summary' => 'Hasil rapat e2e lengkap',
            'decisions' => 'Keputusan e2e sah',
            'submit_for_review' => true,
        ])->assertSessionHasNoErrors();

        $minute = $meeting->fresh()->minute;
        $this->assertEquals('pending_review', $minute->status);

        // 4. Admin approves minutes
        $this->actingAs($admin)->patch("/minutes/{$minute->id}/approve", [
            'action' => 'approve',
            'review_notes' => 'Disetujui',
        ])->assertSessionHasNoErrors();
        $this->assertEquals('approved', $minute->fresh()->status);

        // 5. Create action item
        $this->actingAs($admin)->post("/meetings/{$meeting->id}/action-items", [
            'pic_id' => $peserta->id,
            'title' => 'Follow up vendor',
            'due_date' => '2026-11-25',
        ])->assertSessionHasNoErrors();

        // 6. Peserta marks action item completed
        $item = $meeting->actionItems()->first();
        $this->actingAs($peserta)->patch("/action-items/{$item->id}", [
            'status' => 'completed',
            'completion_notes' => 'Sudah selesai',
        ])->assertSessionHasNoErrors();
        $this->assertEquals('completed', $item->fresh()->status);

        // 7. Export PDF
        $pdfRes = $this->actingAs($admin)->get("/minutes/{$minute->id}/export-pdf");
        $pdfRes->assertOk();
    }
}
