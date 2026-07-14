<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'cashier',
            'branch_id' => $this->branch->id,
        ]);

        $category = Category::factory()->create(['name' => 'Coffee', 'slug' => 'coffee']);
        $this->product = Product::factory()->create([
            'category_id' => $category->id,
            'name' => 'Espresso',
            'base_price' => 25000,
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_create_order(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'dine_in',
                'payment_method' => 'cash',
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 2,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'order_number',
                'status',
                'total',
                'items',
            ]);

        $this->assertDatabaseHas('orders', [
            'branch_id' => $this->branch->id,
            'status' => 'pending',
        ]);
    }

    public function test_order_requires_at_least_one_item(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'dine_in',
                'payment_method' => 'cash',
                'items' => [],
            ]);

        $response->assertStatus(422);
    }

    public function test_order_validates_order_type(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'invalid_type',
                'payment_method' => 'cash',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_order_status_can_be_updated(): void
    {
        $order = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'dine_in',
                'payment_method' => 'cash',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1],
                ],
            ]);

        $orderId = $order->json('id');

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/orders/{$orderId}/status", [
                'status' => 'confirmed',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'confirmed']);
    }

    public function test_order_can_be_cancelled(): void
    {
        $order = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'take_away',
                'payment_method' => 'card',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1],
                ],
            ]);

        $orderId = $order->json('id');

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/orders/{$orderId}/cancel");

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'cancelled']);
    }

    public function test_completed_order_cannot_be_cancelled(): void
    {
        $order = $this->actingAs($this->user)
            ->postJson('/api/v1/orders', [
                'branch_id' => $this->branch->id,
                'order_type' => 'dine_in',
                'payment_method' => 'cash',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1],
                ],
            ]);

        $orderId = $order->json('id');

        // Complete the order first
        $this->actingAs($this->user)
            ->postJson("/api/v1/orders/{$orderId}/status", ['status' => 'completed']);

        // Try to cancel
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/orders/{$orderId}/cancel");

        $response->assertStatus(400);
    }
}
