<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Remap akun lama ke model 2-role klien (admin, peserta).
     *
     * - sekretaris -> admin (kemampuan kelolanya setara admin: rapat, dokumen, notulen, tindak lanjut)
     * - pimpinan -> peserta (hak lihat + tindak lanjut miliknya; approve pindah ke admin)
     */
    public function up(): void
    {
        DB::table('users')->where('role', 'sekretaris')->update(['role' => 'admin']);
        DB::table('users')->where('role', 'pimpinan')->update(['role' => 'peserta']);
    }

    public function down(): void
    {
        // Tidak bisa dikembalikan otomatis: informasi role lama sudah hilang.
    }
};
