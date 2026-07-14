<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $branchId = DB::table('branches')->where('code', 'HQ')->value('id')
            ?? DB::table('branches')->value('id');

        $users = [
            ['name' => 'Branch Manager', 'email' => 'manager@velvra.test', 'phone' => '+62 813 3456 7890', 'role' => 'branch_manager', 'branch_id' => $branchId],
            ['name' => 'Cashier', 'email' => 'cashier@velvra.test', 'phone' => '+62 814 3456 7890', 'role' => 'cashier', 'branch_id' => $branchId],
            ['name' => 'Kitchen Staff', 'email' => 'kitchen@velvra.test', 'phone' => '+62 815 3456 7890', 'role' => 'kitchen_staff', 'branch_id' => $branchId],
            ['name' => 'Inventory Staff', 'email' => 'inventory@velvra.test', 'phone' => '+62 816 3456 7890', 'role' => 'inventory_staff', 'branch_id' => $branchId],
            ['name' => 'Customer Demo', 'email' => 'customer@velvra.test', 'phone' => '+62 817 3456 7890', 'role' => 'customer', 'branch_id' => null],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                array_merge($user, [
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );

            $userId = DB::table('users')->where('email', $user['email'])->value('id');
            $roleId = DB::table('roles')->where('name', $user['role'])->value('id');
            if ($userId && $roleId) {
                DB::table('role_user')->insertOrIgnore(['user_id' => $userId, 'role_id' => $roleId]);
            }
        }

        $this->command->info('Demo users ready.');
    }
}