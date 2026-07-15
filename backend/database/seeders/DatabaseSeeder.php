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
            'password' => 'password',
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
        HeroBanner::create([
            'title' => 'Pastries & Culinary Delights',
            'subtitle' => 'Lengkapi momen ngopi Anda dengan kreasi pastry hangat segar dari oven dapur kami setiap pagi.',
            'image' => '/images/hero/banner-3.jpg',
            'button_text' => 'Tentang Kami',
            'button_link' => '#about',
            'display_order' => 3,
            'is_active' => true,
        ]);

        // 6. Seed Categories
        $catCoffee = Category::create(['name' => 'Coffee Curations', 'display_order' => 1]);
        $catNonCoffee = Category::create(['name' => 'Non-Coffee Beverages', 'display_order' => 2]);
        $catSnacks = Category::create(['name' => 'Artisan Pastries & Snacks', 'display_order' => 3]);
        $catMain = Category::create(['name' => 'Main Courses', 'display_order' => 4]);

        // 7. Seed 10 Master Menus
        $menus = [
            [
                'category_id' => $catCoffee->id,
                'name' => 'Nemu Signature Aren Latte',
                'description' => 'Espresso house blend 100% Arabica dengan susu segar creamy dan gula aren asli beraroma karamel.',
                'price' => 35000,
                'image' => '/images/menu/aren-latte.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Caramel Macchiato Cloud',
                'description' => 'Layered vanilla milk dengan espresso shot dan foamy cloud topping berlapis saus karamel renyah.',
                'price' => 42000,
                'image' => '/images/menu/caramel-macchiato.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ],
            [
                'category_id' => $catCoffee->id,
                'name' => 'Artisan Manual Brew (V60)',
                'description' => 'Pilihan beans single origin musiman dengan notes buah segar dan kejernihan rasa maksimal.',
                'price' => 38000,
                'image' => '/images/menu/v60.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ],
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Matcha Cloud Latte',
                'description' => 'Ceremonial grade Uji Matcha dari Kyoto dipadukan dengan oat milk dan lapisan sea salt cold foam.',
                'price' => 45000,
                'image' => '/images/menu/matcha-latte.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ],
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Belgian Dark Chocolate',
                'description' => '70% Dark cocoa pure melt dengan tekstur kental pekat yang kaya rasa dan tidak terlalu manis.',
                'price' => 40000,
                'image' => '/images/menu/dark-chocolate.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ],
            [
                'category_id' => $catNonCoffee->id,
                'name' => 'Lychee Breeze Spring Tea',
                'description' => 'Teh melati seduh dingin dengan buah leci utuh segar dan sentuhan mint alami pelepas dahaga.',
                'price' => 32000,
                'image' => '/images/menu/lychee-tea.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ],
            [
                'category_id' => $catSnacks->id,
                'name' => 'Butter Croissant Artisan',
                'description' => 'French butter croissant flaky dengan tekstur renyah di luar dan lembut berlapis di dalam.',
                'price' => 28000,
                'image' => '/images/menu/butter-croissant.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ],
            [
                'category_id' => $catSnacks->id,
                'name' => 'Truffle Fries with Parmesan',
                'description' => 'Kentang goreng renyah bertabur minyak truffle harum dan parutan keju Parmigiano-Reggiano.',
                'price' => 38000,
                'image' => '/images/menu/truffle-fries.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ],
            [
                'category_id' => $catMain->id,
                'name' => 'Nemu Creamy Carbonara',
                'description' => 'Pasta spaghetti al dente dengan saus creamy kuning telur, smoked beef bacon, dan black pepper.',
                'price' => 58000,
                'image' => '/images/menu/carbonara.jpg',
                'status' => 'tersedia',
                'is_best_seller' => true,
            ],
            [
                'category_id' => $catMain->id,
                'name' => 'Wagyu Beef Rice Bowl',
                'description' => 'Irisan daging Wagyu saus yakiniku manis gurih di atas nasi hangat pulen dengan onsen egg.',
                'price' => 65000,
                'image' => '/images/menu/wagyu-bowl.jpg',
                'status' => 'tersedia',
                'is_best_seller' => false,
            ],
        ];

        foreach ($menus as $m) {
            Menu::create([
                'category_id' => $m['category_id'],
                'name' => $m['name'],
                'slug' => Str::slug($m['name']),
                'description' => $m['description'],
                'price' => $m['price'],
                'image' => $m['image'],
                'status' => $m['status'],
                'is_best_seller' => $m['is_best_seller'],
            ]);
        }

        // 8. Seed 10 Physical Tables
        for ($i = 1; $i <= 10; $i++) {
            $num = str_pad($i, 2, '0', STR_PAD_LEFT);
            $cap = ($i <= 4) ? 2 : (($i <= 8) ? 4 : 6);
            Table::create([
                'table_number' => "T-{$num}",
                'capacity' => $cap,
                'status' => 'tersedia',
            ]);
        }

        // 9. Seed FAQs
        $faqs = [
            [
                'question' => 'Apakah perlu melakukan reservasi sebelum datang ke NEMU Space?',
                'answer' => 'Anda bisa datang langsung (walk-in) kapan saja. Namun untuk akhir pekan atau rombongan lebih dari 4 orang, kami sangat menyarankan reservasi terlebih dahulu melalui halaman Reservasi.',
                'display_order' => 1,
            ],
            [
                'question' => 'Apakah NEMU Space menyediakan fasilitas Wi-Fi dan colokan listrik untuk bekerja?',
                'answer' => 'Tentu! Kami menyediakan Wi-Fi fiber optic berkecepatan tinggi gratis dan colokan listrik di hampir setiap meja untuk mendukung kenyamanan bekerja dan belajar Anda.',
            ],
            [
                'question' => 'Apakah NEMU Space ramah hewan peliharaan (pet-friendly)?',
                'answer' => 'Ya, area semi-outdoor kami terbuka untuk hewan peliharaan (pet-friendly). Kami mohon agar anabul tetap menggunakan leash demi kenyamanan bersama.',
                'display_order' => 3,
            ],
            [
                'question' => 'Bagaimana ketersediaan area parkir di NEMU Space?',
                'answer' => 'Kami memiliki area parkir pribadi yang cukup luas untuk mobil maupun sepeda motor, lengkap dengan petugas keamanan yang menjaga selama jam operasional.',
                'display_order' => 4,
            ],
        ];

        foreach ($faqs as $f) {
            Faq::create($f);
        }
    }
}