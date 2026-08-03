<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Seed Settings: 1 baris dengan konfigurasi dasar
     * tax_rate = 11%, tax_enabled = true
     * Sesuai dokumentasi Section 26.3 Point 3
     */
    public function run(): void
    {
        Setting::firstOrCreate(
            ['id' => Setting::first()->id ?? \Illuminate\Support\Str::uuid()],
            [
                'site_name' => 'NEMU Space Coffee Shop',
                'site_tagline' => 'Handcrafted Curations & Comfort Space',
                'phone' => '+62 811 2345 6789',
                'email' => 'hello@nemuspace.test',
                'address' => 'Jl. Senopati Raya No. 88, Kebayoran Baru, Jakarta Selatan 12190',
                'operating_hours' => 'Senin - Minggu: 08.00 - 23.00 WIB',
                'tax_rate' => 11.00,
                'tax_enabled' => true,
                'seo_title' => 'NEMU Space — Artisan Coffee & Cozy Space',
                'seo_description' => 'Temukan kopi artisan terbaik dan suasana ruang nyaman untuk berkarya dan bercengkerama di NEMU Space.',
                'seo_keywords' => 'coffee shop, nemu space, kopi jakarta, cafe senopati, specialty coffee',
            ]
        );

        $this->command->info('✓ Settings created with tax_rate=11% and tax_enabled=true');
    }
}
