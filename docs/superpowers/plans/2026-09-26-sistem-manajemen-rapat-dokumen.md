# Sistem Manajemen Rapat dan Dokumen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun website sistem manajemen rapat dan dokumen kantor terintegrasi untuk mengelola jadwal rapat, agenda, presensi peserta, notulen dengan alur approval pimpinan, ekspor PDF resmi, penugasan tindak lanjut (*action items*), repositori dokumen aman, notifikasi in-app, dan manajemen pengguna.

**Architecture:** Monolit terintegrasi menggunakan Laravel 13 + Inertia.js React 19 + TypeScript + Tailwind CSS v4. Database SQLite relasional penuh dengan referential integrity. Otorisasi berbasis Laravel Policy untuk 4 role hierarkis (`admin`, `sekretaris`, `pimpinan`, `peserta`). Dokumen disimpan pada storage privat dengan akses unduh terproteksi. Notulen rapat dapat diekspor menjadi berkas PDF resmi ber-kop surat menggunakan `barryvdh/laravel-dompdf`.

**Tech Stack:** PHP 8.3+, Laravel 13, Inertia.js 3, React 19, TypeScript 5.7+, Tailwind CSS 4, Radix UI, Lucide React, Sonner, barryvdh/laravel-dompdf, SQLite.

## Global Constraints

- Database: SQLite (`database/database.sqlite`), wajib foreign key enabled.
- Role pengguna: `admin`, `sekretaris`, `pimpinan`, `peserta`.
- Semua file dokumen disimpan pada private storage `storage/app/documents/`, tidak boleh ada URL publik direct link.
- Download dokumen hanya via endpoint terlindungi `GET /documents/{document}/download` yang diverifikasi via policy.
- TypeScript strict, dilarang menggunakan `any` tanpa alasan jelas, dilarang `@ts-ignore`.
- UI/UX responsif, mendukung Dark/Light mode konsisten dengan starter kit shadcn/radix yang ada.

---

### Task 1: Package Dependency & Database Migrations

**Files:**
- Create: `database/migrations/2026_09_26_000001_add_office_columns_to_users_table.php`
- Create: `database/migrations/2026_09_26_000002_create_meetings_table.php`
- Create: `database/migrations/2026_09_26_000003_create_meeting_agendas_table.php`
- Create: `database/migrations/2026_09_26_000004_create_meeting_attendees_table.php`
- Create: `database/migrations/2026_09_26_000005_create_meeting_minutes_table.php`
- Create: `database/migrations/2026_09_26_000006_create_action_items_table.php`
- Create: `database/migrations/2026_09_26_000007_create_documents_table.php`
- Create: `database/migrations/2026_09_26_000008_create_notifications_table.php`
- Modify: `composer.json`

**Interfaces:**
- Consumes: None
- Produces: Database schema for `users`, `meetings`, `meeting_agendas`, `meeting_attendees`, `meeting_minutes`, `action_items`, `documents`, `notifications`.

- [ ] **Step 1: Install barryvdh/laravel-dompdf**

Run:
```bash
composer require barryvdh/laravel-dompdf
```

- [ ] **Step 2: Create users table modification migration**

File: `database/migrations/2026_09_26_000001_add_office_columns_to_users_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('peserta')->after('password'); // admin, sekretaris, pimpinan, peserta
            $table->string('position')->nullable()->after('role'); // e.g. "Kepala Divisi TI"
            $table->string('department')->nullable()->after('position'); // e.g. "Teknologi Informasi"
            $table->string('phone')->nullable()->after('department');
            $table->boolean('is_active')->default(true)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'position', 'department', 'phone', 'is_active']);
        });
    }
};
```

- [ ] **Step 3: Create meetings table migration**

File: `database/migrations/2026_09_26_000002_create_meetings_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('type')->default('offline'); // offline, online, hybrid
            $table->string('location_or_link');
            $table->string('status')->default('scheduled'); // draft, scheduled, in_progress, completed, cancelled
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
```

- [ ] **Step 4: Create meeting_agendas table migration**

File: `database/migrations/2026_09_26_000003_create_meeting_agendas_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_agendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('meetings')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order')->default(1);
            $table->integer('duration_minutes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_agendas');
    }
};
```

- [ ] **Step 5: Create meeting_attendees table migration**

File: `database/migrations/2026_09_26_000004_create_meeting_attendees_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('meetings')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_in_meeting')->default('participant'); // leader, notetaker, participant
            $table->string('presence_status')->default('pending'); // pending, present, excused, absent
            $table->timestamp('presence_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['meeting_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_attendees');
    }
};
```

- [ ] **Step 6: Create meeting_minutes table migration**

File: `database/migrations/2026_09_26_000005_create_meeting_minutes_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_minutes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->unique()->constrained('meetings')->cascadeOnDelete();
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->longText('content_summary')->nullable();
            $table->longText('decisions')->nullable();
            $table->string('status')->default('draft'); // draft, pending_review, approved
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_minutes');
    }
};
```

- [ ] **Step 7: Create action_items table migration**

File: `database/migrations/2026_09_26_000006_create_action_items_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('meetings')->cascadeOnDelete();
            $table->foreignId('minute_id')->nullable()->constrained('meeting_minutes')->nullOnDelete();
            $table->foreignId('pic_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->string('status')->default('pending'); // pending, in_progress, completed
            $table->text('completion_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('action_items');
    }
};
```

- [ ] **Step 8: Create documents table migration**

File: `database/migrations/2026_09_26_000007_create_documents_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->nullable()->constrained('meetings')->nullOnDelete();
            $table->foreignId('uploader_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('file_type');
            $table->string('category')->default('materi'); // undangan, materi, notulen_pdf, bukti_tindak_lanjut
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
```

- [ ] **Step 9: Create notifications table migration**

File: `database/migrations/2026_09_26_000008_create_notifications_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
```

- [ ] **Step 10: Run migration and verify tables**

Run: `php artisan migrate:fresh`
Expected: Migration tables created successfully without errors.

- [ ] **Step 11: Commit**

```bash
git add composer.json composer.lock database/migrations/
git commit -m "feat: add meeting system database migrations and dompdf package"
```

---

### Task 2: Eloquent Models & Entity Relationships

**Files:**
- Modify: `app/Models/User.php`
- Create: `app/Models/Meeting.php`
- Create: `app/Models/MeetingAgenda.php`
- Create: `app/Models/MeetingAttendee.php`
- Create: `app/Models/MeetingMinute.php`
- Create: `app/Models/ActionItem.php`
- Create: `app/Models/Document.php`
- Test: `tests/Unit/ModelsRelationshipTest.php`

**Interfaces:**
- Consumes: Database schema from Task 1
- Produces: Eloquent models with relations (`hasMany`, `belongsTo`, `belongsToMany`, scopes for filtering).

- [ ] **Step 1: Write test for models and relationships**

