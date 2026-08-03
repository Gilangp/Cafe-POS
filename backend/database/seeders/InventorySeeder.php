<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed Inventory Categories, Suppliers, dan 5-10 bahan baku dasar
     * Sesuai dokumentasi Section 26.3 Point 4
     */
    public function run(): void
    {
        // 1. Inventory Categories
        $invCatKopi = InventoryCategory::firstOrCreate(['name' => 'Biji Kopi']);
        $invCatSusu = InventoryCategory::firstOrCreate(['name' => 'Susu & Kreamer']);
        $invCatSirup = InventoryCategory::firstOrCreate(['name' => 'Sirup & Gula']);
        $invCatTeh = InventoryCategory::firstOrCreate(['name' => 'Teh & Bubuk']);
        $invCatBahanMakanan = InventoryCategory::firstOrCreate(['name' => 'Bahan Makanan']);
        $invCatPackaging = InventoryCategory::firstOrCreate(['name' => 'Packaging']);

        // 2. Suppliers
        $supplierLokal = Supplier::firstOrCreate(
            ['name' => 'PT Kopi Nusantara Raya'],
            [
                'phone' => '081234567890',
                'address' => 'Gudang Kopi Jakarta'
            ]
        );
        $supplierSusu = Supplier::firstOrCreate(
            ['name' => 'CV Susu Segar Indonesia'],
            [
                'phone' => '081234567891',
                'address' => 'Pabrik Susu Bandung'
            ]
        );
        $supplierPackaging = Supplier::firstOrCreate(
            ['name' => 'Bintang Packaging'],
            [
                'phone' => '081234567892',
                'address' => 'Jakarta Barat'
            ]
        );

        // 3. Inventories (Bahan Baku Dasar)
        $inventories = [
            [
                'category_id' => $invCatKopi->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Biji Kopi Gayo',
                'stock_quantity' => 50000,
                'unit' => 'gram',
                'unit_price' => 200,
                'minimum_stock' => 5000,
            ],
            [
                'category_id' => $invCatSusu->id,
                'supplier_id' => $supplierSusu->id,
                'name' => 'Susu Sapi',
                'stock_quantity' => 50000,
                'unit' => 'ml',
                'unit_price' => 20,
                'minimum_stock' => 5000,
            ],
            [
                'category_id' => $invCatSirup->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Sirup Gula Aren',
                'stock_quantity' => 10000,
                'unit' => 'ml',
                'unit_price' => 50,
                'minimum_stock' => 2000,
            ],
            [
                'category_id' => $invCatPackaging->id,
                'supplier_id' => $supplierPackaging->id,
                'name' => 'Paper Cup',
                'stock_quantity' => 1000,
                'unit' => 'pcs',
                'unit_price' => 1200,
                'minimum_stock' => 200,
            ],
            [
                'category_id' => $invCatKopi->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Biji Kopi Robusta Temanggung',
                'stock_quantity' => 20000,
                'unit' => 'gram',
                'unit_price' => 120,
                'minimum_stock' => 3000,
            ],
            [
                'category_id' => $invCatTeh->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Teh Daun Melati',
                'stock_quantity' => 5000,
                'unit' => 'gram',
                'unit_price' => 150,
                'minimum_stock' => 1000,
            ],
            [
                'category_id' => $invCatBahanMakanan->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Beras Putih Premium',
                'stock_quantity' => 50000,
                'unit' => 'gram',
                'unit_price' => 16,
                'minimum_stock' => 10000,
            ],
            [
                'category_id' => $invCatBahanMakanan->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Telur Ayam Horn',
                'stock_quantity' => 500,
                'unit' => 'pcs',
                'unit_price' => 2500,
                'minimum_stock' => 50,
            ],
            [
                'category_id' => $invCatBahanMakanan->id,
                'supplier_id' => $supplierLokal->id,
                'name' => 'Daging Ayam Potong',
                'stock_quantity' => 20000,
                'unit' => 'gram',
                'unit_price' => 45,
                'minimum_stock' => 5000,
            ],
            [
                'category_id' => $invCatPackaging->id,
                'supplier_id' => $supplierPackaging->id,
                'name' => 'Kotak Makan Kertas Kraft',
                'stock_quantity' => 500,
                'unit' => 'pcs',
                'unit_price' => 1500,
                'minimum_stock' => 100,
            ],
        ];

        foreach ($inventories as $inv) {
            Inventory::firstOrCreate(
                ['name' => $inv['name']],
                $inv
            );
        }

        $this->command->info('✓ Inventory Categories, Suppliers, and 10 inventory items created');
    }
}
