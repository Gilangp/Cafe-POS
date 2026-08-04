<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah idempotency_key ke transactions untuk mencegah duplikasi
     * transaksi POS saat retry/double-submit/offline sync (CP-06, NFR-12).
     * Lihat 04_modules_specification.md §17.5.3.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('idempotency_key', 100)->nullable()->unique()->after('invoice_number');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('idempotency_key');
        });
    }
};
