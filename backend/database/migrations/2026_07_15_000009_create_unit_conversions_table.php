<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabel: unit_conversions
     * Sesuai dokumentasi Section 26.2 - Unit Conversions
     */
    public function up(): void
    {
        Schema::create('unit_conversions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('from_unit', 50);
            $table->string('to_unit', 50);
            $table->decimal('multiplier', 12, 4)->comment('Multiplier to convert from_unit to to_unit');
            $table->timestamps();

            // Ensure uniqueness of conversion pairs
            $table->unique(['from_unit', 'to_unit']);
            $table->index('from_unit');
            $table->index('to_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_conversions');
    }
};