File: `tests/Unit/ModelsRelationshipTest.php`
```php
<?php

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use App\Models\MeetingAgenda;
use App\Models\MeetingAttendee;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelsRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_meeting_has_complete_relationships(): void
    {
        $creator = User::create([
            'name' => 'Creator',
            'email' => 'creator@kantor.id',
            'password' => bcrypt('password'),
            'role' => 'sekretaris',
        ]);

        $attendeeUser = User::create([
            'name' => 'Attendee',
            'email' => 'attendee@kantor.id',
            'password' => bcrypt('password'),
            'role' => 'peserta',
        ]);

        $meeting = Meeting::create([
            'title' => 'Rapat Koordinasi',
            'date' => '2026-10-01',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'Ruang Rapat 1',
            'status' => 'scheduled',
            'created_by' => $creator->id,
        ]);

        $agenda = MeetingAgenda::create([
            'meeting_id' => $meeting->id,
            'title' => 'Pembahasan SOP',
            'order' => 1,
            'duration_minutes' => 45,
        ]);

        $attendee = MeetingAttendee::create([
            'meeting_id' => $meeting->id,
            'user_id' => $attendeeUser->id,
            'role_in_meeting' => 'participant',
            'presence_status' => 'present',
        ]);

        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $creator->id,
            'content_summary' => 'Ringkasan pembahasan',
            'decisions' => 'Keputusan rapat',
            'status' => 'approved',
        ]);

        $actionItem = ActionItem::create([
            'meeting_id' => $meeting->id,
            'minute_id' => $minute->id,
            'pic_id' => $attendeeUser->id,
            'title' => 'Revisi SOP Bab 2',
            'due_date' => '2026-10-10',
            'status' => 'pending',
        ]);

        $doc = Document::create([
            'meeting_id' => $meeting->id,
            'uploader_id' => $creator->id,
            'title' => 'Materi Paparan SOP',
            'file_name' => 'sop.pdf',
            'file_path' => 'documents/sop.pdf',
            'file_size' => 1024,
            'file_type' => 'pdf',
            'category' => 'materi',
        ]);

        $this->assertCount(1, $meeting->agendas);
        $this->assertCount(1, $meeting->attendees);
        $this->assertNotNull($meeting->minute);
        $this->assertCount(1, $meeting->actionItems);
        $this->assertCount(1, $meeting->documents);
        $this->assertEquals($creator->id, $meeting->creator->id);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Unit/ModelsRelationshipTest.php`
Expected: FAIL (models not found or relations missing)

- [ ] **Step 3: Update User model with extra fillable and role helper methods**

Modify: `app/Models/User.php`
Ensure `#[Fillable]` includes:
`['name', 'email', 'password', 'role', 'position', 'department', 'phone', 'is_active']`
Add helper methods:
```php
public function isAdmin(): bool
{
    return $this->role === 'admin';
}

public function isSekretaris(): bool
{
    return in_array($this->role, ['admin', 'sekretaris'], true);
}

public function isPimpinan(): bool
{
    return in_array($this->role, ['admin', 'pimpinan'], true);
}

public function meetingsCreated()
{
    return $this->hasMany(Meeting::class, 'created_by');
}

public function meetingAttendances()
{
    return $this->hasMany(MeetingAttendee::class, 'user_id');
}

public function assignedActionItems()
{
    return $this->hasMany(ActionItem::class, 'pic_id');
}
```

- [ ] **Step 4: Create Meeting model**

File: `app/Models/Meeting.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'start_time',
        'end_time',
        'type',
        'location_or_link',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function agendas(): HasMany
    {
        return $this->hasMany(MeetingAgenda::class)->orderBy('order');
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(MeetingAttendee::class);
    }

    public function minute(): HasOne
    {
        return $this->hasOne(MeetingMinute::class);
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(ActionItem::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
```

- [ ] **Step 5: Create MeetingAgenda, MeetingAttendee, MeetingMinute, ActionItem, Document models**

Create `app/Models/MeetingAgenda.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingAgenda extends Model
{
    use HasFactory;

    protected $fillable = ['meeting_id', 'title', 'description', 'order', 'duration_minutes'];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }
}
```

Create `app/Models/MeetingAttendee.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingAttendee extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'user_id',
        'role_in_meeting',
        'presence_status',
        'presence_time',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'presence_time' => 'datetime',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

Create `app/Models/MeetingMinute.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingMinute extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'recorded_by',
        'content_summary',
        'decisions',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(ActionItem::class, 'minute_id');
    }
}
```

Create `app/Models/ActionItem.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'minute_id',
        'pic_id',
        'title',
        'description',
        'due_date',
        'status',
        'completion_notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function minute(): BelongsTo
    {
        return $this->belongsTo(MeetingMinute::class, 'minute_id');
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_id');
    }
}
```

Create `app/Models/Document.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'uploader_id',
        'title',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'category',
    ];

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test tests/Unit/ModelsRelationshipTest.php`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Models/ tests/Unit/ModelsRelationshipTest.php
git commit -m "feat: implement Eloquent models and relations"
```

---

### Task 3: Comprehensive Multi-Department Seeder

**Files:**
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: `tests/Feature/SeederTest.php`

**Interfaces:**
- Consumes: Models from Task 2
- Produces: Populated sample database with 4 departments, 7 multi-role users, sample meetings across draft/scheduled/in_progress/completed statuses, agendas, attendees, minutes, action items, and documents.

- [ ] **Step 1: Write test for Seeder verification**

File: `tests/Feature/SeederTest.php`
```php
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
        $this->assertDatabaseHas('users', ['email' => 'pimpinan@kantor.id', 'role' => 'pimpinan']);
        $this->assertDatabaseHas('users', ['email' => 'sekretaris@kantor.id', 'role' => 'sekretaris']);
        $this->assertDatabaseHas('users', ['email' => 'ti.andi@kantor.id', 'role' => 'peserta']);

        $this->assertTrue(Meeting::count() >= 3);
        $this->assertTrue(MeetingMinute::where('status', 'approved')->exists());
        $this->assertTrue(ActionItem::count() >= 3);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/SeederTest.php`
Expected: FAIL (seeder not populated)

- [ ] **Step 3: Implement DatabaseSeeder**

