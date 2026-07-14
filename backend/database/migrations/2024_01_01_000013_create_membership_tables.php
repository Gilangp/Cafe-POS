<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->bigInteger('minimum_spend_cents')->default(0);
            $table->decimal('points_multiplier', 6, 2)->default(1.00);
            $table->json('benefits_json')->nullable();
            $table->timestamps();
        });

        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('membership_tier_id')->nullable()->constrained()->onDelete('set null');
            $table->string('member_code', 80)->unique();
            $table->string('full_name', 160);
            $table->string('email', 160)->nullable();
            $table->string('phone', 40)->nullable();
            $table->date('birth_date')->nullable();
            $table->integer('points_balance')->default(0);
            $table->bigInteger('lifetime_spend_cents')->default(0);
            $table->string('status', 40)->default('ACTIVE');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type', 40);
            $table->integer('points');
            $table->string('description', 255)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('members');
        Schema::dropIfExists('membership_tiers');
    }
};
