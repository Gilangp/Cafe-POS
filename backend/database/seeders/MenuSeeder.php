<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use App\Models\VariantGroup;
use App\Models\VariantOption;
use App\Models\MenuVariantGroup;
use App\Models\Inventory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    /**
     * Seed Menu untuk testing: 10-15 menu dengan berbagai tipe
     * Sesuai dokumentasi Section 26.3 Point 5
     * 
     * Data Kompleks:
     * - Menu Sederhana: 'Espresso' (hanya resep biji kopi)
     * - Menu dengan Resep: 'Kopi Susu Gula Aren' (resep: biji kopi, susu, gula aren)
     * - Menu dengan Varian: 'Manual Brew' dengan grup varian "Pilih Biji Kopi" (opsi: Gayo, Kintamani, Toraja) dengan inventory_action = swap
     * - Menu dengan Varian Harga: 'Latte' dengan grup varian "Ukuran" (opsi: Regular, Large additional_price 3000)
     */
    public function run(): void
    {
        // 1. Get Inventories
        $invKopiGayo = Inventory::where('name', 'Biji Kopi Gayo')->first();
        $invSusu = Inventory::where('name', 'Susu Sapi')->first();
        $invGulaAren = Inventory::where('name', 'Sirup Gula Aren')->first();
        $invPaperCup = Inventory::where('name', 'Paper Cup')->first();
        $invKopiRobusta = Inventory::where('name', 'Biji Kopi Robusta Temanggung')->first();

        if (!$invKopiGayo || !$invSusu || !$invGulaAren || !$invPaperCup) {
            $this->command->error('Required inventories not found. Please run InventorySeeder first.');
            return;
        }

        // 2. Create Categories
        $catCoffee = Category::firstOrCreate(
            ['name' => 'Coffee'],
            ['display_order' => 1]
        );
        $catNonCoffee = Category::firstOrCreate(
            ['name' => 'Non Coffee'],
            ['display_order' => 2]
        );
        $catFood = Category::firstOrCreate(
            ['name' => 'Food'],
            ['display_order' => 3]
        );

        // 3. Create Variant Groups untuk testing

        // a) Grup Varian "Pilih Biji Kopi" dengan swap inventory
        $vgBijiKopi = VariantGroup::firstOrCreate(
            ['name' => 'Pilih Biji Kopi'],
            ['type' => 'single']
        );

        // Create dummy inventories untuk Kintamani & Toraja jika belum ada
        $invKintamani = Inventory::firstOrCreate(
            ['name' => 'Biji Kopi Kintamani'],
            [
                'category_id' => $invKopiGayo->category_id,
                'supplier_id' => $invKopiGayo->supplier_id,
                'stock_quantity' => 30000,
                'unit' => 'gram',
                'unit_price' => 220,
                'minimum_stock' => 5000,
            ]
        );
        $invToraja = Inventory::firstOrCreate(
            ['name' => 'Biji Kopi Toraja'],
            [
                'category_id' => $invKopiGayo->category_id,
                'supplier_id' => $invKopiGayo->supplier_id,
                'stock_quantity' => 25000,
                'unit' => 'gram',
                'unit_price' => 250,
                'minimum_stock' => 5000,
            ]
        );

        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgBijiKopi->id, 'name' => 'Gayo'],
            [
                'additional_price' => 0,
                'inventory_item_id' => $invKopiGayo->id,
                'inventory_action' => 'swap',
                'inventory_action_value' => 18,
            ]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgBijiKopi->id, 'name' => 'Kintamani'],
            [
                'additional_price' => 2000,
                'inventory_item_id' => $invKintamani->id,
                'inventory_action' => 'swap',
                'inventory_action_value' => 18,
            ]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgBijiKopi->id, 'name' => 'Toraja'],
            [
                'additional_price' => 3000,
                'inventory_item_id' => $invToraja->id,
                'inventory_action' => 'swap',
                'inventory_action_value' => 18,
            ]
        );

        // b) Grup Varian "Ukuran" dengan additional price
        $vgUkuran = VariantGroup::firstOrCreate(
            ['name' => 'Ukuran'],
            ['type' => 'single']
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgUkuran->id, 'name' => 'Regular'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgUkuran->id, 'name' => 'Large'],
            [
                'additional_price' => 3000,
                'inventory_action' => 'multiply',
                'inventory_action_value' => 1.5, // 1.5x resep
            ]
        );

        // 4. Create Menus

        // Menu 1: Espresso (Menu Sederhana - hanya resep biji kopi)
        $menuEspresso = Menu::firstOrCreate(
            ['slug' => 'espresso'],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Espresso',
                'description' => 'Pure espresso shot dari biji kopi Gayo pilihan',
                'price' => 18000,
                'image' => '/images/menu/espresso.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ]
        );
        // Attach ingredients (resep sederhana)
        $menuEspresso->ingredients()->syncWithoutDetaching([
            $invKopiGayo->id => ['quantity_used' => 18], // 18 gram
            $invPaperCup->id => ['quantity_used' => 1],
        ]);

        // Menu 2: Kopi Susu Gula Aren (Menu dengan Resep lengkap)
        $menuKopiSusu = Menu::firstOrCreate(
            ['slug' => 'kopi-susu-gula-aren'],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Kopi Susu Gula Aren',
                'description' => 'Perpaduan sempurna kopi, susu, dan gula aren',
                'price' => 28000,
                'image' => '/images/menu/kopi-susu-gula-aren.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ]
        );
        // Attach ingredients (resep kompleks: kopi + susu + gula aren)
        $menuKopiSusu->ingredients()->syncWithoutDetaching([
            $invKopiGayo->id => ['quantity_used' => 18],
            $invSusu->id => ['quantity_used' => 150], // 150ml
            $invGulaAren->id => ['quantity_used' => 20], // 20ml
            $invPaperCup->id => ['quantity_used' => 1],
        ]);

        // Menu 3: Manual Brew (Menu dengan Varian Swap Inventory)
        $menuManualBrew = Menu::firstOrCreate(
            ['slug' => 'manual-brew'],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Manual Brew',
                'description' => 'Metode manual brewing dengan pilihan biji kopi Nusantara',
                'price' => 25000,
                'image' => '/images/menu/manual-brew.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ]
        );
        // Attach variant group "Pilih Biji Kopi"
        MenuVariantGroup::firstOrCreate([
            'menu_id' => $menuManualBrew->id,
            'variant_group_id' => $vgBijiKopi->id,
        ], [
            'is_required' => true,
        ]);
        // Base recipe (akan di-swap berdasarkan pilihan varian)
        $menuManualBrew->ingredients()->syncWithoutDetaching([
            $invKopiGayo->id => ['quantity_used' => 20], // base recipe
            $invPaperCup->id => ['quantity_used' => 1],
        ]);

        // Menu 4: Latte (Menu dengan Varian Harga)
        $menuLatte = Menu::firstOrCreate(
            ['slug' => 'latte'],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Latte',
                'description' => 'Espresso dengan steamed milk yang creamy',
                'price' => 26000,
                'image' => '/images/menu/latte.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ]
        );
        // Attach variant group "Ukuran"
        MenuVariantGroup::firstOrCreate([
            'menu_id' => $menuLatte->id,
            'variant_group_id' => $vgUkuran->id,
        ], [
            'is_required' => true,
        ]);
        // Base recipe
        $menuLatte->ingredients()->syncWithoutDetaching([
            $invKopiGayo->id => ['quantity_used' => 18],
            $invSusu->id => ['quantity_used' => 200],
            $invPaperCup->id => ['quantity_used' => 1],
        ]);

        // Menu 5-10: Additional simple menus
        $additionalMenus = [
            [
                'name' => 'Americano',
                'slug' => 'americano',
                'category_id' => $catCoffee->id,
                'price' => 20000,
                'description' => 'Espresso dengan air panas',
                'ingredients' => [
                    $invKopiGayo->id => 18,
                    $invPaperCup->id => 1,
                ]
            ],
            [
                'name' => 'Cappuccino',
                'slug' => 'cappuccino',
                'category_id' => $catCoffee->id,
                'price' => 27000,
                'description' => 'Espresso dengan steamed milk dan foam',
                'ingredients' => [
                    $invKopiGayo->id => 18,
                    $invSusu->id => 150,
                    $invPaperCup->id => 1,
                ]
            ],
            [
                'name' => 'Mocha',
                'slug' => 'mocha',
                'category_id' => $catCoffee->id,
                'price' => 29000,
                'description' => 'Kombinasi espresso dengan cokelat',
                'ingredients' => [
                    $invKopiGayo->id => 18,
                    $invSusu->id => 180,
                    $invPaperCup->id => 1,
                ]
            ],
            [
                'name' => 'Matcha Latte',
                'slug' => 'matcha-latte',
                'category_id' => $catNonCoffee->id,
                'price' => 28000,
                'description' => 'Green tea Jepang dengan susu',
                'ingredients' => [
                    $invSusu->id => 200,
                    $invPaperCup->id => 1,
                ]
            ],
            [
                'name' => 'Chocolate Latte',
                'slug' => 'chocolate-latte',
                'category_id' => $catNonCoffee->id,
                'price' => 27000,
                'description' => 'Cokelat premium dengan susu',
                'ingredients' => [
                    $invSusu->id => 200,
                    $invPaperCup->id => 1,
                ]
            ],
            [
                'name' => 'French Fries',
                'slug' => 'french-fries',
                'category_id' => $catFood->id,
                'price' => 22000,
                'description' => 'Kentang goreng renyah dengan saus',
                'ingredients' => []
            ],
        ];

        foreach ($additionalMenus as $menuData) {
            $ingredients = $menuData['ingredients'];
            unset($menuData['ingredients']);

            $menu = Menu::firstOrCreate(
                ['slug' => $menuData['slug']],
                array_merge($menuData, [
                    'image' => '/images/menu/' . $menuData['slug'] . '.jpg',
                    'status' => 'tersedia',
                    'is_best_seller' => false,
                ])
            );

            if (!empty($ingredients)) {
                $sync = [];
                foreach ($ingredients as $invId => $qty) {
                    $sync[$invId] = ['quantity_used' => $qty];
                }
                $menu->ingredients()->syncWithoutDetaching($sync);
            }
        }

        $this->command->info('✓ 10 Test Menus created with variants and recipes');
    }
}
