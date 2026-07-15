<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('table_number', 20)->unique();
            $table->integer('capacity')->default(2);
            $table->enum('status', ['tersedia', 'terisi', 'reservasi'])->default('tersedia');
            $table->timestamps();
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('table_id')->nullable()->constrained('tables')->nullOnDelete();
            $table->string('name', 100);
            $table->string('phone', 20);
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->integer('guest_count');
            $table->string('purpose', 50)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['menunggu', 'dikonfirmasi', 'ditolak', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->timestamps();

            $table->index(['reservation_date', 'status'], 'idx_reservations_date_status');
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 30)->unique();
            $table->foreignUuid('cashier_id')->constrained('users');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->enum('payment_method', ['tunai', 'qris', 'kartu']);
            $table->enum('status', ['selesai', 'void'])->default('selesai');
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index('cashier_id');
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->foreignUuid('menu_id')->nullable()->constrained('menus')->nullOnDelete();
            $table->string('menu_name_snapshot', 150);
            $table->decimal('price_snapshot', 12, 2);
            $table->integer('quantity');
            $table->string('note', 200)->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();

            $table->index('transaction_id');
        });

        Schema::create('order_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_id')->unique()->constrained('transactions')->onDelete('cascade');
            $table->string('ticket_number', 30)->unique();
            $table->enum('status', ['diterima', 'diproses', 'siap', 'diserahkan'])->default('diterima');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('received_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('received_at');
        });

        Schema::create('order_ticket_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_ticket_id')->constrained('order_tickets')->onDelete('cascade');
            $table->string('menu_name_snapshot', 150);
            $table->integer('quantity');
            $table->string('note', 200)->nullable();
            $table->enum('item_status', ['diterima', 'diproses', 'siap'])->default('diterima');
            $table->timestamps();

            $table->index('order_ticket_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_ticket_items');
        Schema::dropIfExists('order_tickets');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('tables');
    }
};
