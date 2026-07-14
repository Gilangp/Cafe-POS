<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RBACBranchScopeTest extends TestCase
{
    use RefreshDatabase;

    protected Branch $branchA;
    protected Branch $branchB;
    protected User $cashierBranchA;
    protected User $branchManagerBranchA;
    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branchA = Branch::factory()->create(['name' => 'Branch A SCBD']);
        $this->branchB = Branch::factory()->create(['name' => 'Branch B Senopati']);

        $this->superAdmin = User::factory()->create([
            'role' => 'super_admin',
            'branch_id' => null,
        ]);

        $this->cashierBranchA = User::factory()->create([
            'role' => 'cashier',
            'branch_id' => $this->branchA->id,
        ]);

        $this->branchManagerBranchA = User::factory()->create([
            'role' => 'branch_manager',
            'branch_id' => $this->branchA->id,
        ]);

        // Register dummy routes to test middleware in isolation
        Route::middleware(['auth:sanctum', 'permission:orders.create'])->post('/test-permission-check', function () {
            return response()->json(['success' => true]);
        });

        Route::middleware(['auth:sanctum', 'branch.scope'])->post('/test-branch-scope-check', function () {
            return response()->json(['success' => true, 'branch_id' => request()->input('branch_id')]);
        });
    }

    public function test_super_admin_bypasses_permission_check(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/test-permission-check', []);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_without_permission_is_rejected_with_403(): void
    {
        // Customer role doesn't have orders.create on admin routes by default unless assigned via roles
        $customer = User::factory()->create([
            'role' => 'guest',
        ]);

        $response = $this->actingAs($customer)
            ->postJson('/test-permission-check', []);

        $response->assertStatus(403)
            ->assertJsonStructure([
                'error' => ['code', 'message', 'status_code'],
            ]);
    }

    public function test_user_can_access_own_branch(): void
    {
        $response = $this->actingAs($this->cashierBranchA)
            ->postJson('/test-branch-scope-check', [
                'branch_id' => $this->branchA->id,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_user_cannot_access_unauthorized_branch_via_payload(): void
    {
        $response = $this->actingAs($this->cashierBranchA)
            ->postJson('/test-branch-scope-check', [
                'branch_id' => $this->branchB->id,
            ]);

        $response->assertStatus(403)
            ->assertJsonFragment([
                'code' => 'SCOPE_VIOLATION',
            ]);
    }

    public function test_user_cannot_access_unauthorized_branch_via_header(): void
    {
        $response = $this->actingAs($this->cashierBranchA)
            ->withHeaders(['X-Branch-Id' => $this->branchB->id])
            ->postJson('/test-branch-scope-check', []);

        $response->assertStatus(403)
            ->assertJsonFragment([
                'code' => 'SCOPE_VIOLATION',
            ]);
    }

    public function test_super_admin_can_access_any_branch(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->withHeaders(['X-Branch-Id' => $this->branchB->id])
            ->postJson('/test-branch-scope-check', [
                'branch_id' => $this->branchB->id,
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_global_branch_scope_filters_eloquent_queries(): void
    {
        app()->instance('test_running_branch_scope', true);

        \App\Models\Order::create([
            'order_number' => 'ORD-A-101',
            'branch_id' => $this->branchA->id,
            'user_id' => $this->cashierBranchA->id,
            'customer_name' => 'John A',
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 50000,
            'total' => 50000,
        ]);

        \App\Models\Order::create([
            'order_number' => 'ORD-B-102',
            'branch_id' => $this->branchB->id,
            'user_id' => $this->cashierBranchA->id,
            'customer_name' => 'Jane B',
            'order_type' => 'dine_in',
            'status' => 'completed',
            'subtotal' => 70000,
            'total' => 70000,
        ]);

        $this->actingAs($this->cashierBranchA);
        $ordersCashierA = \App\Models\Order::all();
        $this->assertCount(1, $ordersCashierA);
        $this->assertEquals('ORD-A-101', $ordersCashierA->first()->order_number);

        $this->actingAs($this->superAdmin);
        $ordersSuperAdmin = \App\Models\Order::all();
        $this->assertCount(2, $ordersSuperAdmin);
    }
}
