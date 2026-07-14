<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $openingHours = [
            'monday' => ['open' => '08:00', 'close' => '22:00'],
            'tuesday' => ['open' => '08:00', 'close' => '22:00'],
            'wednesday' => ['open' => '08:00', 'close' => '22:00'],
            'thursday' => ['open' => '08:00', 'close' => '22:00'],
            'friday' => ['open' => '08:00', 'close' => '23:00'],
            'saturday' => ['open' => '08:00', 'close' => '23:00'],
            'sunday' => ['open' => '09:00', 'close' => '22:00'],
        ];

        $branches = [
            ['name' => 'Velvra Central Jakarta', 'code' => 'VLV-JKT-01', 'address' => 'Jl. Sudirman No. 123', 'city' => 'Jakarta Pusat', 'province' => 'DKI Jakarta', 'postal_code' => '10110', 'phone' => '+62 21 1234567', 'email' => 'jakarta@velvra.com', 'latitude' => -6.2088, 'longitude' => 106.8456],
            ['name' => 'Velvra Bandung', 'code' => 'VLV-BDG-01', 'address' => 'Jl. Dago No. 45', 'city' => 'Bandung', 'province' => 'Jawa Barat', 'postal_code' => '40135', 'phone' => '+62 22 7654321', 'email' => 'bandung@velvra.com', 'latitude' => -6.9175, 'longitude' => 107.6191],
        ];

        foreach ($branches as $branch) {
            DB::table('branches')->updateOrInsert(
                ['code' => $branch['code']],
                array_merge($branch, [
                    'timezone' => 'Asia/Jakarta',
                    'currency' => 'IDR',
                    'is_active' => true,
                    'opening_hours' => json_encode($openingHours),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $this->command->info('Branches ready.');
    }
}