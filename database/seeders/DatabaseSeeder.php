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
            'content_summary' => 'Rapat dipimpin oleh Direktur Utama. Divisi keuangan melaporkan penyerapan anggaran sebesar 78% dari target kuartal. Divisi operasional melaporkan efisiensi operasional berjalan baik namun memerlukan peremajaan server lokal dan pendingin ruang server.',
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
