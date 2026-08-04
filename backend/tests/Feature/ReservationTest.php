<?php

namespace Tests\Feature;

use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\WithRoles;

/**
 * CP-07: Reservasi publik — submit tanpa login, cek status, admin ubah status.
 * PUB-03, PUB-04, PUB-05, ADM-02 dari 08 §7.
 */
class ReservationTest extends TestCase
{
    use RefreshDatabase, WithRoles;

    /** PUB-03: submit reservasi valid tanpa login → 201 + kode reservasi */
    public function test_public_can_submit_reservation_without_login(): void
    {
        $response = $this->postJson('/api/v1/reservations', [
            'name' => 'Budi Santoso',
            'phone' => '08123456789',
            'reservation_date' => now()->addDay()->format('Y-m-d'),
            'reservation_time' => '19:00',
            'guest_count' => 4,
            'purpose' => 'Ulang Tahun',
            'notes' => 'Tolong siapkan kue',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_name', 'Budi Santoso')
            ->assertJsonPath('data.status', 'menunggu_konfirmasi');

        $this->assertNotNull($response->json('data.reservation_code'));
        $this->assertDatabaseHas('reservations', [
            'customer_phone' => '08123456789',
            'status' => 'menunggu_konfirmasi',
        ]);
    }

    /** PUB-04: field wajib kosong → 422 */
    public function test_reservation_validation_rejects_missing_required_fields(): void
    {
        $this->postJson('/api/v1/reservations', [])->assertStatus(422);

        $this->postJson('/api/v1/reservations', [
            'name' => 'Test',
            'phone' => '08123456789',
            'reservation_date' => now()->subDay()->format('Y-m-d'), // tanggal lampau
            'reservation_time' => '19:00',
            'guest_count' => 2,
        ])->assertStatus(422);
    }

    /** PUB-05: cek status reservasi via kode + nomor HP */
    public function test_public_can_check_reservation_status_by_code_and_phone(): void
    {
        $reservation = Reservation::create([
            'reservation_code' => 'NEMU-ABCDE',
            'customer_name' => 'Siti Rahayu',
            'customer_phone' => '08987654321',
            'reservation_date' => now()->addDays(3)->format('Y-m-d'),
            'reservation_time' => '18:00',
            'party_size' => 2,
            'status' => 'dikonfirmasi',
        ]);

        $response = $this->getJson('/api/v1/reservations/check?phone=08987654321&code=NEMU-ABCDE');

        $response->assertStatus(200)
            ->assertJsonPath('data.reservation_code', 'NEMU-ABCDE')
            ->assertJsonPath('data.status', 'dikonfirmasi');
    }

    /** PUB-05 negatif: kode salah → 404 */
    public function test_check_reservation_returns_404_for_wrong_code(): void
    {
        $this->getJson('/api/v1/reservations/check?phone=08123456789&code=NEMU-WRONG')
            ->assertStatus(404);
    }

    /** ADM-02: Admin ubah status reservasi → pelanggan bisa lihat update */
    public function test_admin_can_update_reservation_status(): void
    {
        $admin = $this->createAdmin();

        $reservation = Reservation::create([
            'reservation_code' => 'NEMU-ZZZZZ',
            'customer_name' => 'Pelanggan Test',
            'customer_phone' => '08111222333',
            'reservation_date' => now()->addDays(2)->format('Y-m-d'),
            'reservation_time' => '20:00',
            'party_size' => 3,
            'status' => 'menunggu_konfirmasi',
        ]);

        $response = $this->actingAs($admin)
            ->patchJson("/api/v1/admin/reservations/{$reservation->id}/status", [
                'status' => 'dikonfirmasi',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'dikonfirmasi');

        $this->assertEquals('dikonfirmasi', $reservation->fresh()->status);
    }

    /** ADM-02: Admin tolak reservasi */
    public function test_admin_can_reject_reservation(): void
    {
        $admin = $this->createAdmin();

        $reservation = Reservation::create([
            'reservation_code' => 'NEMU-YYYYY',
            'customer_name' => 'Pelanggan Ditolak',
            'customer_phone' => '08444555666',
            'reservation_date' => now()->addDays(1)->format('Y-m-d'),
            'reservation_time' => '12:00',
            'party_size' => 10,
            'status' => 'menunggu_konfirmasi',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/reservations/{$reservation->id}/status", [
                'status' => 'ditolak',
                'notes' => 'Kapasitas penuh',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'ditolak');
    }

    /** Kasir tidak bisa ubah status reservasi via admin endpoint */
    public function test_kasir_cannot_update_reservation_status(): void
    {
        $kasir = $this->createKasir();

        $reservation = Reservation::create([
            'reservation_code' => 'NEMU-XXXXX',
            'customer_name' => 'Test',
            'customer_phone' => '08777888999',
            'reservation_date' => now()->addDays(1)->format('Y-m-d'),
            'reservation_time' => '15:00',
            'party_size' => 2,
            'status' => 'menunggu_konfirmasi',
        ]);

        $this->actingAs($kasir)
            ->patchJson("/api/v1/admin/reservations/{$reservation->id}/status", [
                'status' => 'dikonfirmasi',
            ])
            ->assertStatus(403);
    }
}
