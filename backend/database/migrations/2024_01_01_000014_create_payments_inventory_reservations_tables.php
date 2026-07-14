<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('method', 40);
            $table->string('provider', 80)->nullable();
            $table->string('provider_transaction_id', 160)->nullable();
            $table->string('status', 40)->default('PENDING');
            $table->bigInteger('amount_cents');
            $table->timestamp('paid_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->string('type', 40);
            $table->decimal('quantity', 14, 3);
            $table->string('unit', 40);
            $table->bigInteger('unit_cost_cents')->default(0);
            $table->string('reference_type', 80)->nullable();
            $table->bigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['inventory_item_id', 'created_at']);
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reservation_code', 80)->unique();
            $table->string('customer_name', 160);
            $table->string('customer_phone', 40);
            $table->string('customer_email', 160)->nullable();
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->integer('party_size');
            $table->string('table_number', 40)->nullable();
            $table->text('special_requests')->nullable();
            $table->string('status', 40)->default('PENDING');
            $table->bigInteger('deposit_cents')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['branch_id', 'reservation_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('payments');
    }
};
