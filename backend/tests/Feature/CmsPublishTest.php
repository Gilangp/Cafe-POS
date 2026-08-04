<?php

namespace Tests\Feature;

use App\Models\AboutUs;
use App\Models\Faq;
use App\Models\HeroBanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-13: CMS publish section -> toggle off menghilangkan section dari Landing Page.
 * ADM-01 dari 08 §7.4.
 */
class CmsPublishTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** CP-13: Hero banner aktif tampil di landing page */
    public function test_active_hero_banner_appears_in_landing_page(): void
    {
        HeroBanner::create([
            'title' => 'Handcrafted Coffee',
            'image' => 'banners/hero1.webp',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $response = $this->getJson('/api/v1/landing-page');

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Handcrafted Coffee']);
    }

    /** CP-13: toggle off (is_active=false) -> section hilang dari landing page */
    public function test_inactive_hero_banner_hidden_from_landing_page(): void
    {
        HeroBanner::create([
            'title' => 'Banner Nonaktif',
            'image' => 'banners/hero2.webp',
            'is_active' => false,
            'display_order' => 1,
        ]);

        $response = $this->getJson('/api/v1/landing-page');

        $response->assertStatus(200)
            ->assertJsonMissing(['title' => 'Banner Nonaktif']);
    }

    /** FAQ aktif tampil, nonaktif tersembunyi */
    public function test_faq_visibility_follows_active_toggle(): void
    {
        Faq::create(['question' => 'FAQ Aktif?', 'answer' => 'Ya', 'is_active' => true, 'display_order' => 1]);
        Faq::create(['question' => 'FAQ Nonaktif?', 'answer' => 'Tidak', 'is_active' => false, 'display_order' => 2]);

        $response = $this->getJson('/api/v1/faqs');

        $response->assertStatus(200)
            ->assertJsonFragment(['question' => 'FAQ Aktif?'])
            ->assertJsonMissing(['question' => 'FAQ Nonaktif?']);
    }

    /** About Us aktif tampil di landing page */
    public function test_about_us_visibility_follows_active_toggle(): void
    {
        AboutUs::create([
            'title' => 'Cerita Kami',
            'content' => 'NEMU Space sejak 2020',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $response = $this->getJson('/api/v1/landing-page');

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Cerita Kami']);
    }

    /** Admin bisa toggle status hero banner (nonaktifkan) */
    public function test_admin_can_toggle_hero_banner_status(): void
    {
        $admin = $this->createAdmin();
        $banner = HeroBanner::create([
            'title' => 'Banner Test',
            'image' => 'banners/test.webp',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $this->actingAs($admin)->putJson("/api/v1/admin/banners/{$banner->id}", [
            'is_active' => 0,
        ])->assertStatus(200);

        $this->assertFalse($banner->fresh()->is_active);

        // Setelah toggle off, hilang dari publik
        $this->getJson('/api/v1/landing-page')
            ->assertJsonMissing(['title' => 'Banner Test']);
    }

    /** Kasir tidak bisa kelola CMS */
    public function test_kasir_cannot_manage_cms_banners(): void
    {
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->postJson('/api/v1/admin/banners', [
            'title' => 'Ilegal',
            'image' => 'x.webp',
        ])->assertStatus(403);
    }
}
