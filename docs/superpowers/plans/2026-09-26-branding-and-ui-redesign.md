# Re-Branding & UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghilangkan seluruh elemen template default Laravel dan mendesain ulang Logo, Landing Page (`welcome.tsx`), Login (`login.tsx`), menonaktifkan registrasi publik, dan membersihkan tautan default di sidebar.

**Architecture:** Frontend React 19 + Inertia + Tailwind v4 dengan komponen Radix/shadcn. Desain korporat modern bernuansa kantor internal (*SmartOffice SIMRAD*).

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, Lucide React, Inertia.js 3, Laravel 13 Fortify.

---

### Task 1: Re-Brand Logo & Name (`AppLogoIcon` & `AppLogo`)
- Ubah ikon di `resources/js/components/app-logo-icon.tsx` menjadi SVG simbol modern kalender rapat + dokumen perisai.
- Perbarui `resources/js/components/app-logo.tsx` agar menampilkan nama "SmartOffice SIMRAD" dengan subtitle "Sistem Manajemen Rapat & Dokumen".

### Task 2: Disable Public Registration in Fortify
- Ubah `config/fortify.php` untuk menonaktifkan `Features::registration()`.
- Tambahkan redirect jika ada yang mengakses `/register` langsung agar diarahkan ke `/login`.

### Task 3: Redesign Landing Page (`resources/js/pages/welcome.tsx`)
- Desain ulang total `welcome.tsx` menjadi portal beranda korporat profesional.
- Sertakan Hero Section, 4 Pilar Sistem Rapat & Dokumen, ringkasan Akun Demo untuk kemudahan uji coba, dan Footer resmi kantor.

### Task 4: Redesign Login Page with Quick Demo Switcher (`resources/js/pages/auth/login.tsx`)
- Perbarui `login.tsx` dengan branding SmartOffice SIMRAD.
- Tambahkan panel 1-klik Quick Demo Account Switcher (Admin, Pimpinan, Notulis, Peserta).
- Hapus tautan registrasi.

### Task 5: Clean Navigation Links (`app-sidebar.tsx` & `app-header.tsx`)
- Hapus tautan bawaan Laravel ("Repository" github dan "Documentation" laravel).

### Task 6: Pre-Build Assets & Deploy to GitHub
- Jalankan `npm run build` dan `php artisan test`.
- Commit dan push ke master branch untuk auto-deploy ke Render.
