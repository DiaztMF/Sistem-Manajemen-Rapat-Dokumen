<?php

use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffMinuteViewTest extends TestCase
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

    private function makeMeetingWithMinute(User $creator): array
    {
        $meeting = Meeting::create(['title' => 'Rapat Rahasia', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $creator->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $creator->id,
            'content_summary' => 'Rahasia',
            'decisions' => 'Rahasia diputus',
            'status' => 'approved',
        ]);

        return [$meeting, $minute];
    }

    public function test_non_attendee_cannot_export_minute_pdf(): void
    {
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $outsider = $this->makeUser('peserta', 'outsider@test.com');
        [$meeting, $minute] = $this->makeMeetingWithMinute($sekretaris);

        $this->actingAs($outsider)->get("/minutes/{$minute->id}/export-pdf")->assertForbidden();
    }

    public function test_non_attendee_cannot_open_meeting_detail(): void
    {
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $outsider = $this->makeUser('peserta', 'outsider@test.com');
        [$meeting, $minute] = $this->makeMeetingWithMinute($sekretaris);

        $this->actingAs($outsider)->get("/meetings/{$meeting->id}")->assertForbidden();
    }

    public function test_attendee_can_export_minute_pdf(): void
    {
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');
        [$meeting, $minute] = $this->makeMeetingWithMinute($sekretaris);
        $meeting->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        $response = $this->actingAs($peserta)->get("/minutes/{$minute->id}/export-pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }

    public function test_pimpinan_can_export_minute_pdf(): void
    {
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $pimpinan = $this->makeUser('pimpinan', 'pimpinan@test.com');
        [$meeting, $minute] = $this->makeMeetingWithMinute($sekretaris);

        $this->actingAs($pimpinan)->get("/minutes/{$minute->id}/export-pdf")->assertOk();
    }
}
