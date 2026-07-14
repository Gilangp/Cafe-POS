<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $branchId = DB::table('branches')->where('code', 'HQ')->value('id');

        if (!$branchId) {
            $branchId = DB::table('branches')->insertGetId([
                'code' => 'HQ',
                'name' => 'Velvra HQ',
                'address' => 'Jl. Kopi No. 1',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '10110',
                'phone' => '021-12345678',
                'email' => 'hq@velvra.test',
                'timezone' => 'Asia/Jakarta',
                'currency' => 'IDR',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $userId = DB::table('users')->where('email', 'admin@velvra.test')->value('id');

        if (!$userId) {
            $userId = DB::table('users')->insertGetId([
                'branch_id' => $branchId,
                'name' => 'Super Admin',
                'email' => 'admin@velvra.test',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $roleId = DB::table('roles')->where('name', 'super_admin')->value('id');
        if ($roleId && $userId) {
            DB::table('role_user')->insertOrIgnore([
                'role_id' => $roleId,
                'user_id' => $userId,
            ]);
        }

        $this->command->info('Admin user ready: admin@velvra.test / password');
    }
}