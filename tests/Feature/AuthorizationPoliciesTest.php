<?php

use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationPoliciesTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admin_can_create_meetings(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret', 'role' => 'admin']);
        $peserta = User::create(['name' => 'Peserta', 'email' => 'peserta@test.com', 'password' => 'secret', 'role' => 'peserta']);
        $legacy = User::create(['name' => 'Legacy', 'email' => 'legacy@test.com', 'password' => 'secret', 'role' => 'sekretaris']);

        $this->assertTrue($admin->can('create', Meeting::class));
        $this->assertFalse($peserta->can('create', Meeting::class));
        $this->assertFalse($legacy->can('create', Meeting::class));
    }

    public function test_only_admin_can_approve_minutes(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret', 'role' => 'admin']);
        $peserta = User::create(['name' => 'Peserta', 'email' => 'peserta@test.com', 'password' => 'secret', 'role' => 'peserta']);
        $legacy = User::create(['name' => 'Legacy', 'email' => 'legacy@test.com', 'password' => 'secret', 'role' => 'pimpinan']);

        $meeting = Meeting::create([
            'title' => 'Test Meeting',
            'date' => '2026-10-01',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'R. Rapat',
            'created_by' => $admin->id,
        ]);

        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $admin->id,
            'status' => 'pending_review',
        ]);

        $this->assertTrue($admin->can('approve', $minute));
        $this->assertFalse($peserta->can('approve', $minute));
        $this->assertFalse($legacy->can('approve', $minute));
    }
}
