<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = DB::table('categories')->pluck('id', 'slug');

        $products = [
            ['category' => 'coffee', 'name' => 'Espresso', 'slug' => 'espresso', 'description' => 'Single shot of pure espresso', 'base_price' => 25000, 'sku' => 'VLV-COFFEE-001', 'is_featured' => true, 'preparation_time' => 3, 'tags' => ['coffee', 'hot']],
            ['category' => 'coffee', 'name' => 'Americano', 'slug' => 'americano', 'description' => 'Espresso with hot water', 'base_price' => 30000, 'sku' => 'VLV-COFFEE-002', 'is_featured' => false, 'preparation_time' => 4, 'tags' => ['coffee', 'hot']],
            ['category' => 'coffee', 'name' => 'Cappuccino', 'slug' => 'cappuccino', 'description' => 'Espresso with steamed milk and foam', 'base_price' => 35000, 'sku' => 'VLV-COFFEE-003', 'is_featured' => true, 'preparation_time' => 5, 'tags' => ['coffee', 'milk']],
            ['category' => 'coffee', 'name' => 'Latte', 'slug' => 'latte', 'description' => 'Espresso with steamed milk', 'base_price' => 38000, 'sku' => 'VLV-COFFEE-004', 'is_featured' => true, 'preparation_time' => 5, 'tags' => ['coffee', 'milk']],
            ['category' => 'non-coffee', 'name' => 'Green Tea Latte', 'slug' => 'green-tea-latte', 'description' => 'Premium matcha with steamed milk', 'base_price' => 35000, 'sku' => 'VLV-NONCOF-001', 'is_featured' => false, 'preparation_time' => 5, 'tags' => ['matcha', 'milk']],
            ['category' => 'non-coffee', 'name' => 'Chocolate', 'slug' => 'chocolate', 'description' => 'Rich hot chocolate', 'base_price' => 32000, 'sku' => 'VLV-NONCOF-002', 'is_featured' => false, 'preparation_time' => 4, 'tags' => ['chocolate', 'milk']],
            ['category' => 'food', 'name' => 'Sandwich', 'slug' => 'sandwich', 'description' => 'Fresh sandwich with premium ingredients', 'base_price' => 45000, 'sku' => 'VLV-FOOD-001', 'is_featured' => false, 'preparation_time' => 10, 'tags' => ['food']],
            ['category' => 'pastries', 'name' => 'Croissant', 'slug' => 'croissant', 'description' => 'Freshly baked butter croissant', 'base_price' => 28000, 'sku' => 'VLV-PASTRY-001', 'is_featured' => false, 'preparation_time' => 2, 'tags' => ['pastry']],
        ];

        foreach ($products as $product) {
            if (!isset($categoryIds[$product['category']])) {
                continue;
            }

            DB::table('products')->updateOrInsert(
                ['sku' => $product['sku']],
                [
                    'category_id' => $categoryIds[$product['category']],
                    'name' => $product['name'],
                    'slug' => $product['slug'],
                    'description' => $product['description'],
                    'base_price' => $product['base_price'],
                    'image' => null,
                    'is_active' => true,
                    'is_featured' => $product['is_featured'],
                    'preparation_time' => $product['preparation_time'],
                    'tags' => json_encode($product['tags']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info('Products ready.');
    }
}