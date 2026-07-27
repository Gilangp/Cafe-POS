<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\VariantGroup;
use App\Models\MenuVariantGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FullMenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Data Kategori & Menu
        $menuData = [
            'Coffee' => [
                'Espresso', 'Americano', 'Long Black', 'Cappuccino', 'Cafe Latte', 
                'Flat White', 'Piccolo Latte', 'Mocha Latte', 'Caramel Latte', 
                'Hazelnut Latte', 'Vanilla Latte', 'Brown Sugar Latte', 'Sea Salt Latte', 
                'Coconut Latte', 'Affogato', 'Honey Coffee', 'V60', 'Japanese Iced Coffee'
            ],
            'Non Coffee' => [
                'Matcha Latte', 'Matcha Cream', 'Chocolate Latte', 'Dark Chocolate', 
                'Belgian Chocolate', 'Taro Latte', 'Red Velvet Latte', 'Vanilla Milk', 
                'Strawberry Milk', 'Cookies & Cream', 'Caramel Milk', 'Banana Milk', 
                'Brown Sugar Milk', 'Honey Milk', 'Avocado Milk'
            ],
            'Tea' => [
                'Lemon Tea', 'Lychee Tea', 'Peach Tea', 'Earl Grey Tea', 'Chamomile Tea', 
                'Jasmine Tea', 'Green Tea', 'Thai Tea', 'Milk Tea', 'Black Tea'
            ],
            'Refreshment' => [
                'Blue Ocean', 'Summer Breeze', 'Passion Spark', 'Tropical Sunrise', 
                'Lemon Mojito', 'Strawberry Mojito', 'Mango Soda', 'Kiwi Sparkling', 
                'Berry Splash', 'Orange Fizz', 'Apple Cooler', 'Lime Soda'
            ],
            'Snack' => [
                'French Fries', 'Truffle Fries', 'Chicken Wings', 'Onion Rings', 
                'Chicken Popcorn', 'Chicken Karaage', 'Sosis Bakar', 'Tahu Crispy', 
                'Singkong Goreng', 'Pisang Goreng', 'Cireng', 'Mix Platter', 'Nachos', 
                'Kentang Goreng Keju', 'Mozzarella Stick'
            ],
            'Main Course' => [
                'Chicken Katsu Rice', 'Chicken Teriyaki Rice', 'Chicken Salted Egg Rice', 
                'Beef Black Pepper Rice', 'Beef Teriyaki Rice', 'Nasi Goreng Kampung', 
                'Nasi Goreng Seafood', 'Spaghetti Bolognese', 'Spaghetti Carbonara', 
                'Aglio Olio', 'Chicken Steak', 'Beef Steak', 'Chicken Sambal Matah', 
                'Dori Sambal Matah', 'Chicken Curry Rice', 'Creamy Chicken Pasta', 
                'Fried Rice Special', 'Grilled Chicken Rice'
            ],
            'Breakfast' => [
                'American Breakfast', 'Toast & Egg', 'Butter Toast', 'Kaya Toast', 
                'Scrambled Egg Toast', 'Pancake', 'French Toast', 'Granola Bowl'
            ],
            'Seasonal Menu' => [
                'Mango Matcha', 'Strawberry Matcha', 'Sakura Latte', 'Pumpkin Latte', 
                'Christmas Chocolate', 'Summer Berry Soda', 'Winter Chocolate', 
                'Tropical Coconut', 'Melon Breeze', 'Peach Blossom'
            ]
        ];

        // 2. Pricing Logic (Base Prices by Category)
        $prices = [
            'Coffee' => 25000,
            'Non Coffee' => 28000,
            'Tea' => 22000,
            'Refreshment' => 28000,
            'Snack' => 25000,
            'Main Course' => 45000,
            'Breakfast' => 35000,
            'Seasonal Menu' => 38000,
        ];

        // 3. Clear Existing Menus and Categories to avoid duplication (removed)

        // Ambil Variant Groups yang sudah dibuat di DatabaseSeeder
        $vgSuhu = VariantGroup::where('name', 'Temperature')->first();
        $vgGula = VariantGroup::where('name', 'Level Gula')->first();
        $vgEs = VariantGroup::where('name', 'Level Es')->first();
        $vgAddon = VariantGroup::where('name', 'Tambahan (Add-ons)')->first();

        // Ambil Inventory untuk HPP
        $invKopiArabica = \App\Models\Inventory::where('name', 'Biji Kopi Arabica Gayo (Roast)')->first();
        $invKopiRobusta = \App\Models\Inventory::where('name', 'Biji Kopi Robusta Temanggung')->first();
        $invSusuUHT = \App\Models\Inventory::where('name', 'Susu Cair UHT Full Cream')->first();
        $invGulaAren = \App\Models\Inventory::where('name', 'Sirup Gula Aren Asli')->first();
        $invTehMelati = \App\Models\Inventory::where('name', 'Teh Daun Melati')->first();
        $invBeras = \App\Models\Inventory::where('name', 'Beras Putih Premium')->first();
        $invTelur = \App\Models\Inventory::where('name', 'Telur Ayam Horn')->first();
        $invAyam = \App\Models\Inventory::where('name', 'Daging Ayam Potong')->first();
        $invCupEs = \App\Models\Inventory::where('name', 'Gelas Plastik Es 16oz')->first();
        $invKardusMakan = \App\Models\Inventory::where('name', 'Kotak Makan Kertas Kraft')->first();

        $displayOrder = 1;

        foreach ($menuData as $categoryName => $menus) {
            // Create Category
            $category = Category::create([
                'name' => $categoryName,
                'display_order' => $displayOrder++
            ]);

            // Create Menus for this Category
            foreach ($menus as $menuName) {
                // Generate a realistic base price with slight randomness (+/- 5000)
                $basePrice = $prices[$categoryName];
                $randomOffset = (rand(0, 4) * 1000) - 2000; // -2000 to +2000
                if (in_array($categoryName, ['Snack', 'Main Course', 'Breakfast'])) {
                    $randomOffset = (rand(0, 10) * 1000) - 5000;
                }
                $finalPrice = max(15000, $basePrice + $randomOffset);

                $menu = Menu::create([
                    'category_id' => $category->id,
                    'name' => $menuName,
                    'slug' => Str::slug($menuName) . '-' . strtolower(Str::random(4)),
                    'description' => 'Menu premium dari NEMU Space: ' . $menuName,
                    'price' => $finalPrice,
                    'image' => '/images/menu/kopi-aren.jpg', // Menggunakan dummy image
                    'status' => 'tersedia',
                    'is_best_seller' => rand(1, 10) > 8, // 20% chance to be best seller
                ]);

                // 4. Attach Variants ONLY to Drink categories
                $drinkCategories = ['Coffee', 'Non Coffee', 'Tea', 'Refreshment', 'Seasonal Menu'];
                if (in_array($categoryName, $drinkCategories) && $vgSuhu && $vgGula && $vgEs && $vgAddon) {
                    MenuVariantGroup::create(['menu_id' => $menu->id, 'variant_group_id' => $vgSuhu->id, 'is_required' => true]);
                    MenuVariantGroup::create(['menu_id' => $menu->id, 'variant_group_id' => $vgGula->id, 'is_required' => true]);
                    MenuVariantGroup::create(['menu_id' => $menu->id, 'variant_group_id' => $vgEs->id, 'is_required' => true]);
                    MenuVariantGroup::create(['menu_id' => $menu->id, 'variant_group_id' => $vgAddon->id, 'is_required' => false]);
                }

                // 5. Attach HPP / BOM (Ingredients)
                $ingredients = [];
                $nameLower = strtolower($menuName);
                
                if (in_array($categoryName, ['Coffee'])) {
                    if ($invKopiArabica) $ingredients[$invKopiArabica->id] = ['quantity_used' => 18];
                    if (str_contains($nameLower, 'latte') || str_contains($nameLower, 'cappuccino') || str_contains($nameLower, 'white')) {
                        if ($invSusuUHT) $ingredients[$invSusuUHT->id] = ['quantity_used' => 150];
                    }
                    if (str_contains($nameLower, 'sugar') || str_contains($nameLower, 'caramel') || str_contains($nameLower, 'honey')) {
                        if ($invGulaAren) $ingredients[$invGulaAren->id] = ['quantity_used' => 20];
                    }
                    if ($invCupEs) $ingredients[$invCupEs->id] = ['quantity_used' => 1];
                } 
                elseif (in_array($categoryName, ['Non Coffee'])) {
                    if ($invSusuUHT) $ingredients[$invSusuUHT->id] = ['quantity_used' => 200];
                    if (str_contains($nameLower, 'sugar') || str_contains($nameLower, 'caramel') || str_contains($nameLower, 'honey')) {
                        if ($invGulaAren) $ingredients[$invGulaAren->id] = ['quantity_used' => 30];
                    }
                    if ($invCupEs) $ingredients[$invCupEs->id] = ['quantity_used' => 1];
                }
                elseif (in_array($categoryName, ['Tea'])) {
                    if ($invTehMelati) $ingredients[$invTehMelati->id] = ['quantity_used' => 15];
                    if (str_contains($nameLower, 'milk')) {
                        if ($invSusuUHT) $ingredients[$invSusuUHT->id] = ['quantity_used' => 100];
                    }
                    if ($invCupEs) $ingredients[$invCupEs->id] = ['quantity_used' => 1];
                }
                elseif (in_array($categoryName, ['Refreshment', 'Seasonal Menu'])) {
                    if ($invCupEs) $ingredients[$invCupEs->id] = ['quantity_used' => 1];
                    if (str_contains($nameLower, 'latte') || str_contains($nameLower, 'chocolate')) {
                        if ($invSusuUHT) $ingredients[$invSusuUHT->id] = ['quantity_used' => 150];
                    }
                }
                elseif (in_array($categoryName, ['Main Course', 'Breakfast'])) {
                    if (str_contains($nameLower, 'rice') || str_contains($nameLower, 'nasi')) {
                        if ($invBeras) $ingredients[$invBeras->id] = ['quantity_used' => 200];
                    }
                    if (str_contains($nameLower, 'chicken') || str_contains($nameLower, 'ayam') || str_contains($nameLower, 'katsu')) {
                        if ($invAyam) $ingredients[$invAyam->id] = ['quantity_used' => 150];
                    }
                    if (str_contains($nameLower, 'egg') || str_contains($nameLower, 'goreng')) {
                        if ($invTelur) $ingredients[$invTelur->id] = ['quantity_used' => 1];
                    }
                    if ($invKardusMakan) $ingredients[$invKardusMakan->id] = ['quantity_used' => 1];
                }
                elseif (in_array($categoryName, ['Snack'])) {
                    if (str_contains($nameLower, 'chicken') || str_contains($nameLower, 'wings') || str_contains($nameLower, 'karaage')) {
                        if ($invAyam) $ingredients[$invAyam->id] = ['quantity_used' => 150];
                    }
                    if ($invKardusMakan) $ingredients[$invKardusMakan->id] = ['quantity_used' => 1];
                }

                if (!empty($ingredients)) {
                    $menu->ingredients()->sync($ingredients);
                }
            }
        }
    }
}
