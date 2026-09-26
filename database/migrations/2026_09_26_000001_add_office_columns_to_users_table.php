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