File: `database/seeders/DatabaseSeeder.php`
```php
<?php

namespace Database\Seeders;

use App\Models\ActionItem;
use App\Models\Document;
use App\Models\Meeting;
use App\Models\MeetingAgenda;
use App\Models\MeetingAttendee;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $admin = User::create([
            'name' => 'Budi Pratama',
            'email' => 'admin@kantor.id',
            'password' => $password,
            'role' => 'admin',
            'position' => 'Administrator Sistem',
            'department' => 'Teknologi Informasi',
            'phone' => '081234567801',
            'email_verified_at' => now(),
        ]);

        $pimpinan = User::create([
            'name' => 'Dr. H. Hendra Wijaya',
            'email' => 'pimpinan@kantor.id',
            'password' => $password,
            'role' => 'pimpinan',
            'position' => 'Direktur Utama',
            'department' => 'Manajemen Eksekutif',
            'phone' => '081234567802',
            'email_verified_at' => now(),
        ]);

        $sekretaris = User::create([
            'name' => 'Siti Rahmawati',
            'email' => 'sekretaris@kantor.id',
            'password' => $password,
            'role' => 'sekretaris',
            'position' => 'Sekretaris Eksekutif',
            'department' => 'Tata Usaha & Protokoler',
            'phone' => '081234567803',
            'email_verified_at' => now(),
        ]);

        $tiAndi = User::create([
            'name' => 'Andi Saputra',
            'email' => 'ti.andi@kantor.id',
            'password' => $password,
            'role' => 'peserta',
            'position' => 'Kepala Divisi TI',
            'department' => 'Teknologi Informasi',
            'phone' => '081234567804',
            'email_verified_at' => now(),
        ]);

        $sdmMaya = User::create([
            'name' => 'Maya Anggraini',
            'email' => 'sdm.maya@kantor.id',
            'password' => $password,
            'role' => 'peserta',
            'position' => 'Kepala Divisi SDM',
            'department' => 'Sumber Daya Manusia',
            'phone' => '081234567805',
            'email_verified_at' => now(),
        ]);

        $keuReza = User::create([
            'name' => 'Reza Pahlevi',
            'email' => 'keuangan.reza@kantor.id',
            'password' => $password,
            'role' => 'peserta',
            'position' => 'Analis Keuangan',
            'department' => 'Keuangan & Akuntansi',
            'phone' => '081234567806',
            'email_verified_at' => now(),
        ]);

        $opsDewi = User::create([
            'name' => 'Dewi Lestari',
            'email' => 'operasional.dewi@kantor.id',
            'password' => $password,
            'role' => 'peserta',
            'position' => 'Supervisor Operasional',
            'department' => 'Operasional & Umum',
            'phone' => '081234567807',
            'email_verified_at' => now(),
        ]);

        // Meeting 1: Completed Meeting with Approved Minutes & Action Items
        $m1 = Meeting::create([
            'title' => 'Rapat Evaluasi Triwulan Kinerja Operasional & Keuangan',
            'description' => 'Evaluasi capaian KPI operasional serta laporan keuangan kuartal berjalan kantor pusat.',
            'date' => Carbon::now()->subDays(5)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '11:30',
            'type' => 'offline',
            'location_or_link' => 'Ruang Rapat Utama Lantai 3',
            'status' => 'completed',
            'created_by' => $sekretaris->id,
        ]);

        MeetingAgenda::create([
            'meeting_id' => $m1->id,
            'title' => 'Pembukaan & Arahan Direktur Utama',
            'description' => 'Pengantar target strategi dan penekanan efisiensi anggaran.',
            'order' => 1,
            'duration_minutes' => 30,
        ]);
        MeetingAgenda::create([
            'meeting_id' => $m1->id,
            'title' => 'Pemaparan Kinerja Keuangan Triwulan',
            'description' => 'Realisasi penyerapan anggaran dan proyeksi cashflow kuartal berikutnya.',
            'order' => 2,
            'duration_minutes' => 60,
        ]);
        MeetingAgenda::create([
            'meeting_id' => $m1->id,
            'title' => 'Diskusi Hambatan Operasional Lapangan',
            'description' => 'Evaluasi kendala logistik, fasilitas gedung, dan kesiapan operasional.',
            'order' => 3,
            'duration_minutes' => 60,
        ]);

        // Attendees
        MeetingAttendee::create(['meeting_id' => $m1->id, 'user_id' => $pimpinan->id, 'role_in_meeting' => 'leader', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(8)->setMinute(55)]);
        MeetingAttendee::create(['meeting_id' => $m1->id, 'user_id' => $sekretaris->id, 'role_in_meeting' => 'notetaker', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(8)->setMinute(50)]);
        MeetingAttendee::create(['meeting_id' => $m1->id, 'user_id' => $keuReza->id, 'role_in_meeting' => 'participant', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(9)->setMinute(0)]);
        MeetingAttendee::create(['meeting_id' => $m1->id, 'user_id' => $opsDewi->id, 'role_in_meeting' => 'participant', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(9)->setMinute(2)]);
        MeetingAttendee::create(['meeting_id' => $m1->id, 'user_id' => $tiAndi->id, 'role_in_meeting' => 'participant', 'presence_status' => 'excused', 'notes' => 'Menghadiri audit keamanan siber eksternal']);

        // Minute
        $minute1 = MeetingMinute::create([
            'meeting_id' => $m1->id,
            'recorded_by' => $sekretaris->id,
            'content_summary' => "Rapat dipimpin oleh Direktur Utama. Divisi keuangan melaporkan penyerapan anggaran sebesar 78% dari target kuartal. Divisi operasional melaporkan efisiensi operasional berjalan baik namun memerlukan peremajaan server lokal dan pendingin ruang server.",
            'decisions' => "1. Menyetujui penyesuaian pos anggaran pemeliharaan gedung sebesar 5%.\n2. Menginstruksikan Divisi TI untuk menyusun proposal pengadaan sistem digitalisasi dokumen internal sebelum kuartal depan.\n3. Divisi Keuangan menyelesaikan rekonsiliasi faktur tertunda paling lambat 10 hari kerja.",
            'status' => 'approved',
            'reviewed_by' => $pimpinan->id,
            'reviewed_at' => Carbon::now()->subDays(4)->setHour(14)->setMinute(20),
            'review_notes' => 'Notulen telah diperiksa dan disetujui sesuai hasil musyawarah.',
        ]);

        // Action items
        ActionItem::create([
            'meeting_id' => $m1->id,
            'minute_id' => $minute1->id,
            'pic_id' => $tiAndi->id,
            'title' => 'Penyusunan Proposal Sistem Manajemen Dokumen & Rapat',
            'description' => 'Rancang arsitektur web internal berbasis Laravel + React dengan dukungan ekspor PDF notulen.',
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
            'status' => 'in_progress',
        ]);
        ActionItem::create([
            'meeting_id' => $m1->id,
            'minute_id' => $minute1->id,
            'pic_id' => $keuReza->id,
            'title' => 'Rekonsiliasi Laporan Faktur Vendor Triwulan',
            'description' => 'Finalisasi audit faktur dan pembayaran invoice tertunda vendor logistik.',
            'due_date' => Carbon::now()->addDays(5)->toDateString(),
            'status' => 'pending',
        ]);
        ActionItem::create([
            'meeting_id' => $m1->id,
            'minute_id' => $minute1->id,
            'pic_id' => $opsDewi->id,
            'title' => 'Pengecekan Rutin Genset & AC Ruang Server',
            'description' => 'Lakukan maintenance dan buat berita acara perbaikan pendingin.',
            'due_date' => Carbon::now()->subDays(1)->toDateString(),
            'status' => 'completed',
            'completion_notes' => 'Maintenance selesai dikerjakan bersama teknisi vendor.',
            'completed_at' => Carbon::now()->subDays(1),
        ]);

        // Documents
        Document::create([
            'meeting_id' => $m1->id,
            'uploader_id' => $sekretaris->id,
            'title' => 'Surat Undangan Evaluasi Triwulan.pdf',
            'file_name' => 'undangan-triwulan.pdf',
            'file_path' => 'documents/sample-undangan.pdf',
            'file_size' => 245000,
            'file_type' => 'pdf',
            'category' => 'undangan',
        ]);
        Document::create([
            'meeting_id' => $m1->id,
            'uploader_id' => $keuReza->id,
            'title' => 'Materi Paparan Keuangan Triwulan.pdf',
            'file_name' => 'paparan-keuangan.pdf',
            'file_path' => 'documents/sample-keuangan.pdf',
            'file_size' => 1250000,
            'file_type' => 'pdf',
            'category' => 'materi',
        ]);

        // Meeting 2: Upcoming Scheduled Meeting
        $m2 = Meeting::create([
            'title' => 'Rapat Koordinasi Implementasi Sistem Informasi Internal',
            'description' => 'Sinkronisasi persiapan infrastruktur, pelatihan pegawai, dan jadwal peluncuran sistem rapat digital.',
            'date' => Carbon::now()->addDays(2)->toDateString(),
            'start_time' => '13:30',
            'end_time' => '15:30',
            'type' => 'hybrid',
            'location_or_link' => 'Ruang Rapat 2 & Zoom https://meet.kantor.id/rakor-ti',
            'status' => 'scheduled',
            'created_by' => $sekretaris->id,
        ]);
        MeetingAgenda::create([
            'meeting_id' => $m2->id,
            'title' => 'Demonstrasi Prototipe Web',
            'order' => 1,
            'duration_minutes' => 45,
        ]);
        MeetingAgenda::create([
            'meeting_id' => $m2->id,
            'title' => 'Jadwal Sosialisasi ke Masing-Masing Divisi',
            'order' => 2,
            'duration_minutes' => 45,
        ]);
        MeetingAttendee::create(['meeting_id' => $m2->id, 'user_id' => $pimpinan->id, 'role_in_meeting' => 'leader']);
        MeetingAttendee::create(['meeting_id' => $m2->id, 'user_id' => $sekretaris->id, 'role_in_meeting' => 'notetaker']);
        MeetingAttendee::create(['meeting_id' => $m2->id, 'user_id' => $tiAndi->id, 'role_in_meeting' => 'participant']);
        MeetingAttendee::create(['meeting_id' => $m2->id, 'user_id' => $sdmMaya->id, 'role_in_meeting' => 'participant']);

        // Meeting 3: In Progress Meeting
        $m3 = Meeting::create([
            'title' => 'Rapat Pembahasan Anggaran Pelatihan SDM',
            'description' => 'Diskusi sertifikasi kompetensi pegawai divisi teknis dan operasional tahun 2027.',
            'date' => Carbon::now()->toDateString(),
            'start_time' => '10:00',
            'end_time' => '12:00',
            'type' => 'offline',
            'location_or_link' => 'Ruang Rapat Divisi SDM',
            'status' => 'in_progress',
            'created_by' => $sekretaris->id,
        ]);
        MeetingAttendee::create(['meeting_id' => $m3->id, 'user_id' => $sdmMaya->id, 'role_in_meeting' => 'leader', 'presence_status' => 'present']);
        MeetingAttendee::create(['meeting_id' => $m3->id, 'user_id' => $sekretaris->id, 'role_in_meeting' => 'notetaker', 'presence_status' => 'present']);
        MeetingAttendee::create(['meeting_id' => $m3->id, 'user_id' => $tiAndi->id, 'role_in_meeting' => 'participant', 'presence_status' => 'pending']);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/SeederTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add database/seeders/DatabaseSeeder.php tests/Feature/SeederTest.php
git commit -m "feat: implement multi-department demo seeder and test"
```

