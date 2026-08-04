<?php

namespace Tests\Feature;

use App\Events\KdsOrderCreated;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\Menu;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use Tests\WithRoles;

class PosTransactionTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    protected Menu $menu;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::factory()->create();
        $this->menu = Menu::factory()->create([
            'category_id' => $category->id,
            'price' => 25000,
            'status' => 'tersedia',
        ]);
    }

    /** CP-08: endpoint privat tanpa token wajib 401 */
    public function test_pos_endpoints_reject_unauthenticated_access(): void
    {
        $this->getJson('/api/v1/pos/menus')->assertStatus(401);
        $this->postJson('/api/v1/pos/transactions', [])->assertStatus(401);
    }

    /** CP-02: role Dapur_Barista tidak boleh akses POS */
    public function test_pos_endpoints_reject_wrong_role(): void
    {
        $dapur = $this->createDapur();

        $this->actingAs($dapur)->getJson('/api/v1/pos/menus')->assertStatus(403);
    }

    /** CP-03: transaksi POS penuh -> row transactions + items + tiket KDS */
    public function test_kasir_can_create_transaction_and_kds_ticket_is_generated(): void
    {
        Event::fake([KdsOrderCreated::class]);

        $kasir = $this->createKasir();

        $response = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'table_number' => 'A1',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 2],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subtotal', '50000.00')
            ->assertJsonPath('data.total', '50000.00');

        $this->assertDatabaseHas('transactions', [
            'status' => 'selesai',
            'payment_method' => 'tunai',
        ]);
        $this->assertDatabaseHas('transaction_items', [
            'menu_id' => $this->menu->id,
            'quantity' => 2,
        ]);
        $this->assertDatabaseCount('order_tickets', 1);

        Event::assertDispatched(KdsOrderCreated::class);
    }

    /** CP-05: transaksi dengan resep mengurangi stok bahan baku otomatis */
    public function test_transaction_deducts_inventory_stock_based_on_recipe(): void
    {
        $inventory = Inventory::create([
            'category_id' => InventoryCategory::create(['name' => 'Bahan Baku'])->id,
            'name' => 'Biji Kopi',
            'stock_quantity' => 100,
            'unit' => 'gram',
            'minimum_stock' => 10,
        ]);

        $this->menu->menuIngredients()->create([
            'inventory_id' => $inventory->id,
            'quantity_used' => 15,
        ]);

        $kasir = $this->createKasir();

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'takeaway',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 2],
            ],
        ])->assertStatus(201);

        // 2 x 15 gram = 30 gram terpakai
        $this->assertEquals(70, $inventory->fresh()->stock_quantity);
        $this->assertDatabaseHas('inventory_logs', [
            'inventory_id' => $inventory->id,
            'type' => 'keluar',
            'quantity' => 30,
        ]);
    }

    public function test_transaction_calculates_tax_from_settings(): void
    {
        Setting::create([
            'site_name' => 'NEMU Space',
            'tax_enabled' => true,
            'tax_rate' => 11,
        ]);

        $kasir = $this->createKasir();

        $response = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 1],
            ],
        ]);

        // subtotal 25000 * 11% = 2750 tax, total = 27750
        $response->assertStatus(201)
            ->assertJsonPath('data.tax_amount', '2750.00')
            ->assertJsonPath('data.total', '27750.00');
    }

    /** 04 §17.3 poin 1: menu tidak tersedia tidak boleh masuk transaksi */
    public function test_unavailable_menu_cannot_be_ordered(): void
    {
        $unavailableMenu = Menu::factory()->unavailable()->create([
            'category_id' => $this->menu->category_id,
        ]);

        $kasir = $this->createKasir();

        $response = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [
                ['menu_id' => $unavailableMenu->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_transaction_requires_at_least_one_item(): void
    {
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [],
        ])->assertStatus(422);
    }
}
