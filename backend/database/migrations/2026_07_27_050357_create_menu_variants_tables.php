<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('variant_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->enum('type', ['single', 'multiple'])->default('single');
            $table->timestamps();
        });

        Schema::create('variant_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('variant_group_id')->constrained('variant_groups')->onDelete('cascade');
            $table->string('name', 100);
            $table->decimal('additional_price', 12, 2)->default(0);
            $table->foreignUuid('inventory_item_id')->nullable()->constrained('inventories')->nullOnDelete();
            $table->enum('inventory_action', ['none', 'multiply', 'swap', 'add'])->default('none');
            $table->decimal('inventory_action_value', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('menu_variant_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('menu_id')->constrained('menus')->onDelete('cascade');
            $table->foreignUuid('variant_group_id')->constrained('variant_groups')->onDelete('cascade');
            $table->boolean('is_required')->default(false);
            $table->timestamps();
        });

        Schema::create('transaction_item_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('transaction_item_id')->constrained('transaction_items')->onDelete('cascade');
            $table->foreignUuid('variant_option_id')->nullable()->constrained('variant_options')->nullOnDelete();
            $table->string('option_name_snapshot', 100);
            $table->decimal('additional_price_snapshot', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_item_variants');
        Schema::dropIfExists('menu_variant_groups');
        Schema::dropIfExists('variant_options');
        Schema::dropIfExists('variant_groups');
    }
};
