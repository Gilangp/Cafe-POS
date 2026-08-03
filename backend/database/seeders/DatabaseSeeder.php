<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\HeroBanner;
use App\Models\Menu;
use App\Models\SocialMedia;
use App\Models\Table;
use App\Models\User;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Reservation;
use App\Models\VariantGroup;
use App\Models\VariantOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * Urutan sesuai dokumentasi Section 26.3:
     * 1. RolesSeeder
     * 2. UsersSeeder
     * 3. SettingsSeeder
     * 4. InventorySeeder
     * 5. MenuSeeder
     * 6. FullMenuSeeder (Opsional, untuk Demo)
     * 7. ProcurementSeeder & UnitConversionSeeder
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Database Seeding...');
        $this->command->newLine();

        // 1. Seed Roles (Owner, Admin, Kasir, Dapur/Barista)
        $this->command->info('1️⃣  Seeding Roles...');
        $this->call(RolesSeeder::class);
        
        // 2. Seed Users (4 users dengan email @nemuspace.test)
        $this->command->info('2️⃣  Seeding Users...');
        $this->call(UsersSeeder::class);
        
        // 3. Seed Settings (tax_rate=11%, tax_enabled=true)
        $this->command->info('3️⃣  Seeding Settings...');
        $this->call(SettingsSeeder::class);
        
        // 4. Seed Inventory (Categories, Suppliers, Bahan Baku)
        $this->command->info('4️⃣  Seeding Inventory...');
        $this->call(InventorySeeder::class);
        
        // 5. Seed Menu (10-15 menu untuk testing)
        $this->command->info('5️⃣  Seeding Test Menus...');
        $this->call(MenuSeeder::class);

        // 6. Seed Unit Conversions (kg->gram, liter->ml, dll)
        $this->command->info('6️⃣  Seeding Unit Conversions...');
        $this->call(UnitConversionSeeder::class);

        // 7. Seed Procurement Data (PO & Suppliers)
        $this->command->info('7️⃣  Seeding Procurement Data...');
        $this->call(ProcurementSeeder::class);

        $this->command->newLine();
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('📦 Seeding Additional CMS & Demo Data...');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->newLine();

        // 8. Seed Social Media
        $this->command->info('📱 Seeding Social Media...');
        SocialMedia::firstOrCreate(
            ['platform' => 'Instagram'],
            [
                'url' => 'https://instagram.com/nemuspace.id',
                'icon' => 'instagram',
                'is_active' => true,
                'display_order' => 1,
            ]
        );
        SocialMedia::firstOrCreate(
            ['platform' => 'TikTok'],
            [
                'url' => 'https://tiktok.com/@nemuspace.id',
                'icon' => 'video',
                'is_active' => true,
                'display_order' => 2,
            ]
        );

        // 9. Seed Hero Banners
        $this->command->info('🎨 Seeding Hero Banners...');
        HeroBanner::firstOrCreate(
            ['title' => 'Sip the Extraordinary, Feel the Comfort'],
            [
                'subtitle' => 'Setiap seduhan adalah kurasi terbaik dari biji kopi pilihan nusantara dengan sentuhan modern artisan.',
                'image' => '/images/hero/banner-1.jpg',
                'button_text' => 'Lihat Menu',
                'button_link' => '/menu',
                'display_order' => 1,
                'is_active' => true,
            ]
        );
        HeroBanner::firstOrCreate(
            ['title' => 'Your Ideal Space for Ideas & Connection'],
            [
                'subtitle' => 'Ruang ergonomis dengan Wi-Fi berkecepatan tinggi dan suasana tenang untuk mendukung produktivitas Anda.',
                'image' => '/images/hero/banner-2.jpg',
                'button_text' => 'Reservasi Meja',
                'button_link' => '/reservasi',
                'display_order' => 2,
                'is_active' => true,
            ]
        );

        // 10. Seed Variant Groups untuk FullMenuSeeder
        $this->command->info('🔧 Seeding Additional Variant Groups...');
        $vgSuhu = VariantGroup::firstOrCreate(
            ['name' => 'Temperature'],
            ['type' => 'single']
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgSuhu->id, 'name' => 'Hot'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgSuhu->id, 'name' => 'Iced'],
            ['additional_price' => 0]
        );

        $vgGula = VariantGroup::firstOrCreate(
            ['name' => 'Level Gula'],
            ['type' => 'single']
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgGula->id, 'name' => 'Normal Sugar (100%)'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgGula->id, 'name' => 'Less Sugar (50%)'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgGula->id, 'name' => 'No Sugar (0%)'],
            ['additional_price' => 0]
        );

        $vgEs = VariantGroup::firstOrCreate(
            ['name' => 'Level Es'],
            ['type' => 'single']
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgEs->id, 'name' => 'Normal Ice'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgEs->id, 'name' => 'Less Ice'],
            ['additional_price' => 0]
        );
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgEs->id, 'name' => 'No Ice'],
            ['additional_price' => 0]
        );

        $vgAddon = VariantGroup::firstOrCreate(
            ['name' => 'Tambahan (Add-ons)'],
            ['type' => 'multiple']
        );
        $invKopiGayo = \App\Models\Inventory::where('name', 'Biji Kopi Gayo')->first();
        if ($invKopiGayo) {
            VariantOption::firstOrCreate(
                ['variant_group_id' => $vgAddon->id, 'name' => 'Extra Espresso Shot'],
                [
                    'additional_price' => 5000,
                    'inventory_item_id' => $invKopiGayo->id,
                    'inventory_action' => 'add',
                    'inventory_action_value' => 10
                ]
            );
        }
        VariantOption::firstOrCreate(
            ['variant_group_id' => $vgAddon->id, 'name' => 'Boba'],
            ['additional_price' => 4000]
        );

        // 11. Seed Full Menu (30+ menu realistis untuk demo)
        $this->command->info('☕ Seeding Full Menu (Demo)...');
        $this->call(FullMenuSeeder::class);

        // 12. Seed Physical Tables
        $this->command->info('🪑 Seeding Physical Tables...');
        $tables = [];
        for ($i = 1; $i <= 10; $i++) {
            $num = str_pad($i, 2, '0', STR_PAD_LEFT);
            $cap = ($i <= 4) ? 2 : (($i <= 8) ? 4 : 6);
            $tables[] = Table::firstOrCreate(
                ['table_number' => "T-{$num}"],
                [
                    'capacity' => $cap,
                    'status' => 'tersedia',
                ]
            );
        }

        // 13. Seed FAQs
        $this->command->info('❓ Seeding FAQs...');
        $faqs = [
            [
                'question' => 'Apakah NEMU Space buka 24 jam?',
                'answer' => 'Saat ini kami buka setiap hari mulai pukul 08:00 hingga 23:00 WIB.',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'question' => 'Apakah tersedia koneksi internet (Wi-Fi)?',
                'answer' => 'Ya, kami menyediakan Wi-Fi berkecepatan tinggi gratis bagi seluruh pelanggan yang menikmati hidangan kami.',
                'display_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $f) {
            Faq::firstOrCreate(
                ['question' => $f['question']],
                $f
            );
        }

        // 14. Seed Dummy Transactions (Past 30 Days) for Dashboard
        $this->command->info('💰 Seeding Dummy Transactions...');
        $kasir = User::where('email', 'kasir@nemuspace.test')->first();
        if (!$kasir) {
            $kasir = User::where('email', 'kasir@nemuspace.id')->first();
        }

        if ($kasir) {
            $payment_methods = ['tunai', 'qris', 'kartu'];
            $order_types = ['dine_in', 'takeaway'];
            $startDate = now()->subDays(30);
            $menuList = Menu::all();

            if ($menuList->isNotEmpty()) {
                for ($i = 0; $i < 60; $i++) {
                    $randomDate = $startDate->copy()->addDays(rand(0, 30))->addHours(rand(8, 22));
                    $orderType = $order_types[array_rand($order_types)];
                    $tableNum = $orderType === 'dine_in' ? $tables[array_rand($tables)]->table_number : null;

                    $transaction = Transaction::create([
                        'invoice_number' => 'INV-' . $randomDate->format('Ymd') . '-' . strtoupper(Str::random(4)),
                        'cashier_id' => $kasir->id,
                        'order_type' => $orderType,
                        'table_number' => $tableNum,
                        'subtotal' => 0,
                        'discount' => 0,
                        'tax_amount' => 0,
                        'total' => 0,
                        'payment_method' => $payment_methods[array_rand($payment_methods)],
                        'status' => 'selesai',
                        'created_at' => $randomDate,
                        'updated_at' => $randomDate,
                    ]);

                    $subtotal = 0;
                    $numItems = rand(1, 4);
                    for ($j = 0; $j < $numItems; $j++) {
                        $menu = $menuList->random();
                        $qty = rand(1, 3);
                        $itemSubtotal = $menu->price * $qty;
                        $subtotal += $itemSubtotal;

                        TransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'menu_id' => $menu->id,
                            'menu_name_snapshot' => $menu->name,
                            'price_snapshot' => $menu->price,
                            'quantity' => $qty,
                            'subtotal' => $itemSubtotal,
                            'created_at' => $randomDate,
                            'updated_at' => $randomDate,
                        ]);
                    }

                    $taxAmount = $subtotal * 0.11; // 11% tax
                    $transaction->update([
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxAmount,
                        'total' => $subtotal + $taxAmount
                    ]);
                }
            }
        }

        // 15. Seed Reservations
        $this->command->info('📅 Seeding Reservations...');
        for ($k = 0; $k < 10; $k++) {
            $isToday = $k < 4;
            $resDate = $isToday ? now() : now()->addDays(rand(1, 7));
            $resTime = str_pad(rand(10, 20), 2, '0', STR_PAD_LEFT) . ':00:00';
            $table = $tables[array_rand($tables)];

            Reservation::create([
                'customer_name' => 'Pelanggan ' . ($k + 1),
                'customer_email' => 'pelanggan' . ($k + 1) . '@email.com',
                'customer_phone' => '081234567' . rand(100, 999),
                'reservation_date' => $resDate->toDateString(),
                'reservation_time' => $resTime,
                'party_size' => rand(2, 6),
                'table_id' => $table->id,
                'status' => 'menunggu_konfirmasi',
            ]);
        }

        $this->command->newLine();
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅ Database Seeding Completed Successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->newLine();
        $this->command->info('📝 Test Credentials:');
        $this->command->info('   Owner: owner@nemuspace.test / password');
        $this->command->info('   Admin: admin@nemuspace.test / password');
        $this->command->info('   Kasir: kasir@nemuspace.test / password');
        $this->command->info('   Dapur: dapur@nemuspace.test / password');
        $this->command->newLine();
    }
}
