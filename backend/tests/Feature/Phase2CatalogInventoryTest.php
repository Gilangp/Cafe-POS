<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\StockBatch;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2CatalogInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Branch $branchA;
    protected Branch $branchB;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branchA = Branch::factory()->create(['name' => 'Branch A Main', 'code' => 'BR-A']);
        $this->branchB = Branch::factory()->create(['name' => 'Branch B Secondary', 'code' => 'BR-B']);

        $this->admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@velvra.com',
            'role' => 'super_admin',
            'branch_id' => $this->branchA->id,
            'is_active' => true,
        ]);

        $this->category = Category::factory()->create([
            'name' => 'Beverages',
            'slug' => 'beverages',
            'is_active' => true,
        ]);
    }

    /**
     * MNU-003 & MNU-004: Branch Price Override and 86'd Availability Status
     */
    public function test_branch_price_override_and_availability_86d_status(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Signature Espresso',
            'slug' => 'signature-espresso',
            'base_price' => 25.00,
            'sku' => 'ESP-001',
            'is_active' => true,
        ]);

        // Override in Branch A: Price = 30.00, is_available = false (86'd)
        $responseOverride = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/products/{$product->id}/branch-override", [
                'branch_id' => $this->branchA->id,
                'price' => 30.00,
                'is_available' => false,
                'stock_quantity' => 0,
            ]);
        $responseOverride->assertStatus(200);

        // Query product list under Branch A scope -> verify effective price is 30 and is_available = false
        $responseListA = $this->withHeader('X-Branch-Id', $this->branchA->id)
            ->getJson('/api/v1/menu/items');
        $responseListA->assertStatus(200);
        $itemA = collect($responseListA->json('data'))->firstWhere('id', $product->id);
        $this->assertEquals(30.00, $itemA['effective_price']);
        $this->assertFalse($itemA['is_available']);

        // Query product list under Branch A scope with available_only=1 -> verify product filtered out (86'd)
        $responseAvailableOnly = $this->withHeader('X-Branch-Id', $this->branchA->id)
            ->getJson('/api/v1/menu/items?available_only=1');
        $responseAvailableOnly->assertStatus(200);
        $this->assertNull(collect($responseAvailableOnly->json('data'))->firstWhere('id', $product->id));

        // Query product list under Branch B scope -> verify effective price is base price (25.00) and available
        $responseListB = $this->withHeader('X-Branch-Id', $this->branchB->id)
            ->getJson('/api/v1/menu/items');
        $responseListB->assertStatus(200);
        $itemB = collect($responseListB->json('data'))->firstWhere('id', $product->id);
        $this->assertEquals(25.00, $itemB['effective_price']);
        $this->assertTrue($itemB['is_available']);
    }

    /**
     * RCP-003: Recipe Costing Engine (Weighted-Average COGS calculation)
     */
    public function test_recipe_cogs_calculation_engine(): void
    {
        // Coffee Beans: $15.00 per kg
        $beans = InventoryItem::create([
            'branch_id' => $this->branchA->id,
            'name' => 'Arabica Beans',
            'sku' => 'INV-BEANS',
            'unit' => 'kg',
            'quantity' => 10.0,
            'unit_cost' => 15.00,
        ]);

        // Milk: $2.00 per liter
        $milk = InventoryItem::create([
            'branch_id' => $this->branchA->id,
            'name' => 'Fresh Milk',
            'sku' => 'INV-MILK',
            'unit' => 'liter',
            'quantity' => 20.0,
            'unit_cost' => 2.00,
        ]);

        $recipe = Recipe::create([
            'branch_id' => $this->branchA->id,
            'name' => 'Iced Cafe Latte',
            'yield_quantity' => 2.0, // makes 2 portions
            'yield_unit' => 'portion',
            'status' => 'ACTIVE',
        ]);

        // 0.02 kg coffee beans = 0.02 * 15.00 * 100 = 30 cents
        RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'inventory_item_id' => $beans->id,
            'quantity' => 0.02,
            'unit' => 'kg',
        ]);

        // 0.20 liter milk = 0.20 * 2.00 * 100 = 40 cents
        RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'inventory_item_id' => $milk->id,
            'quantity' => 0.20,
            'unit' => 'liter',
        ]);

        // Link product to recipe
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Iced Cafe Latte',
            'slug' => 'iced-cafe-latte',
            'sku' => 'LATTE-001',
            'base_price' => 35.00,
            'recipe_id' => $recipe->id,
        ]);

        // Trigger COGS calculation engine and sync product cost
        // Total ingredient cost = 30 + 40 = 70 cents. Cost per portion (yield=2) = 35 cents ($0.35)
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/recipes/{$recipe->id}/calculate-cogs?sync_products=1");

        $response->assertStatus(200)
            ->assertJson([
                'total_recipe_cost_cents' => 70,
                'cost_per_portion_cents' => 35,
                'yield_quantity' => 2,
            ]);

        $this->assertEquals(35, $product->fresh()->cost_cents);
    }

    /**
     * INV-006: First-Expired-First-Out (FEFO) Batch Tracking & Stock Deduction Engine
     */
    public function test_fefo_batch_tracking_and_stock_deduction(): void
    {
        $item = InventoryItem::create([
            'branch_id' => $this->branchA->id,
            'name' => 'Vanilla Syrup',
            'sku' => 'SYR-VAN',
            'unit' => 'bottle',
            'quantity' => 100.0,
            'unit_cost' => 8.00,
        ]);

        // Batch 1: 30 bottles expiring 2026-08-01 (earlier)
        $batch1 = StockBatch::create([
            'branch_id' => $this->branchA->id,
            'inventory_item_id' => $item->id,
            'batch_number' => 'BATCH-EARLY',
            'quantity_received' => 30.0,
            'quantity_remaining' => 30.0,
            'received_date' => '2026-07-01',
            'expiration_date' => '2026-08-01',
            'unit_cost_cents' => 800,
            'status' => 'ACTIVE',
        ]);

        // Batch 2: 70 bottles expiring 2026-10-01 (later)
        $batch2 = StockBatch::create([
            'branch_id' => $this->branchA->id,
            'inventory_item_id' => $item->id,
            'batch_number' => 'BATCH-LATE',
            'quantity_received' => 70.0,
            'quantity_remaining' => 70.0,
            'received_date' => '2026-07-01',
            'expiration_date' => '2026-10-01',
            'unit_cost_cents' => 800,
            'status' => 'ACTIVE',
        ]);

        // Deduct 40 bottles using FEFO endpoint
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/inventory/fefo-deduct', [
                'inventory_item_id' => $item->id,
                'quantity' => 40.0,
                'reference_type' => 'TEST_FEFO',
                'notes' => 'Automated FEFO test deduction',
            ]);

        $response->assertStatus(200);

        // Verify Batch 1 (30 bottles) is completely depleted
        $batch1Fresh = $batch1->fresh();
        $this->assertEquals(0.0, $batch1Fresh->quantity_remaining);
        $this->assertEquals('DEPLETED', $batch1Fresh->status);

        // Verify Batch 2 (70 bottles) had 10 bottles deducted, leaving 60
        $batch2Fresh = $batch2->fresh();
        $this->assertEquals(60.0, $batch2Fresh->quantity_remaining);
        $this->assertEquals('ACTIVE', $batch2Fresh->status);

        // Verify total inventory quantity updated to 60 (100 - 40)
        $this->assertEquals(60.0, $item->fresh()->quantity);
    }

    /**
     * PUR: Purchase Order receiving updates stock, weighted-average cost, and creates FEFO batch
     */
    public function test_purchase_order_receiving_updates_stock_and_weighted_average_cost(): void
    {
        $supplier = Supplier::create([
            'name' => 'Global Roasters Co.',
            'code' => 'SUP-GLOB',
            'phone' => '08111222333',
            'is_active' => true,
        ]);

        // Initial inventory: 50 kg at $10.00/kg
        $invItem = InventoryItem::create([
            'branch_id' => $this->branchA->id,
            'name' => 'Robusta Beans',
            'sku' => 'INV-ROB',
            'unit' => 'kg',
            'quantity' => 50.0,
            'unit_cost' => 10.00,
        ]);

        // Create PO for 50 kg at $14.00/kg (1400 cents)
        $po = PurchaseOrder::create([
            'branch_id' => $this->branchA->id,
            'supplier_id' => $supplier->id,
            'po_number' => 'PO-2026-001',
            'order_date' => '2026-07-14',
            'status' => 'DRAFT',
            'total_cents' => 70000,
            'created_by' => $this->admin->id,
        ]);

        $poItem = PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'inventory_item_id' => $invItem->id,
            'quantity' => 50.0,
            'unit' => 'kg',
            'unit_price_cents' => 1400,
            'total_price_cents' => 70000,
            'received_quantity' => 0,
        ]);

        // Receive the items
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/purchase-orders/{$po->id}/receive", [
                'items' => [
                    [
                        'purchase_order_item_id' => $poItem->id,
                        'received_quantity' => 50.0,
                        'batch_number' => 'BATCH-PO-001',
                        'expiration_date' => '2027-07-14',
                    ]
                ]
            ]);

        $response->assertStatus(200);

        // Verify PO status updated to RECEIVED
        $this->assertEquals('RECEIVED', $po->fresh()->status);

        // Verify Weighted-Average Cost formula: ((50 * 10.00) + (50 * 14.00)) / (50 + 50) = 1200 / 100 = 12.00
        $invFresh = $invItem->fresh();
        $this->assertEquals(100.0, $invFresh->quantity);
        $this->assertEquals(12.00, $invFresh->unit_cost);

        // Verify new FEFO stock batch created
        $batch = StockBatch::where('batch_number', 'BATCH-PO-001')->first();
        $this->assertNotNull($batch);
        $this->assertEquals(50.0, $batch->quantity_remaining);
        $this->assertEquals('2027-07-14', $batch->expiration_date->format('Y-m-d'));
        $this->assertEquals(1400, $batch->unit_cost_cents);
    }
}
