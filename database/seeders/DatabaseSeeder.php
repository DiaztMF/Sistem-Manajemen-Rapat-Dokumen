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
    /**
     * Seed the application's database idempotently (safe for every redeploy).
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $admin = User::updateOrCreate(
            ['email' => 'admin@kantor.id'],
            [
                'name' => 'Budi Pratama',
                'password' => $password,
                'role' => 'admin',
                'position' => 'Administrator Sistem',
                'department' => 'Teknologi Informasi',
                'phone' => '081234567801',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $pimpinan = User::updateOrCreate(
            ['email' => 'pimpinan@kantor.id'],
            [
                'name' => 'Dr. H. Hendra Wijaya',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Direktur Utama',
                'department' => 'Manajemen Eksekutif',
                'phone' => '081234567802',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $sekretaris = User::updateOrCreate(
            ['email' => 'sekretaris@kantor.id'],
            [
                'name' => 'Siti Rahmawati',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Sekretaris Eksekutif',
                'department' => 'Tata Usaha & Protokoler',
                'phone' => '081234567803',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $tiAndi = User::updateOrCreate(
            ['email' => 'ti.andi@kantor.id'],
            [
                'name' => 'Andi Saputra',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Kepala Divisi TI',
                'department' => 'Teknologi Informasi',
                'phone' => '081234567804',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $sdmMaya = User::updateOrCreate(
            ['email' => 'sdm.maya@kantor.id'],
            [
                'name' => 'Maya Anggraini',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Kepala Divisi SDM',
                'department' => 'Sumber Daya Manusia',
                'phone' => '081234567805',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $keuReza = User::updateOrCreate(
            ['email' => 'keuangan.reza@kantor.id'],
            [
                'name' => 'Reza Pahlevi',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Analis Keuangan',
                'department' => 'Keuangan & Akuntansi',
                'phone' => '081234567806',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        $opsDewi = User::updateOrCreate(
            ['email' => 'operasional.dewi@kantor.id'],
            [
                'name' => 'Dewi Lestari',
                'password' => $password,
                'role' => 'peserta',
                'position' => 'Supervisor Operasional',
                'department' => 'Operasional & Umum',
                'phone' => '081234567807',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Meeting 1: Completed Meeting with Approved Minutes & Action Items
        $m1 = Meeting::firstOrCreate(
            ['title' => 'Rapat Evaluasi Triwulan Kinerja Operasional & Keuangan'],
            [
                'description' => 'Evaluasi capaian KPI operasional serta laporan keuangan kuartal berjalan kantor pusat.',
                'date' => Carbon::now()->subDays(5)->toDateString(),
                'start_time' => '09:00',
                'end_time' => '11:30',
                'type' => 'offline',
                'location_or_link' => 'Ruang Rapat Utama Lantai 3',
                'status' => 'completed',
                'created_by' => $sekretaris->id,
            ]
        );

        MeetingAgenda::firstOrCreate(
            ['meeting_id' => $m1->id, 'order' => 1],
            [
                'title' => 'Pembukaan & Arahan Direktur Utama',
                'description' => 'Pengantar target strategi dan penekanan efisiensi anggaran.',
                'duration_minutes' => 30,
            ]
        );
        MeetingAgenda::firstOrCreate(
            ['meeting_id' => $m1->id, 'order' => 2],
            [
                'title' => 'Pemaparan Kinerja Keuangan Triwulan',
                'description' => 'Realisasi penyerapan anggaran dan proyeksi cashflow kuartal berikutnya.',
                'duration_minutes' => 60,
            ]
        );
        MeetingAgenda::firstOrCreate(
            ['meeting_id' => $m1->id, 'order' => 3],
            [
                'title' => 'Diskusi Hambatan Operasional Lapangan',
                'description' => 'Evaluasi kendala logistik, fasilitas gedung, dan kesiapan operasional.',
                'duration_minutes' => 60,
            ]
        );

        // Attendees
        MeetingAttendee::firstOrCreate(
            ['meeting_id' => $m1->id, 'user_id' => $pimpinan->id],
            ['role_in_meeting' => 'leader', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(8)->setMinute(55)]
        );
        MeetingAttendee::firstOrCreate(
            ['meeting_id' => $m1->id, 'user_id' => $sekretaris->id],
            ['role_in_meeting' => 'notetaker', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(8)->setMinute(50)]
        );
        MeetingAttendee::firstOrCreate(
            ['meeting_id' => $m1->id, 'user_id' => $keuReza->id],
            ['role_in_meeting' => 'participant', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(9)->setMinute(0)]
        );
        MeetingAttendee::firstOrCreate(
            ['meeting_id' => $m1->id, 'user_id' => $opsDewi->id],
            ['role_in_meeting' => 'participant', 'presence_status' => 'present', 'presence_time' => Carbon::now()->subDays(5)->setHour(9)->setMinute(2)]
        );
        MeetingAttendee::firstOrCreate(
            ['meeting_id' => $m1->id, 'user_id' => $tiAndi->id],
            ['role_in_meeting' => 'participant', 'presence_status' => 'excused', 'notes' => 'Menghadiri audit keamanan siber eksternal']
        );

        // Minute
        $minute1 = MeetingMinute::firstOrCreate(
            ['meeting_id' => $m1->id],
            [
                'recorded_by' => $sekretaris->id,
                'content_summary' => 'Rapat dipimpin oleh Direktur Utama. Divisi keuangan melaporkan penyerapan anggaran sebesar 78% dari target kuartal. Divisi operasional melaporkan efisiensi operasional berjalan baik namun memerlukan peremajaan server lokal dan pendingin ruang server.',
                'decisions' => "1. Menyetujui penyesuaian pos anggaran pemeliharaan gedung sebesar 5%.\n2. Menginstruksikan Divisi TI untuk menyusun proposal pengadaan sistem digitalisasi dokumen internal sebelum kuartal depan.\n3. Divisi Keuangan menyelesaikan rekonsiliasi faktur tertunda paling lambat 10 hari kerja.",
                'status' => 'approved',
                'reviewed_by' => $pimpinan->id,
                'reviewed_at' => Carbon::now()->subDays(4)->setHour(14)->setMinute(20),
                'review_notes' => 'Notulen telah diperiksa dan disetujui sesuai hasil musyawarah.',
            ]
        );

        // Action items
        ActionItem::firstOrCreate(
            ['meeting_id' => $m1->id, 'title' => 'Penyusunan Proposal Sistem Manajemen Dokumen & Rapat'],
            [
                'minute_id' => $minute1->id,
                'pic_id' => $tiAndi->id,
                'description' => 'Rancang arsitektur web internal berbasis Laravel + React dengan dukungan ekspor PDF notulen.',
                'due_date' => Carbon::now()->addDays(7)->toDateString(),
                'status' => 'in_progress',
            ]
        );
        ActionItem::firstOrCreate(
            ['meeting_id' => $m1->id, 'title' => 'Rekonsiliasi Laporan Faktur Vendor Triwulan'],
            [
                'minute_id' => $minute1->id,
                'pic_id' => $keuReza->id,
                'description' => 'Finalisasi audit faktur dan pembayaran invoice tertunda vendor logistik.',
                'due_date' => Carbon::now()->addDays(5)->toDateString(),
                'status' => 'pending',
            ]
        );
        ActionItem::firstOrCreate(
            ['meeting_id' => $m1->id, 'title' => 'Pengecekan Rutin Genset & AC Ruang Server'],
            [
                'minute_id' => $minute1->id,
                'pic_id' => $opsDewi->id,
                'description' => 'Lakukan maintenance dan buat berita acara perbaikan pendingin.',
                'due_date' => Carbon::now()->subDays(1)->toDateString(),
                'status' => 'completed',
                'completion_notes' => 'Maintenance selesai dikerjakan bersama teknisi vendor.',
                'completed_at' => Carbon::now()->subDays(1),
            ]
        );

        // Documents
        Document::firstOrCreate(
            ['meeting_id' => $m1->id, 'file_name' => 'undangan-triwulan.pdf'],
            [
                'uploader_id' => $sekretaris->id,
                'title' => 'Surat Undangan Evaluasi Triwulan.pdf',
                'file_path' => 'documents/sample-undangan.pdf',
                'file_size' => 245000,
                'file_type' => 'pdf',
                'category' => 'undangan',
            ]
        );
        Document::firstOrCreate(
            ['meeting_id' => $m1->id, 'file_name' => 'paparan-keuangan.pdf'],
            [
                'uploader_id' => $keuReza->id,
                'title' => 'Materi Paparan Keuangan Triwulan.pdf',
                'file_path' => 'documents/sample-keuangan.pdf',
                'file_size' => 1250000,
                'file_type' => 'pdf',
                'category' => 'materi',
            ]
        );

        // Meeting 2: Upcoming Scheduled Meeting
        $m2 = Meeting::firstOrCreate(
            ['title' => 'Rapat Koordinasi Implementasi Sistem Informasi Internal'],
            [
                'description' => 'Sinkronisasi persiapan infrastruktur, pelatihan pegawai, dan jadwal peluncuran sistem rapat digital.',
                'date' => Carbon::now()->addDays(2)->toDateString(),
                'start_time' => '13:30',
                'end_time' => '15:30',
                'type' => 'hybrid',
                'location_or_link' => 'Ruang Rapat 2 & Zoom https://meet.kantor.id/rakor-ti',
                'status' => 'scheduled',
                'created_by' => $sekretaris->id,
            ]
        );
        MeetingAgenda::firstOrCreate(
            ['meeting_id' => $m2->id, 'order' => 1],
            ['title' => 'Demonstrasi Prototipe Web', 'duration_minutes' => 45]
        );
        MeetingAgenda::firstOrCreate(
            ['meeting_id' => $m2->id, 'order' => 2],
            ['title' => 'Jadwal Sosialisasi ke Masing-Masing Divisi', 'duration_minutes' => 45]
        );
        MeetingAttendee::firstOrCreate(['meeting_id' => $m2->id, 'user_id' => $pimpinan->id], ['role_in_meeting' => 'leader']);
        MeetingAttendee::firstOrCreate(['meeting_id' => $m2->id, 'user_id' => $sekretaris->id], ['role_in_meeting' => 'notetaker']);
        MeetingAttendee::firstOrCreate(['meeting_id' => $m2->id, 'user_id' => $tiAndi->id], ['role_in_meeting' => 'participant']);
        MeetingAttendee::firstOrCreate(['meeting_id' => $m2->id, 'user_id' => $sdmMaya->id], ['role_in_meeting' => 'participant']);

        // Meeting 3: In Progress Meeting
        $m3 = Meeting::firstOrCreate(
            ['title' => 'Rapat Pembahasan Anggaran Pelatihan SDM'],
            [
                'description' => 'Diskusi sertifikasi kompetensi pegawai divisi teknis dan operasional tahun 2027.',
                'date' => Carbon::now()->toDateString(),
                'start_time' => '10:00',
                'end_time' => '12:00',
                'type' => 'offline',
                'location_or_link' => 'Ruang Rapat Divisi SDM',
                'status' => 'in_progress',
                'created_by' => $sekretaris->id,
            ]
        );
        MeetingAttendee::firstOrCreate(['meeting_id' => $m3->id, 'user_id' => $sdmMaya->id], ['role_in_meeting' => 'leader', 'presence_status' => 'present']);
        MeetingAttendee::firstOrCreate(['meeting_id' => $m3->id, 'user_id' => $sekretaris->id], ['role_in_meeting' => 'notetaker', 'presence_status' => 'present']);
        MeetingAttendee::firstOrCreate(['meeting_id' => $m3->id, 'user_id' => $tiAndi->id], ['role_in_meeting' => 'participant', 'presence_status' => 'pending']);
    }
}
