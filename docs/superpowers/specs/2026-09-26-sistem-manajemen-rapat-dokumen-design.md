# Sistem Manajemen Rapat dan Dokumen — Design Specification

**Tanggal:** 2026-09-26  
**Status:** Approved by User  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Stack Utama:** Laravel 13 + Inertia.js React 19 + TypeScript + Tailwind CSS v4 + SQLite  

---

## 1. Executive Summary & Objective

Sistem Manajemen Rapat dan Dokumen adalah aplikasi internal kantor yang dirancang untuk mengelola siklus hidup rapat kerja secara menyeluruh dan terintegrasi. Sistem menghubungkan setiap entitas: mulai dari permohonan/jadwal rapat, agenda, presensi peserta, pencatatan notulen, repositori dokumen pendukung, hingga pemantauan penugasan tindak lanjut (*action items*).

Tujuan utama sistem:
1. Mengeliminasi data rapat yang tercecer (undangan di chat/email, notulen di file personal, dokumen di folder terpisah).
2. Memastikan akuntabilitas hasil rapat melalui monitoring status tindak lanjut per penanggung jawab (PIC).
3. Menyediakan alur resmi persetujuan (*review/approval*) notulen oleh Pimpinan Sidang serta ekspor berkas PDF resmi.

---

## 2. Aktor & Peran (Role-Based Access Control)

Sistem menerapkan model hak akses hierarkis 4 tingkat:

| Role | Tanggung Jawab & Hak Akses |
|---|---|
| **Admin** | Akses penuh sistem: CRUD Pengguna, atur role, departemen, jabatan, dan konfigurasi master data. |
| **Sekretaris / Notulis** | Membuat jadwal rapat, menyusun agenda, mengundang peserta, mencatat presensi (kehadiran), menulis notulen, mengunggah dokumen rapat, menugaskan tindak lanjut, dan mengajukan notulen ke Pimpinan. |
| **Pimpinan** | Memonitor seluruh rapat dan dokumen; meninjau, menyetujui (*approve*), atau meminta revisi notulen; memantau progres ketercapaian seluruh tindak lanjut. |
| **Peserta / Pegawai** | Melihat daftar rapat yang diikuti; mengakses agenda dan mengunduh dokumen rapat terkait; memperbarui progres dan catatan tugas tindak lanjut miliknya (*My Action Items*). |

---

## 3. Database Schema & Data Models (SQLite)

Database menggunakan SQLite relasional penuh dengan referential integrity (foreign keys enabled).

### 3.1 `users`
Menyimpan identitas pegawai kantor.
- `id` (INTEGER, PK, Autoincrement)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `role` (ENUM: `admin`, `sekretaris`, `pimpinan`, `peserta` — default `peserta`)
- `position` (VARCHAR, e.g. "Kepala Divisi", "Staff Analis")
- `department` (VARCHAR, e.g. "Teknologi Informasi", "SDM", "Keuangan", "Operasional")
- `phone` (VARCHAR, Nullable)
- `is_active` (BOOLEAN, Default true)
- `timestamps`

### 3.2 `meetings`
Entitas agregat utama rapat.
- `id` (INTEGER, PK, Autoincrement)
- `title` (VARCHAR)
- `description` (TEXT, Nullable)
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `type` (ENUM: `offline`, `online`, `hybrid`)
- `location_or_link` (VARCHAR — ruang rapat fisik atau tautan Zoom/Meet)
- `status` (ENUM: `draft`, `scheduled`, `in_progress`, `completed`, `cancelled` — default `scheduled`)
- `created_by` (INTEGER, FK `users.id`)
- `timestamps`

### 3.3 `meeting_agendas`
Poin-poin topik pembahasan dalam satu rapat.
- `id` (INTEGER, PK, Autoincrement)
- `meeting_id` (INTEGER, FK `meetings.id` ON DELETE CASCADE)
- `title` (VARCHAR)
- `description` (TEXT, Nullable)
- `order` (INTEGER, Default 1)
- `duration_minutes` (INTEGER, Nullable)
- `timestamps`

