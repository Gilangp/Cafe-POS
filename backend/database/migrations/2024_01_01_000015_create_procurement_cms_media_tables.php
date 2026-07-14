<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->string('po_number', 80)->unique();
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->string('status', 40)->default('DRAFT');
            $table->bigInteger('total_cents')->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 14, 3);
            $table->string('unit', 40);
            $table->bigInteger('unit_price_cents');
            $table->bigInteger('total_price_cents');
            $table->decimal('received_quantity', 14, 3)->default(0);
            $table->timestamps();
        });

        Schema::create('cms_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->onDelete('cascade');
            $table->string('type', 80);
            $table->integer('sort_order')->default(0);
            $table->json('content_json');
            $table->timestamps();
        });

        Schema::create('media_library', function (Blueprint $table) {
            $table->id();
            $table->string('disk', 40)->default('public');
            $table->text('path');
            $table->string('filename', 255);
            $table->string('mime_type', 120)->nullable();
            $table->bigInteger('size_bytes')->default(0);
            $table->string('alt_text', 255)->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_library');
        Schema::dropIfExists('cms_blocks');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
