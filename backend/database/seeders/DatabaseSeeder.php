<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            MembershipTierSeeder::class,
            AdminUserSeeder::class,
            UserSeeder::class,
            BranchSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            OperationalSeeder::class,
            CmsSeeder::class,
            SecuritySeeder::class,
        ]);
    }
}