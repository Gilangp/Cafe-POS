<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-14: Audit log — aksi CMS/user tercatat immutable.
 * OWN-04, FR-35 dari 03/04.
 */
class AuditLogTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** CP-14: Aksi mutasi (POST) Admin tercatat di audit log */
    public function test_admin_mutation_action_is_recorded_in_audit_log(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->postJson('/api/v1/admin/categories', [
            'name' => 'Kategori Baru',
            'display_order' => 1,
        ])->assertStatus(201);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
        ]);

        $log = AuditLog::where('user_id', $admin->id)->first();
        $this->assertStringContainsString('POST', $log->action);
        $this->assertStringContainsString('categories', $log->module);
    }

    /** GET request (bukan mutasi) tidak tercatat di audit log */
    public function test_get_requests_are_not_recorded_in_audit_log(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->getJson('/api/v1/admin/categories')->assertStatus(200);

        $this->assertDatabaseCount('audit_logs', 0);
    }

    /** OWN-04: Owner bisa lihat seluruh audit log sistem */
    public function test_owner_can_view_all_audit_logs(): void
    {
        $admin = $this->createAdmin();
        $owner = $this->createOwner();

        $this->actingAs($admin)->postJson('/api/v1/admin/categories', [
            'name' => 'Kategori X',
            'display_order' => 1,
        ])->assertStatus(201);

        $response = $this->actingAs($owner)->getJson('/api/v1/owner/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }

    /** Kasir tidak bisa akses audit log admin */
    public function test_kasir_cannot_access_audit_logs(): void
    {
        $kasir = $this->createKasir();

        $this->actingAs($kasir)->getJson('/api/v1/admin/audit-logs')
            ->assertStatus(403);
    }

    /** Audit log mencatat void transaksi (aksi sensitif) */
    public function test_void_transaction_is_recorded_in_audit_log(): void
    {
        $admin = $this->createAdmin();
        $kasir = $this->createKasir();
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id]);

        $transactionResponse = $this->actingAs($kasir)->postJson('/api/v1/pos/transactions', [
            'payment_method' => 'tunai',
            'order_type' => 'dine_in',
            'items' => [['menu_id' => $menu->id, 'quantity' => 1]],
        ]);
        $transactionId = $transactionResponse->json('data.id');

        $this->actingAs($admin)->patchJson("/api/v1/pos/transactions/{$transactionId}/void", [
            'void_reason' => 'Test audit',
        ])->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
        ]);

        $log = AuditLog::where('user_id', $admin->id)->latest()->first();
        $this->assertStringContainsString('void', $log->action);
    }
}
