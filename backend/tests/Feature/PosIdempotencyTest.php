<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-06: Idempotency POS — submit transaksi 2x dengan idempotency_key sama
 * tidak boleh double charge / double stok (04 §17.5.3, NFR-12).
 */
class PosIdempotencyTest extends TestCase
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

    /** CP-06: idempotency_key sama, payload sama -> hanya 1 transaksi dibuat */
    public function test_duplicate_submission_with_same_idempotency_key_creates_one_transaction(): void
    {
        $kasir = $this->createKasir();

        $payload = [
            'idempotency_key' => 'idem-key-001',
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 2],
            ],
        ];

        $response1 = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload);
        $response1->assertStatus(201);
        $transactionId = $response1->json('data.id');

        // Kirim ulang payload identik (simulasi retry/double-submit)
        $response2 = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload);
        $response2->assertStatus(201)
            ->assertJsonPath('data.id', $transactionId);

        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseCount('transaction_items', 1);
        $this->assertDatabaseCount('order_tickets', 1);
    }

    /** CP-06: stok tidak boleh terpotong dua kali untuk key yang sama */
    public function test_duplicate_submission_does_not_deduct_stock_twice(): void
    {
        $inventory = \App\Models\Inventory::create([
            'category_id' => \App\Models\InventoryCategory::create(['name' => 'Bahan Baku'])->id,
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

        $payload = [
            'idempotency_key' => 'idem-key-stock',
            'payment_method' => 'tunai',
            'order_type' => 'takeaway',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 2],
            ],
        ];

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload)->assertStatus(201);
        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload)->assertStatus(201);

        // Stok hanya terpotong 1x (2 x 15 gram = 30 gram), bukan 2x
        $this->assertEquals(70, $inventory->fresh()->stock_quantity);
        $this->assertDatabaseCount('inventory_logs', 1);
    }

    /** Idempotency key berbeda -> 2 transaksi terpisah dibuat */
    public function test_different_idempotency_keys_create_separate_transactions(): void
    {
        $kasir = $this->createKasir();

        $basePayload = [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 1],
            ],
        ];

        $response1 = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', array_merge($basePayload, [
            'idempotency_key' => 'key-A',
        ]));
        $response1->assertStatus(201);

        $response2 = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', array_merge($basePayload, [
            'idempotency_key' => 'key-B',
        ]));
        $response2->assertStatus(201);

        $this->assertNotEquals($response1->json('data.id'), $response2->json('data.id'));
        $this->assertDatabaseCount('transactions', 2);
    }

    /** Tanpa idempotency_key (opsional) -> tetap bisa transaksi normal, tiap request buat baru */
    public function test_transaction_without_idempotency_key_still_works(): void
    {
        $kasir = $this->createKasir();

        $payload = [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [
                ['menu_id' => $this->menu->id, 'quantity' => 1],
            ],
        ];

        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload)->assertStatus(201);
        $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', $payload)->assertStatus(201);

        // Tanpa idempotency_key, tiap request adalah transaksi independen
        $this->assertDatabaseCount('transactions', 2);
    }
}
