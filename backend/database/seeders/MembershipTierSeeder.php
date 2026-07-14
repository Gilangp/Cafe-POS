<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Bronze',
                'minimum_spend_cents' => 0,
                'points_multiplier' => 1.00,
                'benefits_json' => json_encode(['discount' => '0%', 'birthday_bonus' => '500 points']),
            ],
            [
                'name' => 'Silver',
                'minimum_spend_cents' => 100000000, // 1 juta IDR
                'points_multiplier' => 1.25,
                'benefits_json' => json_encode(['discount' => '5%', 'birthday_bonus' => '1000 points', 'free_drink' => 'monthly']),
            ],
            [
                'name' => 'Gold',
                'minimum_spend_cents' => 500000000, // 5 juta IDR
                'points_multiplier' => 1.50,
                'benefits_json' => json_encode(['discount' => '10%', 'birthday_bonus' => '2000 points', 'free_drink' => 'weekly', 'priority_support' => true]),
            ],
        ];

        foreach ($tiers as $tier) {
            DB::table('membership_tiers')->insertOrIgnore($tier);
        }

        $this->command->info('âœ… Membership tiers seeded');
    }
}