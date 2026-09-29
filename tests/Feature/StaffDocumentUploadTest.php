<?php

use App\Models\Document;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffDocumentUploadTest extends TestCase
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

    private function uploadPayload(): array
    {
        return [
            'title' => 'Materi Ilegal',
            'category' => 'materi',
            'file' => UploadedFile::fake()->create('ilegal.pdf', 500, 'application/pdf'),
        ];
    }

    public function test_peserta_cannot_upload_document(): void
    {
        Storage::fake('local');

        $peserta = $this->makeUser('peserta', 'peserta@test.com');

        $this->actingAs($peserta)->post('/documents', $this->uploadPayload())->assertForbidden();
        $this->assertEquals(0, Document::count());
    }

    public function test_admin_can_upload_document(): void
    {
        Storage::fake('local');

        $admin = $this->makeUser('admin', 'admin@test.com');
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);

        $response = $this->actingAs($admin)->post('/documents', array_merge($this->uploadPayload(), [
            'meeting_id' => $meeting->id,
        ]));

        $response->assertSessionHasNoErrors();
        $this->assertEquals(1, Document::count());
    }
}
