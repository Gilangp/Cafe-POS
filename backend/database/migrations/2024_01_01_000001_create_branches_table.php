<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->string('phone');
            $table->string('email');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('currency', 3)->default('IDR');
            $table->boolean('is_active')->default(true);
            $table->json('opening_hours')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
