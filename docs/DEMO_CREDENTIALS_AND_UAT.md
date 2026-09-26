# Panduan & Kredensial Akun Demo (User Acceptance Testing)

Dokumen ini memuat daftar akun uji coba (*demo accounts*) serta skenario pengujian penerimaan pengguna (*User Acceptance Testing* / UAT) untuk **Sistem Manajemen Rapat dan Dokumen Kantor**.

---

## 1. Daftar Akun Pengguna Berdasarkan Peran

Semua akun pengujian di bawah ini telah di-generate secara otomatis melalui `php artisan migrate:fresh --seed`.

> **Kata Sandi (Password) Default Seluruh Akun:** `password`

| No | Peran (Role) | Nama Pengguna | Alamat Email | Departemen | Jabatan | Deskripsi Kewenangan |
|---|---|---|---|---|---|---|
| 1 | **Admin** | Budi Pratama | `admin@kantor.id` | Teknologi Informasi | Administrator Sistem | Hak akses penuh: kelola akun pengguna, reset status aktif/nonaktif, konfigurasi master sistem, dan pemantauan menyeluruh. |
| 2 | **Pimpinan** | Dr. H. Hendra Wijaya | `pimpinan@kantor.id` | Manajemen Eksekutif | Direktur Utama | Memimpin rapat, meninjau (*review*) notulen, memberikan persetujuan (*approval*) notulen resmi, dan memonitor seluruh capaian tindak lanjut. |
| 3 | **Sekretaris / Notulis** | Siti Rahmawati | `sekretaris@kantor.id` | Tata Usaha & Protokoler | Sekretaris Eksekutif | Menjadwalkan rapat baru, menyusun agenda, mengundang peserta, mencatat presensi kehadiran peserta, menyusun notulen rapat, mengajukan notulen ke Pimpinan, dan mengunggah dokumen rapat. |
| 4 | **Peserta (TI)** | Andi Saputra | `ti.andi@kantor.id` | Teknologi Informasi | Kepala Divisi TI | Menghadiri rapat terkait, mengunduh materi paparan, dan mengeksekusi serta memperbarui progress tugas tindak lanjut divisi TI. |
| 5 | **Peserta (SDM)** | Maya Anggraini | `sdm.maya@kantor.id` | Sumber Daya Manusia | Kepala Divisi SDM | Menghadiri rapat divisi SDM, mengakses notulen, dan menyelesaikan komitmen tindak lanjut SDM. |
| 6 | **Peserta (Keuangan)** | Reza Pahlevi | `keuangan.reza@kantor.id` | Keuangan & Akuntansi | Analis Keuangan | Mengakses rapat triwulan anggaran, mengunggah laporan keuangan, dan mengupdate status tindak lanjut rekonsiliasi faktur. |
| 7 | **Peserta (Operasional)** | Dewi Lestari | `operasional.dewi@kantor.id` | Operasional & Umum | Supervisor Operasional | Menghadiri rapat operasional, memantau tugas pemeliharaan gedung/fasilitas, dan melampirkan bukti penyelesaian tugas. |

---

## 2. Matriks Otorisasi Fitur

| Modul / Fitur | Admin | Sekretaris | Pimpinan | Peserta |
|---|:---:|:---:|:---:|:---:|
| **Dashboard Metrik & Kalender Rapat** | ✅ | ✅ | ✅ | ✅ |
| **Lihat Daftar Rapat & Detail Rapat** | ✅ | ✅ | ✅ | ✅ (Rapat Terundang) |
| **Buat / Edit / Hapus Rapat** | ✅ | ✅ | ❌ | ❌ |
| **Ubah Status Rapat (Mulai / Selesai)** | ✅ | ✅ | ❌ | ❌ |
| **Catat & Ubah Presensi Peserta** | ✅ | ✅ | ❌ | ❌ |
| **Tulis & Edit Draf Notulen** | ✅ | ✅ | ❌ | ❌ |
| **Ajukan Notulen untuk Review** | ✅ | ✅ | ❌ | ❌ |
| **Setujui / Minta Revisi Notulen** | ✅ | ❌ | ✅ | ❌ |
| **Ekspor / Unduh PDF Notulen Resmi** | ✅ | ✅ | ✅ | ✅ (Rapat Terundang) |
| **Tambah Tindak Lanjut Baru** | ✅ | ✅ | ❌ | ❌ |
| **Perbarui Progress Tindak Lanjut (PIC)** | ✅ | ✅ | ❌ | ✅ (Tugas Milik Sendiri) |
| **Unggah Dokumen Rapat** | ✅ | ✅ | ✅ | ✅ |
| **Unduh Berkas Dokumen Terproteksi** | ✅ | ✅ | ✅ | ✅ (Rapat Terundang) |
| **Manajemen Pengguna (`/users`)** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Skenario Uji Coba Penerimaan Pengguna (UAT Checklist)

