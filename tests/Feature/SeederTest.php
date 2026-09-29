<?php

use App\Models\ActionItem;
use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_populates_all_roles_and_realistic_meetings(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@kantor.id', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'pimpinan@kantor.id', 'role' => 'peserta']);
        $this->assertDatabaseHas('users', ['email' => 'sekretaris@kantor.id', 'role' => 'peserta']);
        $this->assertDatabaseHas('users', ['email' => 'ti.andi@kantor.id', 'role' => 'peserta']);
        $this->assertEquals(0, User::whereIn('role', ['sekretaris', 'pimpinan'])->count());

        $this->assertTrue(Meeting::count() >= 3);
        $this->assertTrue(MeetingMinute::where('status', 'approved')->exists());
        $this->assertTrue(ActionItem::count() >= 3);
    }
}
