<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Seed Roles: Owner, Admin, Kasir, Dapur/Barista
     * Sesuai dokumentasi Section 26.3 Point 1
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Owner'],
            ['name' => 'Admin'],
            ['name' => 'Kasir'],
            ['name' => 'Dapur_Barista'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        $this->command->info('✓ 4 Roles created: Owner, Admin, Kasir, Dapur_Barista');
    }
}
