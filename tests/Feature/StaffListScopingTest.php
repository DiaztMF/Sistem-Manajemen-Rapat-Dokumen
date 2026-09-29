<?php

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffListScopingTest extends TestCase
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

    private function makeMeeting(User $creator, string $title): Meeting
    {
        return Meeting::create(['title' => $title, 'date' => now()->toDateString(), 'start_time' => '09:00', 'end_time' => '10:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $creator->id]);
    }

    public function test_peserta_meeting_list_only_shows_attended_meetings(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $mine = $this->makeMeeting($sekretaris, 'Rapat Saya Ikuti');
        $other = $this->makeMeeting($sekretaris, 'Rapat Orang Lain');
        $mine->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        $this->actingAs($peserta)->get('/meetings')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('meetings/index')
            ->has('meetings.data', 1)
            ->where('meetings.data.0.title', 'Rapat Saya Ikuti')
            ->where('stats.total', 1)
        );
    }

    public function test_peserta_document_list_only_shows_relevant_documents(): void
    {
        Storage::fake('local');
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $mine = $this->makeMeeting($sekretaris, 'Rapat Saya Ikuti');
        $other = $this->makeMeeting($sekretaris, 'Rapat Orang Lain');
        $mine->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        foreach ([[$mine->id, 'Dokumen Rapat Saya'], [$other->id, 'Dokumen Rapat Lain'], [null, 'Dokumen Umum']] as [$meetingId, $title]) {
            Document::create([
                'meeting_id' => $meetingId,
                'uploader_id' => $sekretaris->id,
                'title' => $title,
                'file_name' => 'f.pdf',
                'file_path' => 'documents/f.pdf',
                'file_size' => 100,
                'file_type' => 'pdf',
                'category' => 'materi',
            ]);
        }

        $this->actingAs($peserta)->get('/documents')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents.data', 2)
        );
    }

    public function test_peserta_minute_list_only_shows_attended_meetings(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $mine = $this->makeMeeting($sekretaris, 'Rapat Saya Ikuti');
        $other = $this->makeMeeting($sekretaris, 'Rapat Orang Lain');
        $mine->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        foreach ([$mine, $other] as $m) {
            MeetingMinute::create([
                'meeting_id' => $m->id,
                'recorded_by' => $sekretaris->id,
                'content_summary' => 'Summary',
                'decisions' => 'Decisions',
                'status' => 'approved',
            ]);
        }

        $this->actingAs($peserta)->get('/minutes')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('minutes/index')
            ->has('minutes.data', 1)
        );
    }

    public function test_peserta_action_item_list_only_shows_own_tasks(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');
        $other = $this->makeUser('peserta', 'other@test.com');

        $meeting = $this->makeMeeting($sekretaris, 'Rapat');
        $meeting->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        ActionItem::create(['meeting_id' => $meeting->id, 'pic_id' => $peserta->id, 'title' => 'Tugas Saya', 'due_date' => now()->addDay()->toDateString(), 'status' => 'pending']);
        ActionItem::create(['meeting_id' => $meeting->id, 'pic_id' => $other->id, 'title' => 'Tugas Orang', 'due_date' => now()->addDay()->toDateString(), 'status' => 'pending']);

        $this->actingAs($peserta)->get('/action-items')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('action-items/index')
            ->has('actionItems.data', 1)
            ->where('actionItems.data.0.title', 'Tugas Saya')
        );
    }

    public function test_peserta_dashboard_counts_are_scoped(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $mine = $this->makeMeeting($sekretaris, 'Rapat Saya Ikuti');
        $this->makeMeeting($sekretaris, 'Rapat Orang Lain');
        $mine->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        ActionItem::create(['meeting_id' => $mine->id, 'pic_id' => $peserta->id, 'title' => 'Tugas Saya', 'due_date' => now()->addDay()->toDateString(), 'status' => 'pending']);

        $this->actingAs($peserta)->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('totalMeetingsMonth', 1)
            ->where('upcomingMeetingsCount', 1)
            ->where('pendingActionItemsCount', 1)
            ->has('upcomingMeetings', 1)
        );
    }

    public function test_sekretaris_still_sees_everything(): void
    {
        $this->withoutVite();
        $sekretaris = $this->makeUser('sekretaris', 'sekretaris@test.com');
        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $a = $this->makeMeeting($sekretaris, 'Rapat A');
        $b = $this->makeMeeting($sekretaris, 'Rapat B');
        $a->attendees()->create(['user_id' => $peserta->id, 'role_in_meeting' => 'participant']);

        $this->actingAs($sekretaris)->get('/meetings')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('meetings.data', 2)
            ->where('stats.total', 2)
        );
    }
}
