<?php

namespace Tests\Feature;

use App\Events\KdsOrderStatusUpdated;
use App\Models\Category;
use App\Models\Menu;
use App\Models\OrderTicket;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use Tests\WithRoles;

class KdsTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    protected function createTicket(string $status = 'diterima'): OrderTicket
    {
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id]);

        $transaction = Transaction::create([
            'invoice_number' => 'INV-TEST-'.uniqid(),
            'cashier_id' => $this->createKasir()->id,
            'order_type' => 'dine_in',
            'subtotal' => 25000,
            'total' => 25000,
            'payment_method' => 'tunai',
            'status' => 'selesai',
        ]);

        return OrderTicket::create([
            'transaction_id' => $transaction->id,
            'ticket_number' => 'TKT-'.uniqid(),
            'status' => $status,
            'received_at' => now(),
        ]);
    }

    /** CP-08 */
    public function test_kds_endpoints_reject_unauthenticated_access(): void
    {
        $this->getJson('/api/v1/kds/tickets')->assertStatus(401);
    }

    /** FR-38: melihat antrian tiket + detail item */
    public function test_dapur_can_view_active_tickets(): void
    {
        $this->createTicket();
        $dapur = $this->createDapur();

        $response = $this->actingAs($dapur)->getJson('/api/v1/kds/tickets');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1);
    }

    /** GAP-RBAC-02: Kasir hanya boleh lihat, tidak boleh ubah status */
    public function test_kasir_can_view_but_cannot_change_ticket_status(): void
    {
        $ticket = $this->createTicket();
        $kasir = $this->createKasir();

        $this->actingAs($kasir)
            ->getJson('/api/v1/kds/tickets')
            ->assertStatus(200);

        $this->actingAs($kasir)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'diproses'])
            ->assertStatus(403);
    }

    /** GAP-RBAC-02: Dapur/Barista boleh ubah status */
    public function test_dapur_can_change_ticket_status(): void
    {
        Event::fake([KdsOrderStatusUpdated::class]);

        $ticket = $this->createTicket();
        $dapur = $this->createDapur();

        $response = $this->actingAs($dapur)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'diproses']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'diproses');

        $this->assertNotNull($ticket->fresh()->processed_at);
        Event::assertDispatched(KdsOrderStatusUpdated::class);
    }

    /** FR-39: alur status diterima -> diproses -> siap */
    public function test_ticket_status_flows_through_workflow(): void
    {
        $ticket = $this->createTicket();
        $dapur = $this->createDapur();

        $this->actingAs($dapur)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'diproses'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'diproses');

        $this->actingAs($dapur)
            ->patchJson("/api/v1/kds/tickets/{$ticket->id}/status", ['status' => 'siap'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'siap');

        $this->assertNotNull($ticket->fresh()->ready_at);
    }
}
