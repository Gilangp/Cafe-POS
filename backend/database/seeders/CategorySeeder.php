<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Coffee', 'slug' => 'coffee', 'description' => 'Premium coffee beverages', 'sort_order' => 1],
            ['name' => 'Non-Coffee', 'slug' => 'non-coffee', 'description' => 'Non-coffee beverages', 'sort_order' => 2],
            ['name' => 'Food', 'slug' => 'food', 'description' => 'Food items and snacks', 'sort_order' => 3],
            ['name' => 'Pastries', 'slug' => 'pastries', 'description' => 'Fresh pastries and baked goods', 'sort_order' => 4],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $this->command->info('Categories ready.');
    }
}