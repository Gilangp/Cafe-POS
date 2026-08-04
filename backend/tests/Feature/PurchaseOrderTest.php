<?php

namespace Tests\Feature;

use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-11: Purchase order receive -> stok bertambah + log mutasi.
 * ADM-03 dari 08 §7.4.
 */
class PurchaseOrderTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    protected Supplier $supplier;
    protected Inventory $inventory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->supplier = Supplier::create(['name' => 'Supplier Kopi Nusantara']);
        $this->inventory = Inventory::create([
            'category_id' => InventoryCategory::create(['name' => 'Bahan Baku'])->id,
            'name' => 'Biji Kopi Arabica',
            'stock_quantity' => 50,
            'unit' => 'kg',
            'minimum_stock' => 10,
        ]);
    }

    /** CP-11: Admin buat PO baru */
    public function test_admin_can_create_purchase_order(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/purchase-orders', [
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'items' => [
                [
                    'inventory_item_id' => $this->inventory->id,
                    'quantity' => 20,
                    'unit_price_cents' => 5000000, // 50.000/kg
                ],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('purchase_orders', ['status' => 'ORDERED']);
        $this->assertDatabaseHas('purchase_order_items', [
            'inventory_item_id' => $this->inventory->id,
            'quantity' => 20,
        ]);
    }

    /** CP-11: PO receive -> stok bertambah + log mutasi tercatat */
    public function test_receiving_purchase_order_increases_stock_and_logs_mutation(): void
    {
        $admin = $this->createAdmin();

        $po = PurchaseOrder::create([
            'po_number' => 'PO-TEST-001',
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'ORDERED',
            'total_cents' => 100000000,
        ]);

        $poItem = $po->items()->create([
            'inventory_item_id' => $this->inventory->id,
            'quantity' => 20,
            'unit' => 'kg',
            'unit_price_cents' => 5000000,
            'total_price_cents' => 100000000,
        ]);

        $response = $this->actingAs($admin)->postJson("/api/v1/admin/purchase-orders/{$po->id}/receive", [
            'items' => [
                [
                    'purchase_order_item_id' => $poItem->id,
                    'received_quantity' => 20,
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'RECEIVED');

        // Stok bertambah 20 (50 + 20 = 70)
        $this->assertEquals(70, $this->inventory->fresh()->stock_quantity);

        $this->assertDatabaseHas('inventory_logs', [
            'inventory_id' => $this->inventory->id,
            'type' => 'masuk',
            'quantity' => 20,
        ]);
    }

    /** PO partial receive -> status PARTIAL */
    public function test_partial_receiving_sets_status_to_partial(): void
    {
        $admin = $this->createAdmin();

        $po = PurchaseOrder::create([
            'po_number' => 'PO-TEST-002',
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'ORDERED',
            'total_cents' => 100000000,
        ]);

        $poItem = $po->items()->create([
            'inventory_item_id' => $this->inventory->id,
            'quantity' => 20,
            'unit' => 'kg',
            'unit_price_cents' => 5000000,
            'total_price_cents' => 100000000,
        ]);

        $this->actingAs($admin)->postJson("/api/v1/admin/purchase-orders/{$po->id}/receive", [
            'items' => [
                ['purchase_order_item_id' => $poItem->id, 'received_quantity' => 10],
            ],
        ])->assertStatus(200)
            ->assertJsonPath('status', 'PARTIAL');
    }

    /** PO cancel hanya untuk status DRAFT/ORDERED */
    public function test_purchase_order_can_be_cancelled_when_draft_or_ordered(): void
    {
        $admin = $this->createAdmin();

        $po = PurchaseOrder::create([
            'po_number' => 'PO-TEST-003',
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'ORDERED',
            'total_cents' => 0,
        ]);

        $this->actingAs($admin)->postJson("/api/v1/admin/purchase-orders/{$po->id}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('status', 'CANCELLED');
    }

    /** PO yang sudah RECEIVED tidak bisa dibatalkan */
    public function test_received_purchase_order_cannot_be_cancelled(): void
    {
        $admin = $this->createAdmin();

        $po = PurchaseOrder::create([
            'po_number' => 'PO-TEST-004',
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'RECEIVED',
            'total_cents' => 0,
        ]);

        $this->actingAs($admin)->postJson("/api/v1/admin/purchase-orders/{$po->id}/cancel")
            ->assertStatus(400);
    }

    /** Kasir tidak bisa akses purchase order */
    public function test_kasir_cannot_access_purchase_orders(): void
    {
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->getJson('/api/v1/admin/purchase-orders')
            ->assertStatus(403);
    }
}
