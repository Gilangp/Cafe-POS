<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabel: users, roles, user_roles
     * Sesuai dokumentasi Section 26.2 - Users & Roles
     */
    public function up(): void
    {
        // Tabel users
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->string('phone', 20)->nullable();
            $table->string('avatar', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('email');
            $table->index('is_active');
        });

        // Tabel roles
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50)->unique(); // Owner, Admin, Kasir, Dapur_Barista
            $table->timestamps();
        });

        // Tabel user_roles (pivot many-to-many)
        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('role_id')->constrained('roles')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
            $table->index('user_id');
            $table->index('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
    }
};
