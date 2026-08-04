<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel: inventory_categories, suppliers, inventories, inventory_logs, menu_ingredients, audit_logs, media
     * Sesuai dokumentasi Section 26.2 - Inventories & Purchase Orders
     */
    public function up(): void
    {
        // Tabel inventory_categories
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->timestamps();
        });

        // Tabel suppliers
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();

            $table->index('name');
        });

        // Tabel inventories (master bahan baku)
        Schema::create('inventories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('inventory_categories')->onDelete('cascade');
            $table->foreignUuid('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('name', 150);
            $table->decimal('stock_quantity', 12, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0)->comment('Price per unit in IDR');
            $table->string('unit', 20);
            $table->decimal('minimum_stock', 12, 2)->default(0);
            $table->timestamps();

            $table->index('stock_quantity');
            $table->index('category_id');
            $table->index('supplier_id');
        });

        // Tabel inventory_logs (riwayat mutasi stok)
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('inventory_id')->constrained('inventories')->onDelete('cascade');
            $table->enum('type', ['masuk', 'keluar']);
            $table->decimal('quantity', 12, 2);
            $table->string('reference_type', 50)->nullable(); // transaction, purchase_order, manual
            $table->uuid('reference_id')->nullable();
            $table->foreignUuid('user_id')->constrained('users');
            $table->timestamps();

            $table->index('inventory_id');
            $table->index('type');
            $table->index(['reference_type', 'reference_id']);
            $table->index('created_at');
        });

        // Tabel menu_ingredients (resep: bahan baku per menu)
        Schema::create('menu_ingredients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('menu_id')->constrained('menus')->onDelete('cascade');
            $table->foreignUuid('inventory_id')->constrained('inventories')->onDelete('cascade');
            $table->decimal('quantity_used', 12, 2);
            $table->timestamps();

            $table->index('menu_id');
            $table->index('inventory_id');
        });

        // Tabel audit_logs (log aktivitas penting pengguna)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('module', 50);
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('module');
            $table->index('created_at');
        });

        // Tabel media (metadata file yang di-upload)
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('file_name', 255);
            $table->string('file_path', 255);
            $table->string('mime_type', 100)->nullable();
            $table->bigInteger('size')->nullable();
            $table->foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('uploaded_by');
            $table->index('mime_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('menu_ingredients');
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('inventories');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('inventory_categories');
    }
};
