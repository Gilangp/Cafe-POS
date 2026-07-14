<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Branch $branch;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::factory()->create();
        $this->admin = User::factory()->create([
            'role' => 'super_admin',
            'branch_id' => $this->branch->id,
        ]);
        $this->category = Category::factory()->create([
            'name' => 'Coffee',
            'slug' => 'coffee',
        ]);
    }

    public function test_public_can_list_products(): void
    {
        Product::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/menu/items');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'base_price'],
                ],
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_public_can_view_single_product(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/menu/items/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => $product->name]);
    }

    public function test_admin_can_create_product(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/products', [
                'category_id' => $this->category->id,
                'name' => 'Espresso Shot',
                'description' => 'Rich single espresso',
                'base_price' => 25000,
                'sku' => 'VLV-TEST-001',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Espresso Shot']);

        $this->assertDatabaseHas('products', [
            'name' => 'Espresso Shot',
            'slug' => 'espresso-shot',
        ]);
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/products/{$product->id}", [
                'name' => 'Updated Product Name',
                'base_price' => 35000,
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Product Name']);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_inactive_products_not_shown_in_public_list(): void
    {
        Product::factory()->create([
            'category_id' => $this->category->id,
            'is_active' => true,
        ]);

        Product::factory()->create([
            'category_id' => $this->category->id,
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/v1/menu/items');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }
}
