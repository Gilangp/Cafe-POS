<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = DB::table('users')->where('email', 'admin@velvra.test')->value('id')
            ?? DB::table('users')->value('id');

        if (!$adminId) {
            $this->command->warn('CmsSeeder skipped: user missing.');
            return;
        }

        $pages = [
            ['title' => 'Home', 'slug' => 'home', 'content' => 'Premium coffee and kitchen experience.', 'is_homepage' => true],
            ['title' => 'About Velvra', 'slug' => 'about', 'content' => 'Velvra is a premium coffee shop platform.', 'is_homepage' => false],
            ['title' => 'Contact', 'slug' => 'contact', 'content' => 'Reach our team for reservations and events.', 'is_homepage' => false],
        ];

        foreach ($pages as $page) {
            DB::table('pages')->updateOrInsert(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'content' => $page['content'],
                    'meta_title' => $page['title'].' - Velvra',
                    'meta_description' => $page['content'],
                    'featured_image' => null,
                    'status' => 'published',
                    'is_homepage' => $page['is_homepage'],
                    'author_id' => $adminId,
                    'published_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $homeId = DB::table('pages')->where('slug', 'home')->value('id');
        if ($homeId) {
            $blocks = [
                ['type' => 'hero', 'sort_order' => 1, 'content_json' => ['headline' => 'Velvra Coffee', 'subtitle' => 'Modern coffee and kitchen platform']],
                ['type' => 'featured_menu', 'sort_order' => 2, 'content_json' => ['title' => 'Featured Menu', 'limit' => 4]],
            ];

            foreach ($blocks as $block) {
                DB::table('cms_blocks')->updateOrInsert(
                    ['page_id' => $homeId, 'type' => $block['type'], 'sort_order' => $block['sort_order']],
                    ['content_json' => json_encode($block['content_json']), 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        DB::table('media_library')->updateOrInsert(
            ['path' => 'seed/velvra-hero.jpg'],
            [
                'disk' => 'public',
                'filename' => 'velvra-hero.jpg',
                'mime_type' => 'image/jpeg',
                'size_bytes' => 245760,
                'alt_text' => 'Velvra coffee hero image',
                'uploaded_by' => $adminId,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->command->info('CMS seed data ready.');
    }
}