### Skenario 1: Sekretaris Menjadwalkan Rapat & Mengundang Peserta
1. Masuk (*Login*) sebagai `sekretaris@kantor.id` (password: `password`).
2. Buka menu **Manajemen Rapat** -> Klik **Jadwalkan Rapat Baru**.
3. Isi informasi rapat:
   - Judul: `Rapat Koordinasi Implementasi SOP Baru`
   - Tanggal & Waktu: Pilih tanggal mendatang, jam 09:00 - 11:00.
   - Tipe: `Offline` / Ruang Rapat Lantai 2.
   - Tambah minimal 2 poin agenda.
   - Pilih peserta: `pimpinan@kantor.id` (sebagai Pimpinan Rapat) dan `ti.andi@kantor.id` (sebagai Peserta).
4. Klik **Jadwalkan Rapat**.
5. *Ekspektasi:* Rapat berhasil dibuat, berstatus `scheduled`, dan muncul di daftar rapat serta dashboard.

### Skenario 2: Sekretaris Menjalankan Presensi & Mencatat Notulen
1. Pada detail rapat di atas, klik tombol **Mulai Rapat** (status berubah jadi `in_progress`).
2. Masuk ke **Tab Peserta & Presensi**: ubah status kehadiran `ti.andi@kantor.id` menjadi `Hadir` (*Present*).
3. Masuk ke **Tab Notulen**: ketikkan rangkuman jalannya rapat dan poin keputusan resmi.
4. Klik **Ajukan Review ke Pimpinan**.
5. *Ekspektasi:* Status notulen berubah menjadi `pending_review` dan Pimpinan menerima notifikasi.

### Skenario 3: Pimpinan Memeriksa & Menyetujui Notulen
1. Keluar (*Logout*) dan masuk sebagai `pimpinan@kantor.id`.
2. Buka notifikasi atau buka langsung rapat yang dimaksud.
3. Masuk ke **Tab Notulen** -> Periksa ringkasan dan keputusan rapat.
4. Klik tombol **Setujui Notulen** (bisa mengisi catatan pengesahan).
5. Klik **Unduh PDF Notulen Resmi**.
6. *Ekspektasi:* Status notulen menjadi `approved` (terverifikasi) dan berkas PDF ber-kop surat resmi berhasil diunduh.

### Skenario 4: Pegawai Memperbarui Status Tindak Lanjut
1. Masuk sebagai `ti.andi@kantor.id`.
2. Buka menu **Tindak Lanjut** -> Beralih ke **Tampilan Kanban**.
3. Cari tugas tindak lanjut yang ditugaskan ke Andi Saputra.
4. Klik tombol **Perbarui Status** -> Ubah dari `In Progress` menjadi `Completed`, tambahkan catatan penyelesaian.
5. *Ekspektasi:* Tugas berpindah ke kolom *Completed*, tersimpan di database, dan progres ketercapaian terupdate.

### Skenario 5: Admin Mengelola Akun Pegawai
1. Masuk sebagai `admin@kantor.id`.
2. Buka menu **Manajemen Pengguna** (`/users`).
3. Klik **Tambah Pengguna Baru** -> Daftarkan staf baru di divisi Keuangan.
4. Uji filter berdasarkan role dan divisi.
5. Coba buka URL `/users` menggunakan akun peserta untuk memastikan proteksi 403 Forbidden berjalan efektif.
