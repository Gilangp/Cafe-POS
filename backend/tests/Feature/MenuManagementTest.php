<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-09: CRUD menu -> tampil publik & POS.
 * ADM-01 dari 08 §7.4.
 */
class MenuManagementTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** CP-09: Admin buat menu baru -> langsung tampil di endpoint publik */
    public function test_admin_created_menu_appears_in_public_listing(): void
    {
        $admin = $this->createAdmin();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/menus', [
            'category_id' => $category->id,
            'name' => 'Kopi Susu Gula Aren',
            'price' => 22000,
            'status' => 'tersedia',
            'is_best_seller' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Kopi Susu Gula Aren');

        // Tampil di endpoint publik tanpa auth
        $publicResponse = $this->getJson('/api/v1/menus');
        $publicResponse->assertStatus(200)
            ->assertJsonFragment(['name' => 'Kopi Susu Gula Aren']);

        // Tampil juga di endpoint POS
        $kasir = $this->createKasir();
        $posResponse = $this->actingAs($kasir)->getJson('/api/v1/pos/menus');
        $posResponse->assertStatus(200)
            ->assertJsonFragment(['name' => 'Kopi Susu Gula Aren']);
    }

    /** Menu tidak tersedia tidak muncul di listing publik */
    public function test_unavailable_menu_hidden_from_public_listing(): void
    {
        $category = Category::factory()->create();
        Menu::factory()->unavailable()->create([
            'category_id' => $category->id,
            'name' => 'Menu Habis',
        ]);

        $response = $this->getJson('/api/v1/menus');

        $response->assertStatus(200)
            ->assertJsonMissing(['name' => 'Menu Habis']);
    }

    /** Kasir/Dapur tidak bisa CRUD menu (hanya Admin/Owner) */
    public function test_kasir_cannot_create_menu(): void
    {
        $kasir = $this->createKasir();
        $category = Category::factory()->create();

        $this->actingAs($kasir)->postJson('/api/v1/admin/menus', [
            'category_id' => $category->id,
            'name' => 'Menu Tidak Sah',
            'price' => 10000,
            'status' => 'tersedia',
        ])->assertStatus(403);
    }

    /** 04 §20.2 poin 1: menu yang sudah dipakai transaksi tidak boleh dihapus permanen (soft delete) */
    public function test_menu_used_in_transaction_is_soft_deleted_not_permanently(): void
    {
        $admin = $this->createAdmin();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id]);

        $this->actingAs($admin)->deleteJson("/api/v1/admin/menus/{$menu->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('menus', ['id' => $menu->id]);

        // Masih bisa diakses lewat withTrashed (index admin)
        $adminList = $this->actingAs($admin)->getJson('/api/v1/admin/menus');
        $adminList->assertStatus(200)
            ->assertJsonFragment(['id' => $menu->id]);
    }

    /** Admin bisa restore menu yang sudah dihapus */
    public function test_admin_can_restore_soft_deleted_menu(): void
    {
        $admin = $this->createAdmin();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id]);
        $menu->delete();

        $this->actingAs($admin)->postJson("/api/v1/admin/menus/{$menu->id}/restore")
            ->assertStatus(200);

        $this->assertDatabaseHas('menus', [
            'id' => $menu->id,
            'deleted_at' => null,
        ]);
    }

    /** 04 §20.2 poin 2: perubahan harga menu tidak mengubah transaksi lama (price snapshot) */
    public function test_menu_price_change_does_not_affect_past_transactions(): void
    {
        $admin = $this->createAdmin();
        $kasir = $this->createKasir();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id, 'price' => 20000]);

        // Buat transaksi dengan harga lama
        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [['menu_id' => $menu->id, 'quantity' => 1]],
        ])->assertStatus(201);

        // Admin ubah harga
        $this->actingAs($admin)->putJson("/api/v1/admin/menus/{$menu->id}", [
            'price' => 35000,
        ])->assertStatus(200);

        // Transaksi lama tetap pakai snapshot harga lama
        $this->assertDatabaseHas('transaction_items', [
            'menu_id' => $menu->id,
            'price_snapshot' => 20000,
        ]);
    }

    /** Publik bisa search menu berdasarkan nama */
    public function test_public_can_search_menu_by_keyword(): void
    {
        $category = Category::factory()->create();
        Menu::factory()->create(['category_id' => $category->id, 'name' => 'Es Kopi Susu']);
        Menu::factory()->create(['category_id' => $category->id, 'name' => 'Teh Manis']);

        $response = $this->getJson('/api/v1/menus?search=kopi');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Es Kopi Susu'])
            ->assertJsonMissing(['name' => 'Teh Manis']);
    }

    /** Publik bisa filter menu per kategori */
    public function test_public_can_filter_menu_by_category(): void
    {
        $categoryA = Category::factory()->create(['name' => 'Kopi']);
        $categoryB = Category::factory()->create(['name' => 'Non-Kopi']);
        Menu::factory()->create(['category_id' => $categoryA->id, 'name' => 'Espresso']);
        Menu::factory()->create(['category_id' => $categoryB->id, 'name' => 'Es Teh']);

        $response = $this->getJson("/api/v1/menus?category_id={$categoryA->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Espresso'])
            ->assertJsonMissing(['name' => 'Es Teh']);
    }
}
