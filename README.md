# Office Management — Sistem Manajemen Rapat dan Dokumen

Portal internal kantor untuk mengelola siklus rapat dari agenda sampai arsip dokumen dalam satu tempat.

[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.x-38bdf8.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Daftar Isi

- [Installation](#installation)
- [Quick Start](#quick-start)
- [What](#what)
- [Why](#why)
- [API / Routes](#api--routes)
- [Examples](#examples)
- [Architecture & Development Guides](#architecture--development-guides)
- [License](#license)

## Installation

Ikuti urutan ini dari nol sampai aplikasi bisa dibuka di browser.

**1. Siapkan kebutuhan sistem**

- PHP `^8.3` (lihat `composer.json:12`, teruji jalan di PHP 8.4)
- Composer >= 2.x
- Node.js >= 20.x dan npm >= 10.x (repo ini pakai `package-lock.json`, jadi pakai `npm`, bukan pnpm/yarn)
- SQLite3 (default, tanpa setup server database)

**2. Clone repo dan masuk ke foldernya**

```bash
git clone https://github.com/DiaztMF/Sistem-Manajemen-Rapat-Dokumen.git
cd Sistem-Manajemen-Rapat-Dokumen
```

**3. Salin file environment**

```bash
cp .env.example .env
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Isi bawaan `.env.example` sudah cukup untuk jalan lokal: `APP_NAME="Office Management"`, `APP_URL=http://localhost:8000`, `APP_TIMEZONE=Asia/Jakarta`, `DB_CONNECTION=sqlite`.

**4. Install dependensi PHP**

```bash
composer install
```

**5. Install dependensi Node**

```bash
npm install
```

**6. Generate application key**

```bash
php artisan key:generate
```

**7. Siapkan database dan isi data demo**

```bash
php artisan migrate:fresh --seed
```

Kalau SQLite mengeluh file database belum ada, buat dulu filenya lalu ulangi perintah di atas:

```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
```

Seeder (`database/seeders/DatabaseSeeder.php`) membuat 7 akun demo plus contoh rapat, agenda, presensi, notulen approved, tindak lanjut, dan dokumen.

**8. Build asset frontend**

```bash
npm run build
```

**9. Jalankan server lokal**

```bash
php artisan dev
```

Lalu buka `http://localhost:8000` dan login pakai salah satu akun di tabel Examples. Kalau port 8000 dipakai, jalankan `php artisan serve --port=8001` dan sesuaikan `APP_URL`.

## Quick Start

Perintah paling ringkas dari kondisi repo baru sampai login (di bawah 20 baris, copy-paste berurutan):

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate:fresh --seed
npm run build
php artisan dev
```

Buka `http://localhost:8000`, login dengan `admin@kantor.id` / `password`.

## What

Office Management adalah portal internal yang menyatukan alur rapat: jadwal dan agenda, daftar hadir peserta, notulen dengan alur persetujuan, tindak lanjut ber-PIC dan bertenggat, sampai arsip dokumen. Peserta hanya melihat rapat yang ia ikuti, admin melihat semuanya.

## Why

Hasil rapat sering tercecer di chat pribadi dan folder lokal. Aplikasi ini dibuat supaya jejak rapat tidak hilang, tiap komitmen jelas siapa PIC dan tenggatnya, dan notulen yang sudah disetujui bisa diunduh sebagai PDF resmi. Penggunanya tim internal kantor: admin/TI, pimpinan, sekretaris, dan kepala divisi peserta rapat.

## API / Routes

Semua route aplikasi butuh login (`auth`), kecuali landing `/`. Verifikasi email sudah dimatikan, jadi akun baru langsung bisa masuk. Sumber: `routes/web.php`, `routes/settings.php`.

| Method | URI | Controller@method | Nama route |
|---|---|---|---|
| GET | `/` | Inertia `welcome` | `home` |
| GET | `/dashboard` | DashboardController@index | `dashboard` |
| GET | `/meetings` | MeetingController@index | `meetings.index` |
| GET | `/meetings/create` | MeetingController@create | `meetings.create` |
| POST | `/meetings` | MeetingController@store | `meetings.store` |
| GET | `/meetings/{meeting}` | MeetingController@show | `meetings.show` |
| GET | `/meetings/{meeting}/edit` | MeetingController@edit | `meetings.edit` |
| PUT | `/meetings/{meeting}` | MeetingController@update | `meetings.update` |
| PATCH | `/meetings/{meeting}/status` | MeetingController@updateStatus | `meetings.update-status` |
| DELETE | `/meetings/{meeting}` | MeetingController@destroy | `meetings.destroy` |
| PATCH | `/meetings/{meeting}/attendees/{attendee}` | MeetingAttendeeController@update | `meetings.attendees.update` |
| GET | `/minutes` | MeetingMinuteController@index | `minutes.index` |
| POST | `/meetings/{meeting}/minutes` | MeetingMinuteController@storeOrUpdate | `meetings.minutes.store` |
| PATCH | `/minutes/{minute}/approve` | MeetingMinuteController@approve | `minutes.approve` |
| GET | `/minutes/{minute}/export-pdf` | MeetingMinuteController@exportPdf | `minutes.export-pdf` |
| GET | `/action-items` | ActionItemController@index | `action-items.index` |
| POST | `/meetings/{meeting}/action-items` | ActionItemController@store | `meetings.action-items.store` |
| PATCH | `/action-items/{actionItem}` | ActionItemController@update | `action-items.update` |
| DELETE | `/action-items/{actionItem}` | ActionItemController@destroy | `action-items.destroy` |
| GET | `/documents` | DocumentController@index | `documents.index` |
| POST | `/documents` | DocumentController@store | `documents.store` |
| GET | `/documents/{document}/download` | DocumentController@download | `documents.download` |
| DELETE | `/documents/{document}` | DocumentController@destroy | `documents.destroy` |
| GET | `/notifications` | NotificationController@index | `notifications.index` |
| PATCH | `/notifications/{id}/read` | NotificationController@markAsRead | `notifications.read` |
| PATCH | `/notifications/read-all` | NotificationController@markAllAsRead | `notifications.read-all` |
| GET/POST/PATCH/DELETE | `/users` | UserController (resource, tanpa create/show/edit) | `users.*` |
| GET/PATCH/DELETE | `/settings/profile` | Settings\ProfileController | `profile.*` |
| GET/PUT | `/settings/password` | Settings\SecurityController | `user-password.update` |
| GET | `/settings/appearance` | Inertia `settings/appearance` | `appearance.edit` |

Halaman Inertia utama: `welcome`, `dashboard`, `meetings/index|create|edit|show`, `minutes/index`, `action-items/index`, `documents/index`, `users/index`, `settings/profile|security|appearance`, `auth/login`.

## Examples

Semua akun demo pakai password: `password`.

| Role | Nama | Email |
|---|---|---|
| Admin | Budi Pratama | `admin@kantor.id` |
| Peserta | Dr. H. Hendra Wijaya | `pimpinan@kantor.id` |
| Peserta | Siti Rahmawati | `sekretaris@kantor.id` |
| Peserta | Andi Saputra | `ti.andi@kantor.id` |
| Peserta | Maya Anggraini | `sdm.maya@kantor.id` |
| Peserta | Reza Pahlevi | `keuangan.reza@kantor.id` |
| Peserta | Dewi Lestari | `operasional.dewi@kantor.id` |

**Alur 1: rapat selesai sampai notulen disetujui.** Login sebagai sekretaris, buka `/meetings`, buat rapat lengkap dengan agenda dan peserta. Catat presensi di tab Peserta. Tulis ringkasan dan keputusan di tab Notulen, ajukan review. Login sebagai admin, buka notulen yang sama, setujui. Status berubah `draft` -> `pending_review` -> `approved`, tombol unduh PDF aktif.

**Alur 2: tindak lanjut sampai selesai.** Dari detail rapat yang notulennya approved, buka tab Tindak Lanjut, buat tugas dengan PIC dan tenggat (contoh seeder: proposal sistem ke Andi, rekonsiliasi faktur ke Reza). PIC yang ditugaskan login, buka `/action-items`, ubah status `pending` -> `in_progress` -> `completed` beserta catatan penyelesaian.

**Alur 3: arsip dokumen.** Admin buka `/documents`, unggah berkas dengan kategori (undangan, materi, notulen PDF, bukti tindak lanjut), bisa dikaitkan ke rapat tertentu. Peserta mengunduh lewat tombol unduh di tabel atau dari tab Dokumen di detail rapat. Hapus berkas dan hapus akun selalu lewat dialog konfirmasi custom, bukan popup browser.

**Cek kesehatan kode setelah ubah-ubah:**

```bash
php artisan test
npm run types:check
./vendor/bin/pint --test
```

## Architecture & Development Guides

Stack: Laravel 13 + Inertia v3 + React 19 + TypeScript + Tailwind v4 + Vite (vite-plus) + Wayfinder + Fortify + Passkeys + DomPDF + Pest. Database default SQLite, timezone `Asia/Jakarta`. Otorisasi berbasis policy plus scoping peserta lewat relasi attendees.

Panduan kerja agen dan aturan main repo ada di `AGENTS.md`.

## License

Proyek ini berlisensi [MIT](LICENSE).