---

### Task 4: Authorization Policies & Role Gates

**Files:**
- Create: `app/Policies/MeetingPolicy.php`
- Create: `app/Policies/MeetingMinutePolicy.php`
- Create: `app/Policies/ActionItemPolicy.php`
- Create: `app/Policies/DocumentPolicy.php`
- Create: `app/Policies/UserPolicy.php`
- Test: `tests/Feature/AuthorizationPoliciesTest.php`

**Interfaces:**
- Consumes: User roles from Task 2
- Produces: Authorization gate methods for controlling create, edit, approve, and download actions.

- [ ] **Step 1: Write test for policies**

File: `tests/Feature/AuthorizationPoliciesTest.php`
```php
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/AuthorizationPoliciesTest.php`
Expected: FAIL

- [ ] **Step 3: Implement Policies**

Create `app/Policies/MeetingPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;

class MeetingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Meeting $meeting): bool
    {
        if ($user->isAdmin() || $user->isSekretaris() || $user->isPimpinan()) {
            return true;
        }

        return $meeting->attendees()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function update(User $user, Meeting $meeting): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function delete(User $user, Meeting $meeting): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }
}
```

Create `app/Policies/MeetingMinutePolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\MeetingMinute;
use App\Models\User;

class MeetingMinutePolicy
{
    public function view(User $user, MeetingMinute $minute): bool
    {
        return true;
    }

    public function update(User $user, MeetingMinute $minute): bool
    {
        if ($minute->status === 'approved' && ! $user->isPimpinan() && ! $user->isAdmin()) {
            return false;
        }

        return $user->isAdmin() || $user->isSekretaris();
    }

    public function submitForReview(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function approve(User $user, MeetingMinute $minute): bool
    {
        return $user->isAdmin() || $user->role === 'pimpinan';
    }
}
```

Create `app/Policies/ActionItemPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\ActionItem;
use App\Models\User;

class ActionItemPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }

    public function update(User $user, ActionItem $item): bool
    {
        if ($user->isAdmin() || $user->isSekretaris()) {
            return true;
        }

        return $item->pic_id === $user->id;
    }

    public function delete(User $user, ActionItem $item): bool
    {
        return $user->isAdmin() || $user->isSekretaris();
    }
}
```

Create `app/Policies/DocumentPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function download(User $user, Document $document): bool
    {
        if ($user->isAdmin() || $user->isSekretaris() || $user->isPimpinan()) {
            return true;
        }

        if (! $document->meeting_id) {
            return true;
        }

        return $document->meeting->attendees()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->isAdmin() || $user->isSekretaris() || $document->uploader_id === $user->id;
    }
}
```

Create `app/Policies/UserPolicy.php`:
```php
<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/AuthorizationPoliciesTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Policies/ tests/Feature/AuthorizationPoliciesTest.php
git commit -m "feat: implement authorization policies for meetings, minutes, action items, documents, and users"
```

---

### Task 5: Meeting Management Controllers & Endpoints

**Files:**
- Create: `app/Http/Controllers/MeetingController.php`
- Create: `app/Http/Controllers/MeetingAttendeeController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/MeetingControllerTest.php`

**Interfaces:**
- Consumes: `Meeting`, `MeetingAgenda`, `MeetingAttendee`, `MeetingPolicy`
- Produces: Web endpoints for Meeting listing, detail, creation, status update, agenda management, and attendee attendance check-in.

- [ ] **Step 1: Write test for Meeting CRUD and Attendance**

File: `tests/Feature/MeetingControllerTest.php`
```php
<?php

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_sekretaris_can_create_meeting_with_agendas_and_attendees(): void
    {
        $sekretaris = User::create([
            'name' => 'Sekretaris',
            'email' => 'sekretaris@test.com',
            'password' => bcrypt('password'),
            'role' => 'sekretaris',
        ]);

        $peserta = User::create([
            'name' => 'Peserta 1',
            'email' => 'peserta1@test.com',
            'password' => bcrypt('password'),
            'role' => 'peserta',
        ]);

        $response = $this->actingAs($sekretaris)->post('/meetings', [
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

    public function test_can_update_attendee_presence(): void
    {
        $sekretaris = User::create([
            'name' => 'Sekretaris',
            'email' => 'sekretaris@test.com',
            'password' => bcrypt('password'),
            'role' => 'sekretaris',
        ]);

        $peserta = User::create([
            'name' => 'Peserta',
            'email' => 'peserta@test.com',
            'password' => bcrypt('password'),
            'role' => 'peserta',
        ]);

        $meeting = Meeting::create([
            'title' => 'Rapat Singkat',
            'date' => '2026-11-10',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'type' => 'offline',
            'location_or_link' => 'R. 1',
            'created_by' => $sekretaris->id,
        ]);

        $attendee = $meeting->attendees()->create([
            'user_id' => $peserta->id,
            'role_in_meeting' => 'participant',
            'presence_status' => 'pending',
        ]);

        $response = $this->actingAs($sekretaris)->patch("/meetings/{$meeting->id}/attendees/{$attendee->id}", [
            'presence_status' => 'present',
            'notes' => 'Tepat waktu',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_attendees', [
            'id' => $attendee->id,
            'presence_status' => 'present',
        ]);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/MeetingControllerTest.php`
Expected: FAIL (routes / controllers not found)

- [ ] **Step 3: Implement MeetingController**

