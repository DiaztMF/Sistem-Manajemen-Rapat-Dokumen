<?php

use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingMinuteTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $email): User
    {
        $user = User::forceCreate([
            'name' => ucfirst($role),
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        return $user->fresh();
    }

    public function test_admin_can_save_and_submit_minutes(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);

        $response = $this->actingAs($admin)->post("/meetings/{$meeting->id}/minutes", [
            'content_summary' => 'Pembahasan terkait anggaran',
            'decisions' => 'Anggaran disetujui sebesar 100jt',
            'submit_for_review' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_minutes', [
            'meeting_id' => $meeting->id,
            'status' => 'pending_review',
        ]);
    }

    public function test_admin_can_approve_minutes(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $admin->id,
            'content_summary' => 'Summary',
            'decisions' => 'Decisions',
            'status' => 'pending_review',
        ]);

        $response = $this->actingAs($admin)->patch("/minutes/{$minute->id}/approve", [
            'action' => 'approve',
            'review_notes' => 'Disetujui tanpa revisi',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_minutes', [
            'id' => $minute->id,
            'status' => 'approved',
            'reviewed_by' => $admin->id,
        ]);
    }

    public function test_peserta_cannot_approve_minutes(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $admin->id,
            'content_summary' => 'Summary',
            'decisions' => 'Decisions',
            'status' => 'pending_review',
        ]);

        $this->actingAs($peserta)->patch("/minutes/{$minute->id}/approve", [
            'action' => 'approve',
        ])->assertForbidden();
    }

    public function test_can_download_pdf_for_meeting_minutes(): void
    {
        $admin = $this->makeUser('admin', 'admin2@test.com');
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $admin->id,
            'content_summary' => 'Summary',
            'decisions' => 'Decisions',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($admin)->get("/minutes/{$minute->id}/export-pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
