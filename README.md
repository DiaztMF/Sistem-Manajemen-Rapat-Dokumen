# Sistem Manajemen Rapat dan Dokumen (SmartOffice Meeting & Docs)

Aplikasi web sistem internal kantor modern untuk manajemen siklus hidup rapat kerja, agenda pembahasan, presensi peserta, notulen terstruktur dengan alur approval pimpinan, ekspor berkas PDF resmi, pemantauan tindak lanjut (*action items*), dan repositori dokumen aman.

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.x-38bdf8.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. What (Apa Itu Sistem Ini?)
Sistem Manajemen Rapat dan Dokumen adalah portal internal perkantoran yang menyatukan seluruh alur kegiatan rapat ke dalam satu ekosistem terpadu. Sistem ini menghubungkan permohonan rapat, penetapan agenda, daftar kehadiran peserta, pencatatan notulen, hingga distribusi dan pelacakan komitmen hasil rapat (*tindak lanjut/action items*).

## 2. Why (Mengapa Dibutuhkan?)
- **Mencegah Hilangnya Jejak Rapat:** Seringkali hasil rapat dan dokumen tersebar di email pribadi, WhatsApp, dan folder lokal pegawai.
- **Transparansi & Akuntabilitas:** Setiap komitmen hasil rapat tercatat dengan jelas penanggung jawabnya (PIC), batas waktu (*due date*), serta status penyelesaiannya.
- **Legalitas Dokumen Formal:** Notulen rapat melalui alur validasi dan persetujuan oleh Pimpinan Sidang sebelum dapat diekspor menjadi format PDF resmi berkop surat.

---

## 3. Akun Demo Bawaan (Default Credentials)

Semua akun menggunakan kata sandi default: `password`

| Peran (Role) | Nama Pengguna | Alamat Email | Departemen / Jabatan |
|---|---|---|---|
| **Admin** | Budi Pratama | `admin@kantor.id` | TI / Administrator Sistem |
| **Peserta (Eksekutif)** | Dr. H. Hendra Wijaya | `pimpinan@kantor.id` | Manajemen Eksekutif / Direktur Utama |
| **Peserta (Tata Usaha)** | Siti Rahmawati | `sekretaris@kantor.id` | Tata Usaha / Sekretaris Eksekutif |
| **Peserta (TI)** | Andi Saputra | `ti.andi@kantor.id` | TI / Kepala Divisi TI |
| **Peserta (SDM)** | Maya Anggraini | `sdm.maya@kantor.id` | SDM / Kepala Divisi SDM |
| **Peserta (Keuangan)** | Reza Pahlevi | `keuangan.reza@kantor.id` | Keuangan / Analis Keuangan |
| **Peserta (Operasional)** | Dewi Lestari | `operasional.dewi@kantor.id` | Operasional / Supervisor Operasional |

---

## 4. Fitur Utama & Modul

1. **Dashboard Eksekutif & Personal:**
   - 4 Kartu KPI: Total Rapat Bulan Ini, Rapat Mendatang, Tugas Tindak Lanjut Aktif, dan Dokumen Terbaru.
   - Kalender/Daftar Rapat Terdekat dengan tombol akses instan.
   - Widget "Tindak Lanjut Tugas Saya" dengan indikator warna batas waktu (*Overdue*, *Upcoming*, *Completed*).
2. **Manajemen Rapat (`/meetings`):**
   - Filter status (`scheduled`, `in_progress`, `completed`, `cancelled`), tipe (`offline`, `online`, `hybrid`), dan tanggal.
   - Form pembuatan rapat dengan *dynamic agenda builder* dan *multi-department attendee selector*.
   - Halaman detail rapat dengan antarmuka 5 tab terintegrasi:
     - **Tab 1 — Detail & Agenda:** Rincian waktu, lokasi/tautan, dan susunan topik.
     - **Tab 2 — Peserta & Presensi:** Tabel absensi real-time (Hadir, Izin, Absen) berwaktu otomatis.
     - **Tab 3 — Notulen:** Editor catatan & keputusan, alur pengajuan review, approval admin, dan unduh PDF.
     - **Tab 4 — Tindak Lanjut:** Manajemen penugasan PIC, deadline, dan update progress penyelesaian.
     - **Tab 5 — Dokumen:** Unggah & unduh materi presentasi, surat undangan, dan berkas lampiran.
3. **Notulen Rapat & Ekspor PDF (`/minutes`):**
   - Repositori notulen rapat kantor.
   - Alur verifikasi: *Draft* -> *Pending Review* -> *Approved*.
   - Ekspor PDF Notulen Resmi ber-kop surat resmi kantor via `barryvdh/laravel-dompdf`.
4. **Tindak Lanjut / Action Items (`/action-items`):**
   - Mode ganda: Tampilan Tabel Rinci dan Papan Kanban (*Pending*, *In Progress*, *Completed*).
   - Filter cepat berdasarkan PIC, rapat, dan status ketercapaian.
5. **Repositori Dokumen Terpusat (`/documents`):**
   - Filter kategori: Surat Undangan, Materi Paparan, Notulen Resmi PDF, Bukti Tindak Lanjut.
   - Penyimpanan privat (`storage/app/documents`) dengan download terlindungi otorisasi policy.
6. **Manajemen Pengguna (`/users` — Khusus Admin):**
   - Kelola akun pegawai, perubahan role, divisi/departemen, jabatan, dan toggle status aktif.
7. **Notifikasi In-App (Navbar Bell):**
   - Lonceng notifikasi real-time dengan counter unread badge, popover daftar notifikasi, dan tombol mark all as read.

---

## 5. Panduan Instalasi & Menjalankan Aplikasi

### Kebutuhan Sistem:
- PHP >= 8.3
- Composer >= 2.x
- Node.js >= 20.x & npm
- SQLite3

### Langkah Pemasangan:

```bash
# 1. Masuk ke direktori proyek
cd "D:\Project\Web Project\Private Web\Sistem-Manajemen-Rapat-Dokumen"

# 2. Salin konfigurasi environment jika belum ada
cp .env.example .env

# 3. Pasang dependensi PHP & Node.js
composer install
npm install

# 4. Generate application key
php artisan key:generate

# 5. Jalankan migrasi dan isi database dengan data demo
php artisan migrate:fresh --seed

# 6. Kompilasi asset frontend
npm run build

# 7. Jalankan server lokal
php artisan dev
```

Buka peramban di `http://localhost:8000` dan masuk menggunakan salah satu akun demo di atas.

---

## 6. Verifikasi & Pengujian Kode

```bash
# Jalankan seluruh unit & feature test (Pest PHP)
php artisan test

# Pemeriksaan tipe TypeScript
npm run types:check

# Format kode otomatis (Laravel Pint)
./vendor/bin/pint
```

---

## 7. Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
