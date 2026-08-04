<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel: purchase_orders, purchase_order_items
     * Sesuai dokumentasi Section 26.2 - Purchase Orders
     */
    public function up(): void
    {
        // Tabel purchase_orders (header pembelian bahan baku)
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('po_number')->unique();
            $table->foreignUuid('supplier_id')->constrained('suppliers');
            $table->foreignUuid('branch_id')->nullable();
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->enum('status', ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED'])->default('DRAFT');
            $table->bigInteger('total_cents')->default(0)->comment('Total price in cents (IDR)');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('supplier_id');
            $table->index('status');
            $table->index('order_date');
        });

        // Tabel purchase_order_items (detail item per PO)
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('purchase_order_id')->constrained('purchase_orders')->onDelete('cascade');
            $table->foreignUuid('inventory_item_id')->constrained('inventories');
            $table->decimal('quantity', 12, 2);
            $table->decimal('received_quantity', 12, 2)->default(0);
            $table->string('unit', 20);
            $table->decimal('conversion_multiplier', 12, 2)->default(1)->comment('Multiplier to convert purchase unit to inventory unit');
            $table->bigInteger('unit_price_cents')->default(0)->comment('Price per unit in cents (IDR)');
            $table->bigInteger('total_price_cents')->default(0)->comment('Total price in cents (IDR)');
            $table->timestamps();

            $table->index('purchase_order_id');
            $table->index('inventory_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
