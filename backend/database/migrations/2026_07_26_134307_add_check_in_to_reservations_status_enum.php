<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('menunggu_konfirmasi', 'dikonfirmasi', 'check_in', 'ditolak', 'selesai', 'dibatalkan') DEFAULT 'menunggu_konfirmasi'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('menunggu_konfirmasi', 'dikonfirmasi', 'ditolak', 'selesai', 'dibatalkan') DEFAULT 'menunggu_konfirmasi'");
    }
};
