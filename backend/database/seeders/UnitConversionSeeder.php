<?php

namespace Database\Seeders;

use App\Models\UnitConversion;
use Illuminate\Database\Seeder;

class UnitConversionSeeder extends Seeder
{
    public function run(): void
    {
        $conversions = [
            ['from_unit' => 'kg', 'to_unit' => 'gram', 'multiplier' => 1000],
            ['from_unit' => 'liter', 'to_unit' => 'ml', 'multiplier' => 1000],
            ['from_unit' => 'lusin', 'to_unit' => 'pcs', 'multiplier' => 12],
            ['from_unit' => 'box', 'to_unit' => 'pcs', 'multiplier' => 24],
        ];

        foreach ($conversions as $conv) {
            UnitConversion::firstOrCreate([
                'from_unit' => $conv['from_unit'],
                'to_unit' => $conv['to_unit'],
            ], [
                'multiplier' => $conv['multiplier'],
            ]);
        }
    }
}
