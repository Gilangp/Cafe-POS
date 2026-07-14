<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->after('user_id')->constrained('members')->nullOnDelete();
            $table->integer('points_earned')->default(0)->after('total');
            $table->integer('points_redeemed')->default(0)->after('points_earned');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['member_id']);
            $table->dropColumn(['member_id', 'points_earned', 'points_redeemed']);
        });
    }
};
