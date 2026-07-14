<?php

namespace Tests\Feature;

use App\Events\KdsOrderCreated;
use App\Events\KdsOrderStatusUpdated;
use App\Models\Branch;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\Role;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Tests\TestCase;

class Phase3PosKdsTest extends TestCase
{
    use RefreshDatabase;

    protected Branch $branch;
    protected User $cashier;
    protected Product $product;
    protected InventoryItem $item;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create(['name' => 'cashier', 'display_name' => 'Cashier', 'guard_name' => 'web']);
        $this->branch = Branch::factory()->create(['name' => 'Branch Central', 'code' => 'CENT', 'address' => 'Central']);
        
        $this->cashier = User::factory()->create([
            'branch_id' => $this->branch->id,
            'is_active' => true,
        ]);
        $this->cashier->roles()->attach($role);

        $category = Category::create(['name' => 'Coffee Main', 'slug' => 'coffee-main', 'is_active' => true]);

        $this->item = InventoryItem::create([
            'branch_id' => $this->branch->id,
            'name' => 'Milk Carton',
            'sku' => 'MLK-001',
            'unit' => 'bottle',
            'quantity' => 100,
            'reorder_point' => 10,
            'unit_cost' => 10.00,
        ]);

        StockBatch::create([
            'branch_id' => $this->branch->id,
            'inventory_item_id' => $this->item->id,
            'batch_number' => 'BATCH-MLK-01',
            'quantity_received' => 100,
            'quantity_remaining' => 100,
            'unit_cost_cents' => 1000,
            'received_date' => now()->format('Y-m-d'),
            'expiration_date' => now()->addMonths(2)->format('Y-m-d'),
            'status' => 'ACTIVE',
        ]);

        $recipe = Recipe::create([
            'name' => 'Milk Coffee Recipe',
            'yield_quantity' => 1,
            'unit' => 'portion',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'inventory_item_id' => $this->item->id,
            'quantity' => 1,
            'unit' => 'bottle',
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Milk Coffee',
            'slug' => 'milk-coffee',
            'sku' => 'PRD-MLK-01',
            'base_price' => 30.00,
            'is_active' => true,
            'recipe_id' => $recipe->id,
        ]);
    }

    public function test_pos_offline_batch_sync_and_idempotency_guarantee()
    {
        Event::fake([KdsOrderCreated::class]);

        $token = $this->cashier->createToken('pos-token')->plainTextToken;

        $key1 = 'IDEM-KEY-' . Str::uuid();
        $key2 = 'IDEM-KEY-' . Str::uuid();

        $payload = [
            'orders' => [
                [
                    'idempotency_key' => $key1,
                    'branch_id' => $this->branch->id,
                    'order_type' => 'dine_in',
                    'payment_method' => 'cash',
                    'table_number' => 'TBL-01',
                    'notes' => 'Offline order 1',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 2,
                        ]
                    ]
                ],
                [
                    'idempotency_key' => $key2,
                    'branch_id' => $this->branch->id,
                    'order_type' => 'take_away',
                    'payment_method' => 'qris',
                    'table_number' => null,
                    'notes' => 'Offline order 2',
                    'items' => [
                        [
                            'product_id' => $this->product->id,
                            'quantity' => 3,
                        ]
                    ]
                ]
            ]
        ];

        // 1. Initial Batch Sync request (e.g. POS reconnected to network)
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/orders/batch-sync', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'synced_count' => 2,
                'duplicate_count' => 0,
            ]);

        $this->assertDatabaseCount('orders', 2);
        
        // Verify FEFO batch deduction occurred for both orders (2 + 3 = 5 bottles deducted)
        $this->assertEquals(95, $this->item->fresh()->quantity);
        $this->assertEquals(95, StockBatch::first()->quantity_remaining);

        // Verify KdsOrderCreated event was dispatched
        Event::assertDispatched(KdsOrderCreated::class, 2);

        // 2. Re-send exact same batch request simulating poor connection retry or double submit
        $retryResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/orders/batch-sync', $payload);

        $retryResponse->assertStatus(200)
            ->assertJson([
                'synced_count' => 0,
                'duplicate_count' => 2,
            ]);

        // Verify NO duplicate orders created and NO extra stock deducted (idempotency guaranteed)
        $this->assertDatabaseCount('orders', 2);
        $this->assertEquals(95, $this->item->fresh()->quantity);
    }

    public function test_kds_realtime_status_workflow_and_broadcasting()
    {
        Event::fake([KdsOrderStatusUpdated::class]);

        $token = $this->cashier->createToken('kds-token')->plainTextToken;

        // Create a confirmed order needing kitchen preparation
        $order = Order::create([
            'order_number' => 'ORD-KDS-001',
            'branch_id' => $this->branch->id,
            'user_id' => $this->cashier->id,
            'customer_name' => 'Table 5 Customer',
            'order_type' => 'dine_in',
            'status' => 'confirmed',
            'kitchen_status' => 'PENDING',
            'payment_status' => 'paid',
            'payment_method' => 'card',
            'subtotal' => 30.00,
            'total' => 30.00,
            'table_number' => 'TBL-05',
        ]);

        // 1. Check KDS active orders endpoint
        $kdsResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/kds/orders?branch_id=' . $this->branch->id);

        $kdsResponse->assertStatus(200)
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.kitchen_status', 'PENDING');

        // 2. Accept order on KDS (In Progress)
        $acceptResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/kds/orders/{$order->id}/accept");

        $acceptResponse->assertStatus(200)
            ->assertJsonPath('status', 'preparing')
            ->assertJsonPath('kitchen_status', 'IN_PROGRESS');

        $this->assertEquals('IN_PROGRESS', $order->fresh()->kitchen_status);
        Event::assertDispatched(KdsOrderStatusUpdated::class);

        // 3. Mark order Ready on KDS
        $readyResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/kds/orders/{$order->id}/ready");

        $readyResponse->assertStatus(200)
            ->assertJsonPath('status', 'ready')
            ->assertJsonPath('kitchen_status', 'READY');

        $this->assertEquals('READY', $order->fresh()->kitchen_status);
    }
}
