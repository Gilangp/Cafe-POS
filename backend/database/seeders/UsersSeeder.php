<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    /**
     * Seed Users: 1 user per role dengan email @nemuspace.test
     * Password default: 'password'
     * Sesuai dokumentasi Section 26.3 Point 2
     */
    public function run(): void
    {
        $ownerRole = Role::where('name', 'Owner')->first();
        $adminRole = Role::where('name', 'Admin')->first();
        $kasirRole = Role::where('name', 'Kasir')->first();
        $dapurRole = Role::where('name', 'Dapur_Barista')->first();

        if (! $ownerRole || ! $adminRole || ! $kasirRole || ! $dapurRole) {
            $this->command->error('Roles not found. Please run RolesSeeder first.');

            return;
        }

        // 1. Owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@nemuspace.test'],
            [
                'name' => 'Owner NEMU Space',
                'password' => 'password', // Mutator akan hash otomatis
                'phone' => '081111111111',
                'is_active' => true,
            ]
        );
        if (! $owner->roles->contains($ownerRole->id)) {
            $owner->roles()->attach($ownerRole->id);
        }

        // 2. Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@nemuspace.test'],
            [
                'name' => 'Admin NEMU Space',
                'password' => 'password',
                'phone' => '081111111112',
                'is_active' => true,
            ]
        );
        if (! $admin->roles->contains($adminRole->id)) {
            $admin->roles()->attach($adminRole->id);
        }

        // 3. Kasir
        $kasir = User::firstOrCreate(
            ['email' => 'kasir@nemuspace.test'],
            [
                'name' => 'Kasir Shift 1',
                'password' => 'password',
                'phone' => '081111111113',
                'is_active' => true,
            ]
        );
        if (! $kasir->roles->contains($kasirRole->id)) {
            $kasir->roles()->attach($kasirRole->id);
        }

        // 4. Dapur/Barista
        $dapur = User::firstOrCreate(
            ['email' => 'dapur@nemuspace.test'],
            [
                'name' => 'Barista / Dapur Utama',
                'password' => 'password',
                'phone' => '081111111114',
                'is_active' => true,
            ]
        );
        if (! $dapur->roles->contains($dapurRole->id)) {
            $dapur->roles()->attach($dapurRole->id);
        }

        $this->command->info('✓ 4 Users created with default password: password');
    }
}
