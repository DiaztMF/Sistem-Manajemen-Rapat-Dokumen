<?php

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ActionItemAndDocumentTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, string $email, string $name = 'User'): User
    {
        $user = User::forceCreate([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        return $user->fresh();
    }

    public function test_can_create_and_update_action_item(): void
    {
        $admin = $this->makeUser('admin', 'admin@test.com', 'Admin');
        $pic = $this->makeUser('peserta', 'pic@test.com', 'PIC User');
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);

        $response = $this->actingAs($admin)->post("/meetings/{$meeting->id}/action-items", [
            'pic_id' => $pic->id,
            'title' => 'Buat Laporan Mingguan',
            'due_date' => '2026-11-15',
            'description' => 'Format excel',
        ]);

        $response->assertSessionHasNoErrors();
        $item = ActionItem::first();
        $this->assertNotNull($item);

        // PIC updates status
        $this->actingAs($pic)->patch("/action-items/{$item->id}", [
            'status' => 'completed',
            'completion_notes' => 'Sudah dikirim via email',
        ])->assertSessionHasNoErrors();

        $this->assertEquals('completed', $item->fresh()->status);
    }

    public function test_secure_document_upload_and_download(): void
    {
        Storage::fake('local');

        $admin = $this->makeUser('admin', 'admin@test.com', 'Admin');
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);

        $file = UploadedFile::fake()->create('materi-presentasi.pdf', 500, 'application/pdf');

        $uploadResponse = $this->actingAs($admin)->post('/documents', [
            'meeting_id' => $meeting->id,
            'title' => 'Materi Rapat Divisi',
            'category' => 'materi',
            'file' => $file,
        ]);

        $uploadResponse->assertSessionHasNoErrors();
        $doc = Document::first();
        $this->assertNotNull($doc);
        Storage::disk('local')->assertExists($doc->file_path);

        // Download check
        $downloadResponse = $this->actingAs($admin)->get("/documents/{$doc->id}/download");
        $downloadResponse->assertOk();
    }

    public function test_can_delete_action_item_and_document_with_file(): void
    {
        Storage::fake('local');

        $admin = $this->makeUser('admin', 'admin@test.com', 'Admin');
        $pic = $this->makeUser('peserta', 'pic@test.com', 'PIC');
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $admin->id]);

        $item = ActionItem::create([
            'meeting_id' => $meeting->id,
            'pic_id' => $pic->id,
            'title' => 'Tugas hapus',
            'due_date' => '2026-11-15',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->delete("/action-items/{$item->id}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('action_items', ['id' => $item->id]);

        $file = UploadedFile::fake()->create('hapus.pdf', 100, 'application/pdf');
        $this->actingAs($admin)->post('/documents', [
            'title' => 'Hapus',
            'category' => 'materi',
            'file' => $file,
        ])->assertSessionHasNoErrors();
        $doc = Document::first();
        $path = $doc->file_path;

        $this->actingAs($admin)->delete("/documents/{$doc->id}")->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('documents', ['id' => $doc->id]);
        Storage::disk('local')->assertMissing($path);
    }
}