### 3.4 `meeting_attendees`
Daftar peserta yang diundang serta pencatatan presensi.
- `id` (INTEGER, PK, Autoincrement)
- `meeting_id` (INTEGER, FK `meetings.id` ON DELETE CASCADE)
- `user_id` (INTEGER, FK `users.id` ON DELETE CASCADE)
- `role_in_meeting` (ENUM: `leader`, `notetaker`, `participant` — default `participant`)
- `presence_status` (ENUM: `pending`, `present`, `excused`, `absent` — default `pending`)
- `presence_time` (TIMESTAMP, Nullable)
- `notes` (TEXT, Nullable — alasan jika izin/sakit)
- `timestamps`
- *Unique Constraint:* (`meeting_id`, `user_id`)

### 3.5 `meeting_minutes` (Notulen)
Catatan resmi jalannya rapat dan kesepakatan.
- `id` (INTEGER, PK, Autoincrement)
- `meeting_id` (INTEGER, FK `meetings.id` ON DELETE CASCADE, Unique)
- `recorded_by` (INTEGER, FK `users.id`)
- `content_summary` (LONGTEXT — rangkuman jalannya rapat & pembahasan)
- `decisions` (LONGTEXT — poin-poin keputusan resmi rapat)
- `status` (ENUM: `draft`, `pending_review`, `approved` — default `draft`)
- `reviewed_by` (INTEGER, FK `users.id`, Nullable)
- `reviewed_at` (TIMESTAMP, Nullable)
- `review_notes` (TEXT, Nullable)
- `timestamps`

### 3.6 `action_items` (Tindak Lanjut Hasil Rapat)
Komitmen tugas turunan dari keputusan rapat.
- `id` (INTEGER, PK, Autoincrement)
- `meeting_id` (INTEGER, FK `meetings.id` ON DELETE CASCADE)
- `minute_id` (INTEGER, FK `meeting_minutes.id` ON DELETE SET NULL, Nullable)
- `pic_id` (INTEGER, FK `users.id`)
- `title` (VARCHAR)
- `description` (TEXT, Nullable)
- `due_date` (DATE)
- `status` (ENUM: `pending`, `in_progress`, `completed` — default `pending`)
- `completion_notes` (TEXT, Nullable)
- `completed_at` (TIMESTAMP, Nullable)
- `timestamps`

### 3.7 `documents`
Berkas pendukung rapat dan repositori kantor.
- `id` (INTEGER, PK, Autoincrement)
- `meeting_id` (INTEGER, FK `meetings.id` ON DELETE SET NULL, Nullable)
- `uploader_id` (INTEGER, FK `users.id`)
- `title` (VARCHAR)
- `file_name` (VARCHAR — nama asli file)
- `file_path` (VARCHAR — storage path di `storage/app/documents`)
- `file_size` (INTEGER — dalam bytes)
- `file_type` (VARCHAR — extension / mime, misal `pdf`, `docx`)
- `category` (ENUM: `undangan`, `materi`, `notulen_pdf`, `bukti_tindak_lanjut`)
- `timestamps`

### 3.8 `notifications`
Tabel standar Laravel Database Notification untuk push alert in-app.

---

## 4. Modul Aplikasi & Fitur Antarmuka (UI/UX)

Aplikasi dibangun menggunakan tata letak konsisten (*Sidebar + Topbar*) dengan dukungan tema terang/gelap serta responsivitas mobile.

### 4.1 Dashboard (`/dashboard`)
- **Metric Badges:**
  - Total Rapat Bulan Ini
  - Rapat Mendatang (*Upcoming*)
  - Tindak Lanjut Aktif (*Pending / In Progress*)
  - Dokumen Baru Diunggah
- **Kalender / Agenda Terdekat:** Kartu daftar rapat 7 hari ke depan dengan status & tombol akses instan.
- **Widget "Tindak Lanjut Saya":** Menampilkan tugas yang ditugaskan kepada user yang sedang login, warna indikator deadline (mendekati batas waktu / lewat batas).

