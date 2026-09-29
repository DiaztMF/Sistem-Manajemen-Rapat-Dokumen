<?php

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingControllerTest extends TestCase
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

    public function test_admin_can_create_meeting_with_agendas_and_attendees(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $peserta = $this->makeUser('peserta', 'peserta1@test.com');

        $response = $this->actingAs($admin)->post('/meetings', [
            'title' => 'Rapat Kerja Tahunan',
            'description' => 'Membahas roadmap tahun depan',
            'date' => '2026-11-10',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'type' => 'offline',
            'location_or_link' => 'Auditorium',
            'agendas' => [
                ['title' => 'Pembukaan', 'description' => 'Sambutan', 'duration_minutes' => 30],
                ['title' => 'Paparan Divisi', 'description' => 'Presentasi', 'duration_minutes' => 90],
            ],
            'attendees' => [
                ['user_id' => $peserta->id, 'role_in_meeting' => 'participant'],
            ],
        ]);

        $response->assertRedirect('/meetings');
        $this->assertDatabaseHas('meetings', ['title' => 'Rapat Kerja Tahunan']);
        $this->assertDatabaseHas('meeting_agendas', ['title' => 'Pembukaan']);
        $this->assertDatabaseHas('meeting_attendees', ['user_id' => $peserta->id]);
    }

    public function test_peserta_cannot_create_meeting(): void
    {
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $response = $this->actingAs($peserta)->post('/meetings', [
            'title' => 'Rapat Ilegal',
            'date' => '2026-11-10',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'type' => 'offline',
            'location_or_link' => 'R. 1',
        ]);

        $response->assertForbidden();
    }

    public function test_can_update_attendee_presence(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $meeting = Meeting::create([
            'title' => 'Rapat Singkat',
            'date' => '2026-11-10',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'type' => 'offline',
            'location_or_link' => 'R. 1',
            'created_by' => $admin->id,
        ]);

        $attendee = $meeting->attendees()->create([
            'user_id' => $peserta->id,
            'role_in_meeting' => 'participant',
            'presence_status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->patch("/meetings/{$meeting->id}/attendees/{$attendee->id}", [
            'presence_status' => 'present',
            'notes' => 'Tepat waktu',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_attendees', [
            'id' => $attendee->id,
            'presence_status' => 'present',
        ]);
        $this->assertNotNull($attendee->fresh()->presence_time);
    }

    public function test_can_list_update_status_and_delete_meeting(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $meeting = Meeting::create([
            'title' => 'Rapat Status',
            'date' => '2026-11-10',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'type' => 'offline',
            'location_or_link' => 'R. 1',
            'status' => 'scheduled',
            'created_by' => $admin->id,
        ]);
        $meeting->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        $this->withoutVite();
        $this->actingAs($admin)->get('/meetings')->assertOk();
        $this->actingAs($admin)->get("/meetings/{$meeting->id}")->assertOk();

        foreach (['in_progress', 'completed', 'cancelled'] as $status) {
            $this->actingAs($admin)->patch("/meetings/{$meeting->id}/status", ['status' => $status])
                ->assertRedirect();
            $this->assertDatabaseHas('meetings', ['id' => $meeting->id, 'status' => $status]);
        }

        $this->actingAs($admin)->delete("/meetings/{$meeting->id}")->assertRedirect('/meetings');
        $this->assertDatabaseMissing('meetings', ['id' => $meeting->id]);
    }
}
