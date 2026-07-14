<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name', 160);
            $table->decimal('yield_quantity', 12, 3)->default(1);
            $table->string('yield_unit', 40)->default('portion');
            $table->text('instructions')->nullable();
            $table->string('status', 40)->default('ACTIVE');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 12, 3);
            $table->string('unit', 40);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredients');
        Schema::dropIfExists('recipes');
    }
};