### 4.2 Manajemen Rapat (`/meetings`)
- **Daftar Rapat:** Pencarian judul, filter tipe (offline/online/hybrid), filter status rapat, filter rentang tanggal.
- **Form Rapat (Create/Edit):**
  - Data Umum: Judul, deskripsi, tanggal, jam mulai & selesai, tipe, lokasi/tautan.
  - Agenda Builder: Tambah baris agenda dinamis secara berurutan.
  - Undangan Peserta: Multi-select pegawai, penentuan peran khusus (Pimpinan Rapat, Notulis, Peserta).
- **Halaman Detail Rapat (`/meetings/{id}`):**
  - **Header Ringkasan:** Status badge, tanggal/jam, lokasi, tombol aksi cepat (Mulai Rapat, Selesaikan Rapat, Cetak Notulen PDF).
  - **Tab 1 — Detail & Agenda:** Daftar agenda terurut beserta alokasi waktu.
  - **Tab 2 — Peserta & Presensi:** Tabel peserta; Notulis/Sekretaris dapat mengubah status presensi (Hadir, Izin, Absen) dengan waktu kehadiran tercatat otomatis.
  - **Tab 3 — Notulen:** Editor ringkasan dan keputusan rapat; Tombol "Ajukan Review ke Pimpinan" (oleh Notulis); Tombol "Setujui Notulen" (oleh Pimpinan); Tombol "Unduh Notulen Resmi PDF".
  - **Tab 4 — Tindak Lanjut:** Daftar tugas hasil rapat; Modal form tambah tugas baru ke PIC tertentu.
  - **Tab 5 — Dokumen:** Daftar berkas terkait rapat; Drag & drop uploader materi/undangan.

### 4.3 Repositori Dokumen (`/documents`)
- Repositori terpusat seluruh dokumen dari semua rapat.
- Filter berdasarkan Kategori (Surat Undangan, Materi Paparan, Notulen Resmi PDF, Bukti Penyelesaian).
- Filter berdasarkan Rapat Terkait.
- Tombol Unduh Aman (melalui pengecekan hak akses).

### 4.4 Modul Notulen & Ekspor PDF (`/minutes`)
- Ringkasan notulen lintas rapat.
- Status alur persetujuan:
  - `Draft`: Masih dikerjakan notulis.
  - `Pending Review`: Sudah diajukan, menunggu validasi Pimpinan.
  - `Approved`: Sudah disahkan pimpinan, terkunci dari pengeditan sembarangan.
- Fitur Ekspor PDF Resmi menggunakan `barryvdh/laravel-dompdf` dengan kop surat kantor, rincian rapat, daftar hadir, poin pembahasan, keputusan resmi, dan blok tanda tangan digital/verifikasi pimpinan.

### 4.5 Modul Tindak Lanjut / Action Items (`/action-items`)
- Dua mode tampilan: **Tabel Progres** dan **Kanban Board** (*Pending*, *In Progress*, *Completed*).
- Filter: Berdasarkan PIC (Default: menampilkan tugas saya jika role peserta), status, dan tenggat waktu.
- Modal Update Progres: PIC dapat memperbarui status, memasukkan catatan penyelesaian, dan mengunggah dokumen bukti.

### 4.6 Manajemen Pengguna (`/users` — Khusus Admin)
- Tabel daftar pengguna dengan kolom Nama, Email, Role, Departemen, Jabatan, dan Status Aktif.
- Modal Tambah & Edit Pengguna.
- Reset Password pengguna oleh Admin.

### 4.7 Notifikasi In-App (Navbar Bell Component)
- Ikon lonceng di Topbar dengan indikator angka merah (*unread badge*).
- Dropdown daftar notifikasi terbaru.
- Pemicu notifikasi otomatis:
  1. Pengguna diundang ke rapat baru.
  2. Pengguna ditugaskan sebagai PIC tindak lanjut rapat.
  3. Pimpinan menerima permintaan review notulen rapat.
  4. Peserta/Notulis menerima notifikasi saat notulen telah disetujui.

