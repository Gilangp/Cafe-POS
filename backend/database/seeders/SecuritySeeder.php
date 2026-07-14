<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SecuritySeeder extends Seeder
{
    public function run(): void
    {
        $adminId = DB::table('users')->where('email', 'admin@velvra.test')->value('id');

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => 'admin@velvra.test'],
            ['token' => Hash::make(Str::random(40)), 'created_at' => now()]
        );

        DB::table('sessions')->updateOrInsert(
            ['id' => 'seeded-admin-session'],
            [
                'user_id' => $adminId,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Seeder',
                'payload' => base64_encode(serialize(['seeded' => true])),
                'last_activity' => time(),
            ]
        );

        $this->command->info('Security utility seed data ready.');
    }
}