<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\Member;
use App\Models\MembershipTier;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\Role;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class Phase4CustomerCrmTest extends TestCase
{
    use RefreshDatabase;

    protected Branch $branch;
    protected User $cashier;
    protected Product $product;
    protected InventoryItem $item;
    protected MembershipTier $tier;

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
            'name' => 'Coffee Beans',
            'sku' => 'CBN-001',
            'unit' => 'kg',
            'quantity' => 500,
            'reorder_point' => 10,
            'unit_cost' => 100.00,
        ]);

        StockBatch::create([
            'branch_id' => $this->branch->id,
            'inventory_item_id' => $this->item->id,
            'batch_number' => 'BATCH-CBN-01',
            'quantity_received' => 500,
            'quantity_remaining' => 500,
            'unit_cost_cents' => 10000,
            'received_date' => now()->format('Y-m-d'),
            'expiration_date' => now()->addMonths(6)->format('Y-m-d'),
            'status' => 'ACTIVE',
        ]);

        $recipe = Recipe::create([
            'name' => 'Latte Recipe',
            'yield_quantity' => 1,
            'unit' => 'portion',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'inventory_item_id' => $this->item->id,
            'quantity' => 1,
            'unit' => 'kg',
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Cafe Latte',
            'slug' => 'cafe-latte',
            'sku' => 'PRD-LAT-01',
            'base_price' => 50000.00,
            'is_active' => true,
            'recipe_id' => $recipe->id,
        ]);

        $this->tier = MembershipTier::create([
            'name' => 'Gold',
            'minimum_spend_cents' => 1000000,
            'points_multiplier' => 1.50,
        ]);
    }

    public function test_customer_crm_member_crud_and_lookup()
    {
        $token = $this->cashier->createToken('test-token')->plainTextToken;

        // 1. Create a member via API
        $createResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/members', [
                'full_name' => 'Budi Santoso',
                'phone' => '08123456789',
                'email' => 'budi@example.com',
                'membership_tier_id' => $this->tier->id,
                'branch_id' => $this->branch->id,
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('full_name', 'Budi Santoso')
            ->assertJsonPath('points_balance', 0);

        $memberId = $createResponse->json('id');
        $memberCode = $createResponse->json('member_code');

        // 2. Lookup member by phone for POS fast check
        $lookupResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/members/lookup?query=0812345');

        $lookupResponse->assertStatus(200)
            ->assertJsonPath('0.id', $memberId)
            ->assertJsonPath('0.full_name', 'Budi Santoso');

        // 3. Admin point adjustment
        $adjustResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/members/{$memberId}/adjust-points", [
                'points' => 200,
                'description' => 'Welcome bonus adjustment',
            ]);

        $adjustResponse->assertStatus(200)
            ->assertJsonPath('points_balance', 200);

        $this->assertDatabaseHas('loyalty_transactions', [
            'member_id' => $memberId,
            'type' => 'ADJUST',
            'points' => 200,
        ]);
    }

    public function test_loyalty_engine_points_accrual_on_order_completion()
    {
        $token = $this->cashier->createToken('test-token')->plainTextToken;

        $member = Member::create([
            'branch_id' => $this->branch->id,
            'membership_tier_id' => $this->tier->id, // Gold tier with 1.5 multiplier
            'member_code' => 'MBR-GOLD-01',
            'full_name' => 'Siti Nurhaliza',
            'phone' => '08987654321',
            'points_balance' => 100,
        ]);

        // Create an order linked to member
        $orderResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'dine_in',
                'payment_method' => 'card',
                'member_id' => $member->id,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 2, // 2 x 50,000 = 100,000
                    ]
                ]
            ]);

        $orderResponse->assertStatus(201);
        $orderId = $orderResponse->json('id');
        $this->assertEquals(0, $member->fresh()->points_balance - 100); // Not awarded until completed

        // Mark order completed
        $completeResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/orders/{$orderId}/status", [
                'status' => 'completed',
            ]);

        $completeResponse->assertStatus(200);

        // Subtotal 100,000 + 11,000 tax = 111,000 total / 1,000 = 111 * 1.5 multiplier = 166 points earned!
        // Initial balance 100 + 166 = 266 points total
        $this->assertEquals(266, $member->fresh()->points_balance);
        $this->assertDatabaseHas('loyalty_transactions', [
            'member_id' => $member->id,
            'order_id' => $orderId,
            'type' => 'EARN',
            'points' => 166,
        ]);
    }

    public function test_loyalty_engine_points_redemption_on_checkout()
    {
        $token = $this->cashier->createToken('test-token')->plainTextToken;

        $member = Member::create([
            'branch_id' => $this->branch->id,
            'member_code' => 'MBR-REDEEM-01',
            'full_name' => 'Rizky Billar',
            'phone' => '0811223344',
            'points_balance' => 150, // Has 150 points
        ]);

        // Redeem 100 points during order checkout (100 points * Rp 100 = Rp 10,000 discount)
        $orderResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'take_away',
                'payment_method' => 'cash',
                'member_id' => $member->id,
                'points_to_redeem' => 100,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1, // 50,000 + 5,500 tax - 10,000 discount = 45,500
                    ]
                ]
            ]);

        $orderResponse->assertStatus(201)
            ->assertJsonPath('discount', '10000.00')
            ->assertJsonPath('points_redeemed', 100);

        // Verify member point balance deducted immediately (150 - 100 = 50)
        $this->assertEquals(50, $member->fresh()->points_balance);
        $this->assertDatabaseHas('loyalty_transactions', [
            'member_id' => $member->id,
            'type' => 'REDEEM',
            'points' => -100,
        ]);
    }

    public function test_online_and_qr_ordering_public_endpoint_with_idempotency()
    {
        $key = 'ONLINE-QR-IDEM-' . Str::uuid();

        $payload = [
            'branch_id' => $this->branch->id,
            'order_type' => 'online',
            'payment_method' => 'qris',
            'table_number' => 'TBL-QR-12',
            'idempotency_key' => $key,
            'notes' => 'Extra sugar please',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                ]
            ]
        ];

        // 1. Submit public online/QR order
        $response1 = $this->postJson('/api/v1/orders/public', $payload);
        $response1->assertStatus(201)
            ->assertJsonPath('table_number', 'TBL-QR-12')
            ->assertJsonPath('idempotency_key', $key);

        $orderId = $response1->json('id');
        $this->assertDatabaseCount('orders', 1);

        // 2. Re-submit exact same request (e.g. user double clicks Pay or network timeout retry)
        $response2 = $this->postJson('/api/v1/orders/public', $payload);
        $response2->assertStatus(200)
            ->assertJsonPath('id', $orderId)
            ->assertJsonPath('idempotency_key', $key);

        // Verify no duplicate order created
        $this->assertDatabaseCount('orders', 1);
    }
}