---

## 5. Keamanan, Otorisasi, & Validasi

1. **Storage Keamanan Dokumen:**
   - Semua berkas dokumen disimpan pada disk private: `storage/app/documents/`.
   - Tidak ada direct URL publik untuk dokumen rapat kantor.
   - Endpoint pengunduhan: `GET /documents/{document}/download` dijaga oleh Laravel Policy. Pengguna hanya dapat mengunduh dokumen jika memiliki role Admin/Pimpinan atau terdaftar sebagai peserta rapat terkait.
2. **Validasi Berkas:**
   - Format file yang diizinkan: `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `jpg`, `jpeg`, `png`.
   - Ukuran maksimum file: 15 MB per berkas.
3. **Integritas Status Rapat:**
   - Rapat berstatus `completed` mengunci perubahan presensi peserta.
   - Notulen berstatus `approved` hanya bisa diubah jika statusnya dibuka kembali oleh Pimpinan.

---

## 6. Struktur Data Awal & Seeder (Demo Ready)

Seeder akan menyajikan lingkungan kantor realistis dengan 4 divisi:
- **Teknologi Informasi (TI)**
- **Sumber Daya Manusia (SDM)**
- **Keuangan & Akuntansi**
- **Operasional & Umum**

### Akun Demo:
- **Admin**: `admin@kantor.id` (Budi Pratama - Admin Sistem)
- **Pimpinan**: `pimpinan@kantor.id` (Dr. H. Hendra Wijaya - Direktur Utama)
- **Sekretaris / Notulis**: `sekretaris@kantor.id` (Siti Rahmawati - Sekretaris Eksekutif)
- **Peserta 1**: `ti.andi@kantor.id` (Andi Saputra - Kepala Divisi TI)
- **Peserta 2**: `sdm.maya@kantor.id` (Maya Anggraini - Kepala Divisi SDM)
- **Peserta 3**: `keuangan.reza@kantor.id` (Reza Pahlevi - Staff Keuangan)
- **Peserta 4**: `operasional.dewi@kantor.id` (Dewi Lestari - Supervisor Operasional)
- *Password default seluruh akun:* `password`

### Data Simulasi Rapat:
1. **Rapat Evaluasi Triwulan Kinerja Operasional & Keuangan** (Status: `completed`, notulen `approved`, ada 4 item tindak lanjut, presensi lengkap, dan dokumen PDF lampiran).
2. **Rapat Koordinasi Implementasi Sistem Informasi Internal** (Status: `scheduled`, mendatang, agenda tersusun, peserta terundang).
3. **Rapat Pembahasan Anggaran Tahunan Divisi TI & SDM** (Status: `in_progress`, presensi sedang berjalan).
4. **Rapat Review Standar Operasional Prosedur (SOP) Kantor** (Status: `draft`).

---

## 7. Rencana Verifikasi & Pengujian

1. **Database & Migrasi:** Verifikasi integritas schema SQLite via `php artisan migrate:fresh --seed`.
2. **Otorisasi & Akses:**
   - Uji login tiap role (Admin, Sekretaris, Pimpinan, Peserta).
   - Verifikasi batasan akses (misal Peserta tidak dapat membuka `/users` atau meng-approve notulen).
3. **Siklus Lengkap Rapat:**
   - Pembuatan rapat baru -> input agenda -> undang peserta -> check-in presensi -> catat notulen -> assign tindak lanjut -> ajukan review -> approval pimpinan -> generate PDF.
4. **Verifikasi Unduhan Dokumen:**
   - Tes upload dan download dokumen privat.
   - Tes download hasil generate PDF notulen resmi.
5. **Linting & Tipe:**
   - Jalankan `npm run types:check` (TypeScript tsc) & `npm run check`.
   - Jalankan `composer lint:check` (Laravel Pint).