File: `app/Http/Controllers/MeetingController.php`
Include methods:
- `index(Request $request)`: Filter by status, search, type, and date; paginated with Inertia render `'meetings/index'`.
- `create()`: Provide users list with roles for attendee picker; Inertia render `'meetings/create'`.
- `store(Request $request)`: Validate and create `Meeting`, `MeetingAgenda` (bulk), `MeetingAttendee` (bulk), and trigger invitation notifications.
- `show(Meeting $meeting)`: Eager load `creator`, `agendas`, `attendees.user`, `minute.reviewer`, `actionItems.pic`, `documents.uploader`; Inertia render `'meetings/show'`.
- `edit(Meeting $meeting)`: Load meeting with agendas & attendees for editing.
- `update(Request $request, Meeting $meeting)`: Update meeting attributes, sync agendas & attendees.
- `updateStatus(Request $request, Meeting $meeting)`: Change status (`scheduled`, `in_progress`, `completed`, `cancelled`).
- `destroy(Meeting $meeting)`: Delete meeting.

- [ ] **Step 4: Implement MeetingAttendeeController**

File: `app/Http/Controllers/MeetingAttendeeController.php`
Include method:
- `update(Request $request, Meeting $meeting, MeetingAttendee $attendee)`: Update presence (`presence_status`, `presence_time` = now() if present, `notes`).

- [ ] **Step 5: Register routes in `routes/web.php`**

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('meetings', [MeetingController::class, 'index'])->name('meetings.index');
    Route::get('meetings/create', [MeetingController::class, 'create'])->name('meetings.create');
    Route::post('meetings', [MeetingController::class, 'store'])->name('meetings.store');
    Route::get('meetings/{meeting}', [MeetingController::class, 'show'])->name('meetings.show');
    Route::get('meetings/{meeting}/edit', [MeetingController::class, 'edit'])->name('meetings.edit');
    Route::put('meetings/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
    Route::patch('meetings/{meeting}/status', [MeetingController::class, 'updateStatus'])->name('meetings.update-status');
    Route::delete('meetings/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
    Route::patch('meetings/{meeting}/attendees/{attendee}', [MeetingAttendeeController::class, 'update'])->name('meetings.attendees.update');
});
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test tests/Feature/MeetingControllerTest.php`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/MeetingController.php app/Http/Controllers/MeetingAttendeeController.php routes/web.php tests/Feature/MeetingControllerTest.php
git commit -m "feat: implement meeting and attendee controllers with feature tests"
```

---

### Task 6: Meeting Minutes & Official PDF Export

**Files:**
- Create: `app/Http/Controllers/MeetingMinuteController.php`
- Create: `resources/views/pdf/meeting-minute.blade.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/MeetingMinuteTest.php`

**Interfaces:**
- Consumes: `MeetingMinute`, `Meeting`, `barryvdh/laravel-dompdf`
- Produces: CRUD notulen, workflow pengajuan review, approval pimpinan, dan stream/unduh PDF resmi.

- [ ] **Step 1: Write test for Minutes & PDF generation**

File: `tests/Feature/MeetingMinuteTest.php`
```php
<?php

use App\Models\Meeting;
use App\Models\MeetingMinute;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingMinuteTest extends TestCase
{
    use RefreshDatabase;

    public function test_sekretaris_can_save_and_submit_minutes(): void
    {
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $sekretaris->id]);

        $response = $this->actingAs($sekretaris)->post("/meetings/{$meeting->id}/minutes", [
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

    public function test_pimpinan_can_approve_minutes(): void
    {
        $pimpinan = User::create(['name' => 'Pimpinan', 'email' => 'pimpinan@test.com', 'password' => 'secret', 'role' => 'pimpinan']);
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $sekretaris->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $sekretaris->id,
            'content_summary' => 'Summary',
            'decisions' => 'Decisions',
            'status' => 'pending_review',
        ]);

        $response = $this->actingAs($pimpinan)->patch("/minutes/{$minute->id}/approve", [
            'action' => 'approve',
            'review_notes' => 'Disetujui tanpa revisi',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('meeting_minutes', [
            'id' => $minute->id,
            'status' => 'approved',
            'reviewed_by' => $pimpinan->id,
        ]);
    }

    public function test_can_download_pdf_for_meeting_minutes(): void
    {
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $meeting = Meeting::create(['title' => 'Rapat Divisi', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $sekretaris->id]);
        $minute = MeetingMinute::create([
            'meeting_id' => $meeting->id,
            'recorded_by' => $sekretaris->id,
            'content_summary' => 'Summary',
            'decisions' => 'Decisions',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($sekretaris)->get("/minutes/{$minute->id}/export-pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/MeetingMinuteTest.php`
Expected: FAIL

- [ ] **Step 3: Create Blade PDF template**

File: `resources/views/pdf/meeting-minute.blade.php`
Standard formal Indonesian meeting minutes format with header (Kop Surat), metadata table (Hari/Tanggal, Waktu, Tempat, Pemimpin Rapat, Notulis), Agenda List, Peserta Hadir/Absen, Pembahasan, Poin Keputusan, Action Items, dan Blok Tanda Tangan Pimpinan & Notulis.

- [ ] **Step 4: Implement MeetingMinuteController**

File: `app/Http/Controllers/MeetingMinuteController.php`
Methods:
- `index()`: Daftar semua notulen untuk menu `/minutes`.
- `storeOrUpdate(Request $request, Meeting $meeting)`: Save draft or submit for review.
- `approve(Request $request, MeetingMinute $minute)`: Authorize pimpinan, set status `approved` or return to `draft` if revision requested.
- `exportPdf(MeetingMinute $minute)`: Render `pdf.meeting-minute` via `Barryvdh\DomPDF\Facade\Pdf::loadView` and stream download.

- [ ] **Step 5: Register routes in `routes/web.php`**

