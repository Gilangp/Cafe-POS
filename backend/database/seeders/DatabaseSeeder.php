<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Faq;
use App\Models\HeroBanner;
use App\Models\Menu;
use App\Models\Role;
use App\Models\Setting;
use App\Models\SocialMedia;
use App\Models\Table;
use App\Models\User;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Reservation;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\MenuIngredient;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        $ownerRole = Role::create(['name' => 'Owner']);
        $adminRole = Role::create(['name' => 'Admin']);
        $kasirRole = Role::create(['name' => 'Kasir']);
        $dapurRole = Role::create(['name' => 'Dapur_Barista']);

        // 2. Seed Default Accounts
        $owner = User::create([
            'name' => 'Owner NEMU Space',
            'email' => 'owner@nemuspace.id',
            'password' => 'password', // Mutator akan otomatis melakukan hash
            'phone' => '081111111111',
            'is_active' => true,
        ]);
        $owner->roles()->attach($ownerRole->id);

        $admin = User::create([
            'name' => 'Admin NEMU Space',
            'email' => 'admin@nemuspace.id',
            'password' => 'password',
            'phone' => '081111111112',
            'is_active' => true,
        ]);
        $admin->roles()->attach($adminRole->id);

        $kasir = User::create([
            'name' => 'Kasir Shift 1',
            'email' => 'kasir@nemuspace.id',
            'password' => 'password',
            'phone' => '081111111113',
            'is_active' => true,
        ]);
        $kasir->roles()->attach($kasirRole->id);

        $dapur = User::create([
            'name' => 'Barista / Dapur Utama',
            'email' => 'dapur@nemuspace.id',
            'password' => 'password',
            'phone' => '081111111114',
            'is_active' => true,
        ]);
        $dapur->roles()->attach($dapurRole->id);

        $stafMulti = User::create([
            'name' => 'Staf Multi-Role (Kasir & Barista)',
            'email' => 'staf@nemuspace.id',
            'password' => 'password',
            'phone' => '081111111115',
            'is_active' => true,
        ]);
        $stafMulti->roles()->attach([$kasirRole->id, $dapurRole->id]);

        // 3. Seed Settings
        Setting::create([
            'site_name' => 'NEMU Space Coffee Shop',
            'site_tagline' => 'Handcrafted Curations & Comfort Space',
            'phone' => '+62 811 2345 6789',
            'email' => 'hello@nemuspace.id',
            'address' => 'Jl. Senopati Raya No. 88, Kebayoran Baru, Jakarta Selatan 12190',
            'operating_hours' => 'Senin - Minggu: 08.00 - 23.00 WIB',
            'seo_title' => 'NEMU Space — Artisan Coffee & Cozy Space',
            'seo_description' => 'Temukan kopi artisan terbaik dan suasana ruang nyaman untuk berkarya dan bercengkerama di NEMU Space.',
            'seo_keywords' => 'coffee shop, nemu space, kopi jakarta, cafe senopati, specialty coffee',
        ]);

        // 4. Seed Social Media
        SocialMedia::create([
            'platform' => 'Instagram',
            'url' => 'https://instagram.com/nemuspace.id',
            'icon' => 'instagram',
            'is_active' => true,
            'display_order' => 1,
        ]);
        SocialMedia::create([
            'platform' => 'TikTok',
            'url' => 'https://tiktok.com/@nemuspace.id',
            'icon' => 'video',
            'is_active' => true,
            'display_order' => 2,
        ]);

        // 5. Seed Hero Banners (3 Banners)
        HeroBanner::create([
            'title' => 'Sip the Extraordinary, Feel the Comfort',
            'subtitle' => 'Setiap seduhan adalah kurasi terbaik dari biji kopi pilihan nusantara dengan sentuhan modern artisan.',
            'image' => '/images/hero/banner-1.jpg',
            'button_text' => 'Lihat Menu',
            'button_link' => '/menu',
            'display_order' => 1,
            'is_active' => true,
        ]);
        HeroBanner::create([
            'title' => 'Your Ideal Space for Ideas & Connection',
            'subtitle' => 'Ruang ergonomis dengan Wi-Fi berkecepatan tinggi dan suasana tenang untuk mendukung produktivitas Anda.',
            'image' => '/images/hero/banner-2.jpg',
            'button_text' => 'Reservasi Meja',
            'button_link' => '/reservasi',
            'display_order' => 2,
            'is_active' => true,
        ]);

        // 6. Seed Inventory Categories & Suppliers
        $invCatKopi = InventoryCategory::create(['name' => 'Biji Kopi']);
        $invCatSusu = InventoryCategory::create(['name' => 'Susu & Kreamer']);
        $invCatSirup = InventoryCategory::create(['name' => 'Sirup & Gula']);
        $invCatTeh = InventoryCategory::create(['name' => 'Teh & Bubuk']);
        $invCatBahanMakanan = InventoryCategory::create(['name' => 'Bahan Makanan']);
        $invCatPackaging = InventoryCategory::create(['name' => 'Packaging']);

        $supplierLokal = Supplier::create([
            'name' => 'PT Kopi Nusantara Raya',
            'phone' => '081234567890',
            'address' => 'Gudang Kopi Jakarta'
        ]);
        $supplierSusu = Supplier::create([
            'name' => 'CV Susu Segar Indonesia',
            'phone' => '081234567891',
            'address' => 'Pabrik Susu Bandung'
        ]);
        $supplierPackaging = Supplier::create([
            'name' => 'Bintang Packaging',
            'phone' => '081234567892',
            'address' => 'Jakarta Barat'
        ]);

        // 7. Seed Inventories (Bahan Baku)
        $invKopiArabica = Inventory::create([
            'category_id' => $invCatKopi->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Biji Kopi Arabica Gayo (Roast)',
            'stock_quantity' => 50000, // in grams
            'unit' => 'gram',
            'minimum_stock' => 5000,
        ]);
        $invKopiRobusta = Inventory::create([
            'category_id' => $invCatKopi->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Biji Kopi Robusta Temanggung',
            'stock_quantity' => 20000, // in grams
            'unit' => 'gram',
            'minimum_stock' => 3000,
        ]);
        $invSusuUHT = Inventory::create([
            'category_id' => $invCatSusu->id,
            'supplier_id' => $supplierSusu->id,
            'name' => 'Susu Cair UHT Full Cream',
            'stock_quantity' => 50000, // in ml
            'unit' => 'ml',
            'minimum_stock' => 5000,
        ]);
        $invGulaAren = Inventory::create([
            'category_id' => $invCatSirup->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Sirup Gula Aren Asli',
            'stock_quantity' => 10000, // in ml
            'unit' => 'ml',
            'minimum_stock' => 2000,
        ]);
        $invTehMelati = Inventory::create([
            'category_id' => $invCatTeh->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Teh Daun Melati',
            'stock_quantity' => 5000, // in gram
            'unit' => 'gram',
            'minimum_stock' => 1000,
        ]);
        $invBeras = Inventory::create([
            'category_id' => $invCatBahanMakanan->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Beras Putih Premium',
            'stock_quantity' => 50000, // in gram
            'unit' => 'gram',
            'minimum_stock' => 10000,
        ]);
        $invTelur = Inventory::create([
            'category_id' => $invCatBahanMakanan->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Telur Ayam Horn',
            'stock_quantity' => 500, // in pcs
            'unit' => 'pcs',
            'minimum_stock' => 50,
        ]);
        $invAyam = Inventory::create([
            'category_id' => $invCatBahanMakanan->id,
            'supplier_id' => $supplierLokal->id,
            'name' => 'Daging Ayam Potong',
            'stock_quantity' => 20000, // in gram
            'unit' => 'gram',
            'minimum_stock' => 5000,
        ]);
        $invCupEs = Inventory::create([
            'category_id' => $invCatPackaging->id,
            'supplier_id' => $supplierPackaging->id,
            'name' => 'Gelas Plastik Es 16oz',
            'stock_quantity' => 1000, // in pcs
            'unit' => 'pcs',
            'minimum_stock' => 200,
        ]);
        $invKardusMakan = Inventory::create([
            'category_id' => $invCatPackaging->id,
            'supplier_id' => $supplierPackaging->id,
            'name' => 'Kotak Makan Kertas Kraft',
            'stock_quantity' => 500, // in pcs
            'unit' => 'pcs',
            'minimum_stock' => 100,
        ]);

        // 8. Seed Categories Menu
        $catKopi = Category::create(['name' => 'Kopi Nusantara', 'display_order' => 1]);
        $catNonKopi = Category::create(['name' => 'Minuman Segar', 'display_order' => 2]);
        $catCamilan = Category::create(['name' => 'Camilan Tradisional', 'display_order' => 3]);
        $catMakan = Category::create(['name' => 'Makanan Utama', 'display_order' => 4]);

        // 9. Seed Menus Indonesia Lokal
        $mKopiAren = Menu::create([
            'category_id' => $catKopi->id,
            'name' => 'Es Kopi Susu Gula Aren',
            'slug' => 'es-kopi-susu-gula-aren',
            'description' => 'Paduan espresso Arabica Gayo, susu segar creamy, dan manisnya gula aren lokal asli.',
            'price' => 25000,
            'image' => '/images/menu/kopi-aren.jpg',
            'status' => 'tersedia',
            'is_best_seller' => true,
        ]);
        MenuIngredient::create(['menu_id' => $mKopiAren->id, 'inventory_id' => $invKopiArabica->id, 'quantity_used' => 18]);
        MenuIngredient::create(['menu_id' => $mKopiAren->id, 'inventory_id' => $invSusuUHT->id, 'quantity_used' => 120]);
        MenuIngredient::create(['menu_id' => $mKopiAren->id, 'inventory_id' => $invGulaAren->id, 'quantity_used' => 20]);
        MenuIngredient::create(['menu_id' => $mKopiAren->id, 'inventory_id' => $invCupEs->id, 'quantity_used' => 1]);

        $mKopiTubruk = Menu::create([
            'category_id' => $catKopi->id,
            'name' => 'Kopi Hitam Tubruk',
            'slug' => 'kopi-hitam-tubruk',
            'description' => 'Kopi hitam seduh tradisional dengan ampas. Menggunakan biji Robusta Temanggung pilihan.',
            'price' => 18000,
            'image' => '/images/menu/kopi-tubruk.jpg',
            'status' => 'tersedia',
            'is_best_seller' => false,
        ]);
        MenuIngredient::create(['menu_id' => $mKopiTubruk->id, 'inventory_id' => $invKopiRobusta->id, 'quantity_used' => 15]);

        $mEsTeh = Menu::create([
            'category_id' => $catNonKopi->id,
            'name' => 'Es Teh Manis Melati',
            'slug' => 'es-teh-manis-melati',
            'description' => 'Teh seduh daun melati asli yang harum dan menyegarkan dahaga.',
            'price' => 15000,
            'image' => '/images/menu/es-teh.jpg',
            'status' => 'tersedia',
            'is_best_seller' => true,
        ]);
        MenuIngredient::create(['menu_id' => $mEsTeh->id, 'inventory_id' => $invTehMelati->id, 'quantity_used' => 5]);
        MenuIngredient::create(['menu_id' => $mEsTeh->id, 'inventory_id' => $invCupEs->id, 'quantity_used' => 1]);

        $mNasiGoreng = Menu::create([
            'category_id' => $catMakan->id,
            'name' => 'Nasi Goreng Spesial NEMU',
            'slug' => 'nasi-goreng-spesial',
            'description' => 'Nasi goreng bumbu rempah dengan topping telur mata sapi dan potongan ayam bakar.',
            'price' => 45000,
            'image' => '/images/menu/nasi-goreng.jpg',
            'status' => 'tersedia',
            'is_best_seller' => true,
        ]);
        MenuIngredient::create(['menu_id' => $mNasiGoreng->id, 'inventory_id' => $invBeras->id, 'quantity_used' => 150]);
        MenuIngredient::create(['menu_id' => $mNasiGoreng->id, 'inventory_id' => $invTelur->id, 'quantity_used' => 1]);
        MenuIngredient::create(['menu_id' => $mNasiGoreng->id, 'inventory_id' => $invAyam->id, 'quantity_used' => 50]);

        $mAyamBakar = Menu::create([
            'category_id' => $catMakan->id,
            'name' => 'Nasi Ayam Bakar Madu',
            'slug' => 'nasi-ayam-bakar',
            'description' => 'Ayam bakar olesan madu lezat disajikan dengan nasi putih hangat dan sambal terasi.',
            'price' => 42000,
            'image' => '/images/menu/ayam-bakar.jpg',
            'status' => 'tersedia',
            'is_best_seller' => false,
        ]);
        MenuIngredient::create(['menu_id' => $mAyamBakar->id, 'inventory_id' => $invBeras->id, 'quantity_used' => 150]);
        MenuIngredient::create(['menu_id' => $mAyamBakar->id, 'inventory_id' => $invAyam->id, 'quantity_used' => 150]);

        $mPisgor = Menu::create([
            'category_id' => $catCamilan->id,
            'name' => 'Pisang Goreng Keju Susu',
            'slug' => 'pisang-goreng-keju',
            'description' => 'Pisang kepok manis digoreng krispi dengan taburan keju parut dan kental manis.',
            'price' => 22000,
            'image' => '/images/menu/pisgor.jpg',
            'status' => 'tersedia',
            'is_best_seller' => true,
        ]);
        MenuIngredient::create(['menu_id' => $mPisgor->id, 'inventory_id' => $invSusuUHT->id, 'quantity_used' => 20]); // assuming milk is used
        
        $mSingkong = Menu::create([
            'category_id' => $catCamilan->id,
            'name' => 'Singkong Goreng Merekah',
            'slug' => 'singkong-goreng',
            'description' => 'Singkong empuk merekah dengan bumbu gurih ketumbar dan bawang putih.',
            'price' => 18000,
            'image' => '/images/menu/singkong.jpg',
            'status' => 'tersedia',
            'is_best_seller' => false,
        ]);        // 10. Seed 10 Physical Tables
        $tables = [];
        for ($i = 1; $i <= 10; $i++) {
            $num = str_pad($i, 2, '0', STR_PAD_LEFT);
            $cap = ($i <= 4) ? 2 : (($i <= 8) ? 4 : 6);
            $tables[] = Table::create([
                'table_number' => "T-{$num}",
                'capacity'     => $cap,
                'status'       => 'tersedia',
            ]);
        }

        // 11. Seed FAQs
        $faqs = [
            [
                'question'      => 'Apakah NEMU Space buka 24 jam?',
                'answer'        => 'Saat ini kami buka setiap hari mulai pukul 08:00 hingga 23:00 WIB.',
                'display_order' => 1,
            ],
            [
                'question'      => 'Apakah tersedia koneksi internet (Wi-Fi)?',
                'answer'        => 'Ya, kami menyediakan Wi-Fi berkecepatan tinggi gratis bagi seluruh pelanggan yang menikmati hidangan kami.',
                'display_order' => 2,
            ],
        ];

        foreach ($faqs as $f) {
            Faq::create($f);
        }

        // 12. Seed Dummy Transactions (Past 30 Days) for Dashboard
        $kasir_id       = $kasir->id;
        $payment_methods = ['tunai', 'qris', 'kartu'];
        $order_types    = ['dine_in', 'takeaway'];
        $startDate      = now()->subDays(30);
        $menuList       = Menu::all();

        for ($i = 0; $i < 60; $i++) {
            $randomDate = $startDate->copy()->addDays(rand(0, 30))->addHours(rand(8, 22));
            $orderType  = $order_types[array_rand($order_types)];
            $tableNum   = $orderType === 'dine_in' ? $tables[array_rand($tables)]->table_number : null;

            $transaction = Transaction::create([
                'invoice_number' => 'INV-' . $randomDate->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'cashier_id'     => $kasir_id,
                'order_type'     => $orderType,
                'table_number'   => $tableNum,
                'subtotal'       => 0,
                'discount'       => 0,
                'total'          => 0,
                'payment_method' => $payment_methods[array_rand($payment_methods)],
                'status'         => 'selesai',
                'created_at'     => $randomDate,
                'updated_at'     => $randomDate,
            ]);

            $subtotal = 0;
            $numItems = rand(1, 4);
            for ($j = 0; $j < $numItems; $j++) {
                $menu         = $menuList->random();
                $qty          = rand(1, 3);
                $itemSubtotal = $menu->price * $qty;
                $subtotal     += $itemSubtotal;

                TransactionItem::create([
                    'transaction_id'    => $transaction->id,
                    'menu_id'           => $menu->id,
                    'menu_name_snapshot' => $menu->name,
                    'price_snapshot'    => $menu->price,
                    'quantity'          => $qty,
                    'subtotal'          => $itemSubtotal,
                    'created_at'        => $randomDate,
                    'updated_at'        => $randomDate,
                ]);
            }

            $transaction->update(['subtotal' => $subtotal, 'total' => $subtotal]);
        }

        // 13. Seed Reservations
        for ($k = 0; $k < 10; $k++) {
            $isToday = $k < 4;
            $resDate = $isToday ? now() : now()->addDays(rand(1, 7));
            $resTime = str_pad(rand(10, 20), 2, '0', STR_PAD_LEFT) . ':00:00';
            $table   = $tables[array_rand($tables)];

            Reservation::create([
                'customer_name'    => 'Pelanggan ' . ($k + 1),
                'customer_email'   => 'pelanggan' . ($k + 1) . '@email.com',
                'customer_phone'   => '081234567' . rand(100, 999),
                'reservation_date' => $resDate->toDateString(),
                'reservation_time' => $resTime,
                'party_size'       => rand(2, 6),
                'table_id'         => $table->id,
                'status'           => 'menunggu_konfirmasi',
            ]);
        }
    }
}