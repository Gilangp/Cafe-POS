<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('idempotency_key', 120)->nullable()->unique();
            $table->string('kitchen_status', 40)->default('PENDING'); // PENDING, IN_PROGRESS, READY, SERVED
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropColumn(['idempotency_key', 'kitchen_status']);
        });
    }
};
