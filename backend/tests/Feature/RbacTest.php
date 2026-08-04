<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Menu;
use App\Models\OrderTicket;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * Tes wajib gap RBAC — lihat 08_testing_specification.md §12.1
 * dan 03_requirements.md Lampiran A.1 (GAP-RBAC-01, GAP-RBAC-02).
 */
class RbacTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    protected function createTransaction(): Transaction
    {
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id]);
        $kasir = $this->createKasir();

        $transaction = Transaction::create([
            'invoice_number' => 'INV-TEST-'.uniqid(),
            'cashier_id' => $kasir->id,
            'order_type' => 'dine_in',
            'subtotal' => 25000,
            'total' => 25000,
            'payment_method' => 'tunai',
            'status' => 'selesai',
        ]);

        OrderTicket::create([
            'transaction_id' => $transaction->id,
            'ticket_number' => 'TKT-'.uniqid(),
            'status' => 'diterima',
            'received_at' => now(),
        ]);

        return $transaction;
    }

    /** GAP-RBAC-01 poin 1: Kasir tidak bisa void */
    public function test_kasir_cannot_void_transaction(): void
    {
        $transaction = $this->createTransaction();
        $kasir = $this->createKasir();

        $this->actingAs($kasir)
            ->patchJson("/api/v1/pos/transactions/{$transaction->id}/void", [
                'void_reason' => 'Salah input',
            ])
            ->assertStatus(403);
    }

    /** GAP-RBAC-01 poin 2: Admin & Owner bisa void */
    public function test_admin_and_owner_can_void_transaction(): void
    {
        $admin = $this->createAdmin();
        $transaction = $this->createTransaction();

        $this->actingAs($admin)
            ->patchJson("/api/v1/pos/transactions/{$transaction->id}/void", [
                'void_reason' => 'Salah input',
            ])
            ->assertStatus(200);

        $owner = $this->createOwner();
        $transaction2 = $this->createTransaction();

        $this->actingAs($owner)
            ->patchJson("/api/v1/pos/transactions/{$transaction2->id}/void", [
                'void_reason' => 'Pelanggan batal',
            ])
            ->assertStatus(200);
    }

    /** GAP-RBAC-02 poin 3: Kasir bisa GET tiket, tidak bisa PATCH status */
    public function test_kasir_can_view_kds_but_cannot_patch_status(): void
    {
        $this->createTransaction();
        $ticket = OrderTicket::first();
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->getJson('/api/v1/kds/tickets')->assertStatus(200);

        $this->actingAs($kasir)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'diproses'])
            ->assertStatus(403);
    }

    /** GAP-RBAC-02 poin 4: Dapur_Barista bisa PATCH status */
    public function test_dapur_barista_can_patch_kds_status(): void
    {
        $this->createTransaction();
        $ticket = OrderTicket::first();
        $dapur = $this->createDapur();

        $this->actingAs($dapur)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'diproses'])
            ->assertStatus(200);
    }

    /** CP-02: akses lintas role ke modul Admin CMS wajib 403 untuk Kasir/Dapur */
    public function test_kasir_and_dapur_cannot_access_admin_cms(): void
    {
        $kasir = $this->createKasir();
        $this->actingAs($kasir)->getJson('/api/v1/admin/menus')->assertStatus(403);

        $dapur = $this->createDapur();
        $this->actingAs($dapur)->getJson('/api/v1/admin/menus')->assertStatus(403);
    }

    /** CP-02: hanya Owner yang bisa akses endpoint /owner/* */
    public function test_only_owner_can_access_owner_endpoints(): void
    {
        $admin = $this->createAdmin();
        $this->actingAs($admin)->getJson('/api/v1/owner/dashboard/summary')->assertStatus(403);

        $owner = $this->createOwner();
        $this->actingAs($owner)->getJson('/api/v1/owner/dashboard/summary')->assertStatus(200);
    }

    /** CP-01: role nonaktif ditolak 403 */
    public function test_inactive_role_user_is_rejected(): void
    {
        $kasir = $this->createKasir(['is_active' => false]);

        $this->actingAs($kasir)->getJson('/api/v1/pos/menus')->assertStatus(403);
    }
}
