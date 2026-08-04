<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-12: Laporan filter tanggal + export.
 * ADM-04 dari 08 §7.4.
 */
class ReportTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** CP-12: Laporan sales menghitung angka sesuai transaksi yang ada */
    public function test_sales_report_reflects_actual_transactions(): void
    {
        $admin = $this->createAdmin();
        $kasir = $this->createKasir();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id, 'price' => 30000]);

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [['menu_id' => $menu->id, 'quantity' => 2]],
        ])->assertStatus(201);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports/sales');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.total_transactions'));
        $this->assertEquals(60000.0, $response->json('data.total_revenue'));
    }

    /** CP-12: Filter tanggal membatasi hasil laporan */
    public function test_sales_report_filters_by_date_range(): void
    {
        $admin = $this->createAdmin();
        $kasir = $this->createKasir();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id, 'price' => 25000]);

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [['menu_id' => $menu->id, 'quantity' => 1]],
        ])->assertStatus(201);

        // Filter tanggal di masa depan -> tidak ada transaksi
        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports/sales?from='.now()->addDays(5)->toDateString());

        $response->assertStatus(200)
            ->assertJsonPath('data.total_transactions', 0);
    }

    /** Laporan inventory menampilkan item stok menipis */
    public function test_inventory_report_shows_low_stock_items(): void
    {
        $admin = $this->createAdmin();

        Inventory::create([
            'category_id' => InventoryCategory::create(['name' => 'Bahan'])->id,
            'name' => 'Gula Aren',
            'stock_quantity' => 5,
            'unit' => 'kg',
            'minimum_stock' => 10,
        ]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports/inventory');

        $response->assertStatus(200)
            ->assertJsonPath('data.low_stock_count', 1)
            ->assertJsonFragment(['name' => 'Gula Aren']);
    }

    /** CP-12: Export laporan menghasilkan response terunduh */
    public function test_report_export_returns_download_info(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports/export?type=pdf&report=sales');

        $response->assertStatus(200)
            ->assertJsonPath('data.export_type', 'pdf')
            ->assertJsonPath('data.report_type', 'sales');

        $this->assertNotNull($response->json('data.download_url'));
    }

    /** Kasir tidak bisa akses laporan */
    public function test_kasir_cannot_access_reports(): void
    {
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->getJson('/api/v1/admin/reports/sales')
            ->assertStatus(403);
    }

    /** Owner bisa akses laporan (via grup Admin,Owner) */
    public function test_owner_can_access_reports(): void
    {
        $owner = $this->createOwner();

        $this->actingAs($owner)->getJson('/api/v1/admin/reports/sales')
            ->assertStatus(200);
    }
}