```php
Route::get('minutes', [MeetingMinuteController::class, 'index'])->name('minutes.index');
Route::post('meetings/{meeting}/minutes', [MeetingMinuteController::class, 'storeOrUpdate'])->name('meetings.minutes.store');
Route::patch('minutes/{minute}/approve', [MeetingMinuteController::class, 'approve'])->name('minutes.approve');
Route::get('minutes/{minute}/export-pdf', [MeetingMinuteController::class, 'exportPdf'])->name('minutes.export-pdf');
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test tests/Feature/MeetingMinuteTest.php`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/MeetingMinuteController.php resources/views/pdf/meeting-minute.blade.php routes/web.php tests/Feature/MeetingMinuteTest.php
git commit -m "feat: implement meeting minutes management, approval flow, and official PDF export"
```

---

### Task 7: Action Items & Document Management Backend

**Files:**
- Create: `app/Http/Controllers/ActionItemController.php`
- Create: `app/Http/Controllers/DocumentController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/ActionItemAndDocumentTest.php`

**Interfaces:**
- Consumes: `ActionItem`, `Document`, `Meeting`
- Produces: CRUD action items, status tracking, document upload, and secure download streaming.

- [ ] **Step 1: Write test for Action Items & Documents**

File: `tests/Feature/ActionItemAndDocumentTest.php`
```php
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

    public function test_can_create_and_update_action_item(): void
    {
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $pic = User::create(['name' => 'PIC User', 'email' => 'pic@test.com', 'password' => 'secret', 'role' => 'peserta']);
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $sekretaris->id]);

        $response = $this->actingAs($sekretaris)->post("/meetings/{$meeting->id}/action-items", [
            'pic_id' => $pic->id,
            'title' => 'Buat Laporan Mingguan',
            'due_date' => '2026-11-15',
            'description' => 'Format excel',
        ]);

        $response->assertSessionHasNoErrors();
        $item = ActionItem::first();

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

        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@test.com', 'password' => 'secret', 'role' => 'sekretaris']);
        $meeting = Meeting::create(['title' => 'Rapat', 'date' => '2026-11-10', 'start_time' => '10:00', 'end_time' => '11:00', 'type' => 'offline', 'location_or_link' => 'R. 1', 'created_by' => $sekretaris->id]);

        $file = UploadedFile::fake()->create('materi-presentasi.pdf', 500, 'application/pdf');

        $uploadResponse = $this->actingAs($sekretaris)->post('/documents', [
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
        $downloadResponse = $this->actingAs($sekretaris)->get("/documents/{$doc->id}/download");
        $downloadResponse->assertOk();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/ActionItemAndDocumentTest.php`
Expected: FAIL

- [ ] **Step 3: Implement ActionItemController**

File: `app/Http/Controllers/ActionItemController.php`
Methods:
- `index(Request $request)`: Filter by status, PIC, meeting; support list & kanban view data; Inertia render `'action-items/index'`.
- `store(Request $request, Meeting $meeting)`: Create action item, notify assigned PIC.
- `update(Request $request, ActionItem $actionItem)`: Update status, completion notes, completion timestamp.
- `destroy(ActionItem $actionItem)`: Delete item.

- [ ] **Step 4: Implement DocumentController**

File: `app/Http/Controllers/DocumentController.php`
Methods:
- `index(Request $request)`: Filter by category, meeting, search query; Inertia render `'documents/index'`.
- `store(Request $request)`: Validate upload (max 15MB, valid extensions), store to `documents/` on private local disk, create Document record.
- `download(Document $document)`: Authorize via DocumentPolicy, return `Storage::disk('local')->download($document->file_path, $document->file_name)`.
- `destroy(Document $document)`: Authorize, delete physical file, delete record.

- [ ] **Step 5: Register routes in `routes/web.php`**

```php
Route::get('action-items', [ActionItemController::class, 'index'])->name('action-items.index');
Route::post('meetings/{meeting}/action-items', [ActionItemController::class, 'store'])->name('meetings.action-items.store');
Route::patch('action-items/{actionItem}', [ActionItemController::class, 'update'])->name('action-items.update');
Route::delete('action-items/{actionItem}', [ActionItemController::class, 'destroy'])->name('action-items.destroy');

Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test tests/Feature/ActionItemAndDocumentTest.php`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/ActionItemController.php app/Http/Controllers/DocumentController.php routes/web.php tests/Feature/ActionItemAndDocumentTest.php
git commit -m "feat: implement action items and document controllers with secure storage download"
```

---

### Task 8: Dashboard, Notifications & User Management Backend

**Files:**
- Create: `app/Http/Controllers/DashboardController.php`
- Create: `app/Http/Controllers/NotificationController.php`
- Create: `app/Http/Controllers/UserController.php`
- Create: `app/Notifications/MeetingInvitationNotification.php`
- Create: `app/Notifications/ActionItemAssignedNotification.php`
- Create: `app/Notifications/MinuteApprovedNotification.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/DashboardAndUserTest.php`

**Interfaces:**
- Consumes: All models, standard Laravel Notification
- Produces: Dashboard KPI aggregated data, in-app notification endpoints, and Admin User CRUD.

- [ ] **Step 1: Write test for Dashboard & Admin User Management**

File: `tests/Feature/DashboardAndUserTest.php`
```php
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAndUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_access_dashboard_with_kpi_metrics(): void
    {
        $user = User::create(['name' => 'User', 'email' => 'user@test.com', 'password' => 'secret', 'role' => 'peserta']);

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertOk();
    }

    public function test_admin_can_manage_users(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret', 'role' => 'admin']);

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
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $peserta = User::create(['name' => 'Peserta', 'email' => 'peserta@test.com', 'password' => 'secret', 'role' => 'peserta']);

        $response = $this->actingAs($peserta)->get('/users');
        $response->assertForbidden();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/DashboardAndUserTest.php`
Expected: FAIL

- [ ] **Step 3: Implement Notifications**

Create `app/Notifications/MeetingInvitationNotification.php`:
```php
<?php

namespace App\Notifications;

use App\Models\Meeting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MeetingInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public Meeting $meeting) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Undangan Rapat Baru',
            'message' => "Anda diundang ke rapat '{$this->meeting->title}' pada {$this->meeting->date->format('d M Y')}.",
            'url' => route('meetings.show', $this->meeting->id),
            'meeting_id' => $this->meeting->id,
        ];
    }
}
```

Create `app/Notifications/ActionItemAssignedNotification.php` and `app/Notifications/MinuteApprovedNotification.php` similarly.

- [ ] **Step 4: Implement DashboardController**

File: `app/Http/Controllers/DashboardController.php`
Calculates:
- `totalMeetingsMonth`: Count of meetings in current month.
- `upcomingMeetingsCount`: Count of scheduled meetings from today onwards.
- `pendingActionItemsCount`: Count of active action items (pending/in_progress).
- `recentDocumentsCount`: Count of documents uploaded in the last 30 days.
- `upcomingMeetings`: Next 5 meetings with attendee counts and status.
- `myActionItems`: Action items assigned to `auth()->user()` sorted by `due_date`.
Inertia render: `'dashboard'`.

- [ ] **Step 5: Implement NotificationController**

File: `app/Http/Controllers/NotificationController.php`
Methods:
- `index()`: Return recent notifications and unread count.
- `markAsRead(string $id)`: Mark specific notification as read.
- `markAllAsRead()`: Mark all user notifications as read.

- [ ] **Step 6: Implement UserController**

File: `app/Http/Controllers/UserController.php`
Authorize via `UserPolicy::manage`.
Methods:
- `index(Request $request)`: Filter by role/department/search; Inertia render `'users/index'`.
- `store(Request $request)`: Create user with role, position, department.
- `update(Request $request, User $user)`: Update profile, role, status.
- `destroy(User $user)`: Soft or hard delete user with safety check.

- [ ] **Step 7: Register routes in `routes/web.php`**

```php
Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
```

- [ ] **Step 8: Run test to verify it passes**

Run: `php artisan test tests/Feature/DashboardAndUserTest.php`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/DashboardController.php app/Http/Controllers/NotificationController.php app/Http/Controllers/UserController.php app/Notifications/ routes/web.php tests/Feature/DashboardAndUserTest.php
git commit -m "feat: implement dashboard metrics, in-app notifications, and admin user management"
```

---

### Task 9: Shared Frontend Types, Sidebar Navigation & Notification Bell

**Files:**
- Create: `resources/js/types/meeting.ts`
- Modify: `resources/js/types/index.d.ts`
- Create: `resources/js/components/notification-bell.tsx`
- Modify: `resources/js/layouts/app/app-sidebar-layout.tsx` (or existing layout nav items)
- Test: `npm run types:check`

**Interfaces:**
- Consumes: Backend Inertia shared props
- Produces: Navigation links for Dashboard, Meetings, Documents, Minutes, Action Items, and Users; real-time unread notification dropdown.

- [ ] **Step 1: Define TypeScript Interfaces**

File: `resources/js/types/meeting.ts`
```typescript
export type Role = 'admin' | 'sekretaris' | 'pimpinan' | 'peserta';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    position?: string | null;
    department?: string | null;
    phone?: string | null;
    is_active: boolean;
}

export interface MeetingAgenda {
    id: number;
    meeting_id: number;
    title: string;
    description?: string | null;
    order: number;
    duration_minutes?: number | null;
}

export interface MeetingAttendee {
    id: number;
    meeting_id: number;
    user_id: number;
    role_in_meeting: 'leader' | 'notetaker' | 'participant';
    presence_status: 'pending' | 'present' | 'excused' | 'absent';
    presence_time?: string | null;
    notes?: string | null;
    user: User;
}

export interface MeetingMinute {
    id: number;
    meeting_id: number;
    recorded_by: number;
    content_summary?: string | null;
    decisions?: string | null;
    status: 'draft' | 'pending_review' | 'approved';
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    review_notes?: string | null;
    recorder?: User;
    reviewer?: User;
}

export interface ActionItem {
    id: number;
    meeting_id: number;
    minute_id?: number | null;
    pic_id: number;
    title: string;
    description?: string | null;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    completion_notes?: string | null;
    completed_at?: string | null;
    pic: User;
    meeting?: Meeting;
}

export interface DocumentItem {
    id: number;
    meeting_id?: number | null;
    uploader_id: number;
    title: string;
    file_name: string;
    file_size: number;
    file_type: string;
    category: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut';
    created_at: string;
    uploader: User;
    meeting?: Meeting;
}

export interface Meeting {
    id: number;
    title: string;
    description?: string | null;
    date: string;
    start_time: string;
    end_time: string;
    type: 'offline' | 'online' | 'hybrid';
    location_or_link: string;
    status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    created_by: number;
    creator?: User;
    agendas?: MeetingAgenda[];
    attendees?: MeetingAttendee[];
    minute?: MeetingMinute | null;
    action_items?: ActionItem[];
    documents?: DocumentItem[];
}
```

- [ ] **Step 2: Build NotificationBell Component**

File: `resources/js/components/notification-bell.tsx`
Includes bell icon with unread count badge, popover dropdown with notification list, direct links, and "Tandai Semua Dibaca" action.

- [ ] **Step 3: Update App Navigation Sidebar & Topbar**

Update layout to include:
- Beranda / Dashboard (`/dashboard` - Icon: `LayoutDashboard`)
- Manajemen Rapat (`/meetings` - Icon: `Calendar`)
- Notulen Rapat (`/minutes` - Icon: `FileText`)
- Tindak Lanjut (`/action-items` - Icon: `CheckSquare`)
- Repositori Dokumen (`/documents` - Icon: `FolderLock`)
- Manajemen Pengguna (`/users` - Khusus `admin` - Icon: `Users`)
Add `<NotificationBell />` to top header.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/types/ resources/js/components/notification-bell.tsx resources/js/layouts/
git commit -m "feat: implement frontend meeting types, navigation items, and notification bell"
```

---

### Task 10: Dashboard Frontend Page

**Files:**
- Modify: `resources/js/pages/dashboard.tsx`
- Test: `npm run types:check` & manual browser visit

**Interfaces:**
- Consumes: Metrics from `DashboardController` (`totalMeetingsMonth`, `upcomingMeetingsCount`, `pendingActionItemsCount`, `recentDocumentsCount`, `upcomingMeetings`, `myActionItems`).
- Produces: Interactive dashboard UI with metric statistics, fast status badges, upcoming meeting cards with instant links, and action items quick tracker.

- [ ] **Step 1: Implement `resources/js/pages/dashboard.tsx`**

Build:
- 4 Responsive KPI Summary Cards with Lucide icons (`CalendarCheck`, `Clock`, `ListTodo`, `FileStack`).
- 2 Columns Layout:
  - Left: "Jadwal Rapat Terdekat" with date badges, type indicators (Online/Offline), attendee count, and "Lihat Detail" button.
  - Right: "Tindak Lanjut Tugas Saya" with due date alert chips (Red if overdue, Yellow if due within 3 days, Green if completed), checkbox toggle to mark completed, and direct meeting link.
- Quick Action buttons: "Jadwalkan Rapat Baru" (for admin/sekretaris) and "Unggah Dokumen".

- [ ] **Step 2: Verify TypeScript and compilation**

Run: `npm run types:check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/dashboard.tsx
git commit -m "feat: implement complete interactive dashboard page with KPI cards and task tracker"
```

---

### Task 11: Meetings Frontend Pages (Index, Create, Edit & Detail Tabs)

**Files:**
- Create: `resources/js/pages/meetings/index.tsx`
- Create: `resources/js/pages/meetings/create.tsx`
- Create: `resources/js/pages/meetings/edit.tsx`
- Create: `resources/js/pages/meetings/show.tsx`
- Create: `resources/js/pages/meetings/partials/agenda-tab.tsx`
- Create: `resources/js/pages/meetings/partials/attendees-tab.tsx`
- Create: `resources/js/pages/meetings/partials/minutes-tab.tsx`
- Create: `resources/js/pages/meetings/partials/action-items-tab.tsx`
- Create: `resources/js/pages/meetings/partials/documents-tab.tsx`
- Test: `npm run types:check`

**Interfaces:**
- Consumes: Meeting API endpoints from Task 5 & 6
- Produces: Full UI for meeting management:
  - Filterable meeting list with status badges
  - Multi-step / structured Create & Edit meeting form with dynamic agenda addition and attendee selection
  - 5-tab detail view: Info & Agendas, Attendees Attendance Check-in, Minutes Editor & Approval, Action Items Modal, Documents Upload.

- [ ] **Step 1: Implement `resources/js/pages/meetings/index.tsx`**

Features: Search bar, status dropdown filter (`scheduled`, `in_progress`, `completed`, `cancelled`), date filter, "Buat Rapat Baru" button, meeting cards/table with click-through to detail.

- [ ] **Step 2: Implement `resources/js/pages/meetings/create.tsx` and `edit.tsx`**

Features:
- Form fields: Title, description, date, start_time, end_time, type, location_or_link.
- Dynamic Agendas Builder: Add, reorder, delete agenda items with duration.
- Attendee Picker: Select users by department, assign role (`leader`, `notetaker`, `participant`).

- [ ] **Step 3: Implement `resources/js/pages/meetings/show.tsx` and 5 Tabs**

Features:
- Header: Meeting Title, Date/Time, Location/Link, Status Badge, Quick status changer (`Mulai Rapat`, `Selesaikan Rapat`).
- Tab 1 `agenda-tab.tsx`: Timeline list of agendas.
- Tab 2 `attendees-tab.tsx`: Attendees list with quick radio/buttons for Notulis to mark `Hadir`, `Izin`, `Absen` + timestamp.
- Tab 3 `minutes-tab.tsx`: Rich editor for summary and decisions; Status indicator (`Draft`, `Menunggu Review`, `Disetujui`); Approval action for Pimpinan; "Unduh PDF Notulen Resmi" button.
- Tab 4 `action-items-tab.tsx`: Action items list with PIC info, deadline badge, "Tambah Tindak Lanjut" dialog form.
- Tab 5 `documents-tab.tsx`: File upload dropzone, categorized file list with "Unduh Berkas" button.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/meetings/
git commit -m "feat: implement meeting index, create/edit forms, and complete 5-tab detail view"
```

---

### Task 12: Action Items, Minutes List, and Documents Repositories

**Files:**
- Create: `resources/js/pages/minutes/index.tsx`
- Create: `resources/js/pages/action-items/index.tsx`
- Create: `resources/js/pages/documents/index.tsx`
- Test: `npm run types:check`

**Interfaces:**
- Consumes: Task 6 & Task 7 Backend controllers
- Produces:
  - Global Minutes table with approval status filter and 1-click PDF download.
  - Action Items table & Kanban view with quick status updates and completion dialog.
  - Document repository with category filter (Undangan, Materi, Notulen PDF, Bukti) and secure download buttons.

- [ ] **Step 1: Implement `resources/js/pages/minutes/index.tsx`**

Table showing: Rapat Terkait, Tanggal, Notulis, Status Review Pimpinan (`Draft`, `Pending Review`, `Approved`), Tombol "Buka Rapat" & "Cetak PDF".

- [ ] **Step 2: Implement `resources/js/pages/action-items/index.tsx`**

Features:
- Toggle view: Table View vs Kanban Board (Pending, In Progress, Completed).
- Filter by PIC (default filter to current user for `peserta`).
- Filter by status and deadline.
- Modal Update Status: PIC can change status, fill completion notes, and mark complete.

- [ ] **Step 3: Implement `resources/js/pages/documents/index.tsx`**

Features:
- Filter category pills: `Semua`, `Surat Undangan`, `Materi Paparan`, `Notulen Resmi PDF`, `Bukti Tindak Lanjut`.
- Search file name and meeting title.
- Direct secure download trigger calling `/documents/{id}/download`.
- "Unggah Dokumen Baru" modal dialog.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/minutes/ resources/js/pages/action-items/ resources/js/pages/documents/
git commit -m "feat: implement global minutes listing, action items kanban/table, and document repository"
```

---

### Task 13: Admin User Management Frontend Page

**Files:**
- Create: `resources/js/pages/users/index.tsx`
- Test: `npm run types:check`

**Interfaces:**
- Consumes: UserController endpoints from Task 8
- Produces: User management table with search, role badge, department grouping, add user dialog, and edit user dialog.

- [ ] **Step 1: Implement `resources/js/pages/users/index.tsx`**

Features:
- Table listing: Name, Email, Role badge (`Admin` [Purple], `Sekretaris` [Blue], `Pimpinan` [Emerald], `Peserta` [Gray]), Position, Department, Status (Aktif/Nonaktif).
- "Tambah Pengguna Baru" modal dialog form.
- "Edit Pengguna" modal dialog form.
- Status toggle & reset password.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add resources/js/pages/users/index.tsx
git commit -m "feat: implement admin user management page with role and department controls"
```

---

### Task 14: End-to-End System Verification & Polish

**Files:**
- Modify: `tests/Feature/EndToEndMeetingFlowTest.php`
- Modify: `README.md`
- Test: Full Pest test suite, TypeScript check, Pint code formatting, Seeder verification

**Interfaces:**
- Consumes: All completed modules
- Produces: Production-ready clean code with green tests, zero lint errors, and complete Indonesian README documentation.

- [ ] **Step 1: Write and run End-to-End full cycle test**

File: `tests/Feature/EndToEndMeetingFlowTest.php`
```php
<?php

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndToEndMeetingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_meeting_lifecycle(): void
    {
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@k.id', 'password' => 'secret', 'role' => 'admin']);
        $sekretaris = User::create(['name' => 'Sekretaris', 'email' => 'sekretaris@k.id', 'password' => 'secret', 'role' => 'sekretaris']);
        $pimpinan = User::create(['name' => 'Pimpinan', 'email' => 'pimpinan@k.id', 'password' => 'secret', 'role' => 'pimpinan']);
        $peserta = User::create(['name' => 'Peserta', 'email' => 'peserta@k.id', 'password' => 'secret', 'role' => 'peserta']);

        // 1. Create Meeting with Agenda and Attendees
        $createRes = $this->actingAs($sekretaris)->post('/meetings', [
            'title' => 'Rapat Koordinasi E2E',
            'date' => '2026-11-20',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'type' => 'offline',
            'location_or_link' => 'R. Rapat 1',
            'agendas' => [
                ['title' => 'Agenda 1', 'order' => 1, 'duration_minutes' => 30],
            ],
            'attendees' => [
                ['user_id' => $peserta->id, 'role_in_meeting' => 'participant'],
            ],
        ]);
        $createRes->assertRedirect('/meetings');
        $meeting = Meeting::where('title', 'Rapat Koordinasi E2E')->first();
        $this->assertNotNull($meeting);

        // 2. Notulis checks in attendee
        $attendee = $meeting->attendees->first();
        $this->actingAs($sekretaris)->patch("/meetings/{$meeting->id}/attendees/{$attendee->id}", [
            'presence_status' => 'present',
        ])->assertSessionHasNoErrors();

        // 3. Create minutes and submit for review
        $this->actingAs($sekretaris)->post("/meetings/{$meeting->id}/minutes", [
            'content_summary' => 'Hasil rapat e2e lengkap',
            'decisions' => 'Keputusan e2e sah',
            'submit_for_review' => true,
        ])->assertSessionHasNoErrors();

        $minute = $meeting->fresh()->minute;
        $this->assertEquals('pending_review', $minute->status);

        // 4. Pimpinan approves minutes
        $this->actingAs($pimpinan)->patch("/minutes/{$minute->id}/approve", [
            'action' => 'approve',
            'review_notes' => 'Disetujui',
        ])->assertSessionHasNoErrors();
        $this->assertEquals('approved', $minute->fresh()->status);

        // 5. Create action item
        $this->actingAs($sekretaris)->post("/meetings/{$meeting->id}/action-items", [
            'pic_id' => $peserta->id,
            'title' => 'Follow up vendor',
            'due_date' => '2026-11-25',
        ])->assertSessionHasNoErrors();

        // 6. Peserta marks action item completed
        $item = $meeting->actionItems()->first();
        $this->actingAs($peserta)->patch("/action-items/{$item->id}", [
            'status' => 'completed',
            'completion_notes' => 'Sudah selesai',
        ])->assertSessionHasNoErrors();
        $this->assertEquals('completed', $item->fresh()->status);

        // 7. Export PDF
        $pdfRes = $this->actingAs($sekretaris)->get("/minutes/{$minute->id}/export-pdf");
        $pdfRes->assertOk();
    }
}
```

- [ ] **Step 2: Run test suite**

Run: `php artisan test`
Expected: ALL TESTS PASS.

- [ ] **Step 3: Run TypeScript & Vite build checks**

Run:
```bash
npm run types:check
npm run build
```
Expected: Build success with zero errors.

- [ ] **Step 4: Run code style fix**

Run:
```bash
./vendor/bin/pint
```
Expected: All PHP files formatted cleanly.

- [ ] **Step 5: Seed fresh database & verify demo accounts**

Run:
```bash
php artisan migrate:fresh --seed
```
Expected: Database seeded with all demo accounts and realistic meeting data.

- [ ] **Step 6: Update README.md**

Update `README.md` according to the standard layout:
- Heading Area (# Sistem Manajemen Rapat dan Dokumen)
- Installation (`composer install`, `npm install`, `cp .env.example .env`, `php artisan key:generate`)
- Quick Start (`php artisan migrate:fresh --seed`, `php artisan dev`)
- What & Why
- Daftar Akun Demo (Admin, Pimpinan, Notulis/Sekretaris, Peserta TI/SDM/Keuangan/Ops dengan password `password`)
- Fitur Utama & Modul
- License

- [ ] **Step 7: Final Commit**

```bash
git add .
git commit -m "feat: complete Sistem Manajemen Rapat dan Dokumen with full E2E verification"
```
