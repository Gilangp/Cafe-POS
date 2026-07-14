<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 160);
            $table->string('code', 80)->unique();
            $table->string('type', 40); // percent, nominal, bogo, bundle
            $table->decimal('value', 14, 2)->default(0); // percentage amount or discount amount cents
            $table->bigInteger('min_order_cents')->default(0);
            $table->bigInteger('max_discount_cents')->nullable();
            $table->string('channel', 40)->default('All'); // POS, Online, All
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('usage_count')->default(0);
            $table->integer('max_usage')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
