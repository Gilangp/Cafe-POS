<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabel: tables, reservations, transactions, transaction_items, order_tickets, order_ticket_items
     * Sesuai dokumentasi Section 26.2 - POS & Kitchen Tables
     */
    public function up(): void
    {
        // Tabel tables (meja fisik)
        Schema::create('tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('table_number', 20)->unique();
            $table->integer('capacity')->default(2);
            $table->enum('status', ['tersedia', 'terisi', 'reservasi'])->default('tersedia');
            $table->timestamps();

            $table->index('status');
        });

        // Tabel reservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reservation_code', 15)->unique()->nullable();
            $table->foreignUuid('table_id')->nullable()->constrained('tables')->nullOnDelete();
            $table->string('customer_name', 100);
            $table->string('customer_email', 150)->nullable();
            $table->string('customer_phone', 20);
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->integer('party_size')->default(2);
            $table->string('purpose', 50)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['menunggu_konfirmasi', 'dikonfirmasi', 'check_in', 'ditolak', 'selesai', 'dibatalkan'])->default('menunggu_konfirmasi');
            $table->timestamps();

            $table->index(['reservation_date', 'status'], 'idx_reservations_date_status');
            $table->index('table_id');
            $table->index('customer_phone');
        });

        // Tabel transactions (header transaksi POS)
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 30)->unique();
            $table->foreignUuid('cashier_id')->constrained('users');
            $table->enum('order_type', ['dine_in', 'takeaway'])->default('dine_in');
            $table->string('table_number', 20)->nullable();
            $table->string('customer_name', 100)->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0)->comment('Tax/PPN amount calculated at time of sale');
            $table->decimal('total', 12, 2);
            $table->enum('payment_method', ['tunai', 'qris', 'kartu']);
            $table->enum('status', ['selesai', 'void'])->default('selesai');
            $table->text('void_reason')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index('cashier_id');
            $table->index('status');
            $table->index('payment_method');
        });

        // Tabel transaction_items
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
            $table->index('menu_id');
        });

        // Tabel order_tickets (tiket pesanan untuk KDS)
        Schema::create('order_tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_id')->unique()->constrained('transactions')->onDelete('cascade');
            $table->string('ticket_number', 30)->unique();
            $table->enum('status', ['diterima', 'diproses', 'siap', 'disajikan', 'dibatalkan'])->default('diterima');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('received_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('received_at');
            $table->index('assigned_to');
        });

        // Tabel order_ticket_items
        Schema::create('order_ticket_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_ticket_id')->constrained('order_tickets')->onDelete('cascade');
            $table->string('menu_name_snapshot', 150);
            $table->integer('quantity');
            $table->string('note', 200)->nullable();
            $table->enum('item_status', ['menunggu', 'diproses', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->timestamps();

            $table->index('order_ticket_id');
            $table->index('item_status');
        });
    }

    /**
     * Reverse the migrations.
     */
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
