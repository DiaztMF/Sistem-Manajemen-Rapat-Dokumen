<?php

use App\Models\ActionItem;
use App\Models\Meeting;
use App\Models\User;
use App\Notifications\MeetingInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardAndUserTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $email): User
    {
        $user = User::forceCreate([
            'name' => ucfirst($role).' '.$email,
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        return $user->fresh();
    }

    private function makeMeeting(User $creator, array $overrides = []): Meeting
    {
        return Meeting::create(array_merge([
            'title' => 'Rapat Test '.uniqid(),
            'description' => 'Deskripsi rapat test',
            'date' => now()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'Ruang Rapat 1',
            'status' => 'scheduled',
            'created_by' => $creator->id,
        ], $overrides));
    }

    public function test_user_can_access_dashboard_with_kpi_metrics(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $user = $this->makeUser('peserta', 'user@test.com');

        $meeting = $this->makeMeeting($sekretaris);
        $meeting->attendees()->create(['user_id' => $user->id, 'role_in_meeting' => 'participant']);

        ActionItem::create([
            'meeting_id' => $meeting->id,
            'pic_id' => $user->id,
            'title' => 'Tindak lanjut test',
            'due_date' => now()->addDays(3)->toDateString(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('totalMeetingsMonth')
            ->has('upcomingMeetingsCount')
            ->has('pendingActionItemsCount')
            ->has('recentDocumentsCount')
            ->has('upcomingMeetings')
            ->has('myActionItems')
            ->where('totalMeetingsMonth', fn ($v) => $v >= 1)
            ->where('upcomingMeetingsCount', fn ($v) => $v >= 1)
            ->where('pendingActionItemsCount', fn ($v) => $v >= 1)
        );
    }

    public function test_admin_can_manage_users(): void
    {
        $this->withoutVite();
        $admin = $this->makeUser('admin', 'admin@test.com');

        // listing
        $this->actingAs($admin)->get('/users')->assertOk();

        // create
        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Pegawai Baru',
            'email' => 'baru@test.com',
            'password' => 'password123',
            'role' => 'peserta',
            'position' => 'Staff IT',
            'department' => 'Teknologi Informasi',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'baru@test.com']);

        $newUser = User::where('email', 'baru@test.com')->first();

        // update
        $this->actingAs($admin)->from('/users')->put("/users/{$newUser->id}", [
            'name' => 'Pegawai Updated',
            'role' => 'sekretaris',
            'department' => 'Tata Usaha & Protokoler',
        ])->assertRedirect('/users');
        $this->assertDatabaseHas('users', [
            'id' => $newUser->id,
            'name' => 'Pegawai Updated',
            'role' => 'sekretaris',
        ]);

        // toggle active status
        $this->actingAs($admin)->from('/users')->patch("/users/{$newUser->id}", [
            'is_active' => false,
        ])->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['id' => $newUser->id, 'is_active' => false]);

        // delete other user
        $temp = $this->makeUser('peserta', 'temp@test.com');
        $this->actingAs($admin)->from('/users')->delete("/users/{$temp->id}")->assertRedirect('/users');
        $this->assertDatabaseMissing('users', ['id' => $temp->id]);

        // cannot delete own account
        $this->actingAs($admin)->from('/users')->delete("/users/{$admin->id}")->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $this->actingAs($peserta)->get('/users')->assertForbidden();
        $this->actingAs($peserta)->post('/users', [
            'name' => 'Ilegal',
            'email' => 'ilegal@test.com',
            'password' => 'password123',
            'role' => 'peserta',
        ])->assertForbidden();
    }

    public function test_notification_listing_and_mark_as_read(): void
    {
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $user = $this->makeUser('peserta', 'notif@test.com');

        $meeting = $this->makeMeeting($sekretaris);

        $user->notify(new MeetingInvitationNotification($meeting));
        $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());

        // listing
        $this->actingAs($user)->getJson('/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonStructure(['notifications', 'unread_count']);

        // mark single as read
        $notificationId = $user->fresh()->notifications()->first()->id;
        $this->actingAs($user)->patchJson("/notifications/{$notificationId}/read")->assertOk();
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());

        // mark all as read
        $user->notify(new MeetingInvitationNotification($meeting));
        $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());
        $this->actingAs($user)->patchJson('/notifications/read-all')->assertOk();
        $this->assertEquals(0, $user->fresh()->unreadNotifications()->count());
    }
}
