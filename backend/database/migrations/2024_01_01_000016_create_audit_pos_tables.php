<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('auditable_type', 160);
            $table->bigInteger('auditable_id');
            $table->string('action', 40);
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('method', 10);
            $table->text('path');
            $table->integer('status_code');
            $table->integer('duration_ms');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('created_at');
        });

        Schema::create('pos_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_number', 80)->unique();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->bigInteger('opening_cash_cents')->default(0);
            $table->bigInteger('closing_cash_cents')->nullable();
            $table->bigInteger('expected_cash_cents')->nullable();
            $table->bigInteger('total_sales_cents')->default(0);
            $table->integer('total_transactions')->default(0);
            $table->string('status', 40)->default('OPEN');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_sessions');
        Schema::dropIfExists('access_logs');
        Schema::dropIfExists('audit_logs');
    }
};
