# SmartOffice SIMRAD — Re-Branding & UI Redesign Specification

**Tanggal:** 2026-09-26  
**Status:** Approved by User  
**Tujuan:** Menghilangkan seluruh artefak template bawaan Laravel (logo, tautan dokumentasi eksternal, teks starter kit) dan mendesain ulang Landing Page, Halaman Login, Logo, dan navigasi menjadi antarmuka korporat profesional internal kantor ("SmartOffice SIMRAD").

---

## 1. Identitas Branding Baru
- **Nama Aplikasi:** SmartOffice SIMRAD (*Sistem Manajemen Rapat & Dokumen*).
- **Logo Vektor:** Ikon kustom gabungan Calendar + Document + Shield di `AppLogoIcon.tsx` dan `AppLogo.tsx`.
- **Warna Identitas:** Modern slate / indigo / emerald accent dengan dukungan dark mode dan light mode penuh.

## 2. Landing Page (`resources/js/pages/welcome.tsx`)
- Menggantikan halaman welcome bawaan Laravel 100%.
- Menampilkan:
  - Header: Logo SmartOffice SIMRAD, Status login (Tombol Dashboard jika sudah login, atau Tombol Masuk ke Sistem).
  - Hero Section: Judul "Portal Terpadu Pengelolaan Rapat & Arsip Dokumen Kantor", deskripsi profesional, tombol CTA.
  - Alur 4 Pilar Rapat (Penjadwalan & Presensi, Notulen & Approval Pimpinan, Tindak Lanjut & Kanban, Repositori Dokumen).
  - Quick Info Demo Accounts: Panduan kredensial akun uji coba bagi reviewer/pimpinan.
  - Footer korporat internal kantor (tanpa link Laravel docs / github starter kit).

## 3. Halaman Login (`resources/js/pages/auth/login.tsx`)
- Header Login: Logo SmartOffice SIMRAD dan teks "Portal Masuk Pegawai".
- Menghilangkan link "Sign up" / "Register".
- Menyediakan widget **Quick Demo Account Switcher** (1-klik isi akun Admin, Pimpinan, Sekretaris, atau Peserta).
- Tetap mendukung input manual email dan password serta remember me.

## 4. Penutupan Registrasi Publik (`/register`)
- Di `config/fortify.php`, fitur `Features::registration()` dinonaktifkan atau route diarahkan kembali ke `/login`.
- Registrasi hanya dilakukan secara internal oleh Admin melalui menu Manajemen Pengguna (`/users`).

## 5. Pembersihan Tautan Default di Sidebar & Header
- Menghapus tautan "Repository" dan "Documentation" dari footer sidebar (`app-sidebar.tsx`) dan header (`app-header.tsx`).
