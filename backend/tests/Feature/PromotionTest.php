<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Promotion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-10: Promo validasi periode — promo di luar tanggal tidak aktif.
 * PUB-06, ADM-01 dari 08 §7.
 */
class PromotionTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** PUB-06: Promo aktif dalam periode tampil di endpoint publik */
    public function test_active_promotion_within_period_appears_in_public_endpoint(): void
    {
        Promotion::create([
            'title' => 'Promo Lebaran',
            'type' => 'percentage',
            'value' => 20,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
            'status' => 'aktif',
        ]);

        $response = $this->getJson('/api/v1/promotions');

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Promo Lebaran']);
    }

    /** PUB-06: Promo di luar periode tidak tampil di endpoint publik */
    public function test_expired_promotion_does_not_appear_in_public_endpoint(): void
    {
        Promotion::create([
            'title' => 'Promo Kedaluwarsa',
            'type' => 'nominal',
            'value' => 5000,
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDay(),
            'status' => 'aktif',
        ]);

        $response = $this->getJson('/api/v1/promotions');

        $response->assertStatus(200)
            ->assertJsonMissing(['title' => 'Promo Kedaluwarsa']);
    }

    /** Promo belum mulai tidak tampil di endpoint publik */
    public function test_future_promotion_does_not_appear_in_public_endpoint(): void
    {
        Promotion::create([
            'title' => 'Promo Mendatang',
            'type' => 'percentage',
            'value' => 10,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(5),
            'status' => 'aktif',
        ]);

        $response = $this->getJson('/api/v1/promotions');

        $response->assertStatus(200)
            ->assertJsonMissing(['title' => 'Promo Mendatang']);
    }

    /** Promo status tidak_aktif tidak tampil meski dalam periode */
    public function test_inactive_promotion_does_not_appear_even_within_period(): void
    {
        Promotion::create([
            'title' => 'Promo Nonaktif',
            'type' => 'nominal',
            'value' => 10000,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
            'status' => 'tidak_aktif',
        ]);

        $response = $this->getJson('/api/v1/promotions');

        $response->assertStatus(200)
            ->assertJsonMissing(['title' => 'Promo Nonaktif']);
    }

    /** Admin bisa buat promo baru */
    public function test_admin_can_create_promotion(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/promotions', [
            'title' => 'Promo Baru',
            'type' => 'percentage',
            'value' => 15,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'status' => 'aktif',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Promo Baru');
    }

    /** Validasi: end_date tidak boleh sebelum start_date */
    public function test_promotion_end_date_must_be_after_start_date(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->postJson('/api/v1/admin/promotions', [
            'title' => 'Promo Invalid',
            'type' => 'percentage',
            'value' => 10,
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->toDateString(),
            'status' => 'aktif',
        ])->assertStatus(422);
    }
}
