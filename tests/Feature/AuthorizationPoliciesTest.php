<?php

use App\Models\ActionItem;
use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationPoliciesTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_authorized_users_can_create_meetings(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret', 'role' => 'admin']);
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $peserta = User::create(['name' => 'Peserta', 'email' => 'peserta@test.com', 'password' => 'secret', 'role' => 'peserta']);

        $this->assertTrue($admin->can('create', Meeting::class));
        $this->assertTrue($sekretaris->can('create', Meeting::class));
        $this->assertFalse($peserta->can('create', Meeting::class));
    }

    public function test_only_pimpinan_or_admin_can_approve_minutes(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret', 'role' => 'admin']);
        $pimpinan = User::create(['name' => 'Pimpinan', 'email' => 'pimpinan@test.com', 'password' => 'secret', 'role' => 'pimpinan']);
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);

        $meeting = Meeting::create([
            'title' => 'Test Meeting',
            'date' => '2026-10-01',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'R. Rapat',
            'created_by' => $sekretaris->id,
        ]);

        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $sekretaris->id,
            'status' => 'pending_review',
        ]);

        $this->assertTrue($admin->can('approve', $minute));
        $this->assertTrue($pimpinan->can('approve', $minute));
        $this->assertFalse($sekretaris->can('approve', $minute));
    }
}
