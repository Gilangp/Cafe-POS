<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabel: categories, menus, promotions, menu_promotions
     * Sesuai dokumentasi Section 26.2 - Menus & Categories
     */
    public function up(): void
    {
        // Tabel categories
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('display_order');
        });

        // Tabel menus
        Schema::create('menus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name', 150);
            $table->string('slug', 180)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('image', 255)->nullable();
            $table->enum('status', ['tersedia', 'tidak_tersedia'])->default('tersedia');
            $table->boolean('is_best_seller')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index('category_id');
            $table->index('status');
            $table->index('is_best_seller');
        });

        // Tabel promotions
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 150);
            $table->enum('type', ['percentage', 'nominal'])->default('percentage');
            $table->decimal('value', 12, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->timestamps();

            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });

        // Tabel menu_promotions (pivot)
        Schema::create('menu_promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('menu_id')->constrained('menus')->onDelete('cascade');
            $table->foreignUuid('promotion_id')->constrained('promotions')->onDelete('cascade');
            $table->timestamps();

            $table->index('menu_id');
            $table->index('promotion_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_promotions');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('categories');
    }
};
