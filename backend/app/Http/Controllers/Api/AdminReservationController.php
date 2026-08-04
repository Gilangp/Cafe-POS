<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with('table');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->whereDate('reservation_date', $request->date);
        }

        $reservations = $query->latest()->get();

        return response()->json(['success' => true, 'message' => 'Daftar reservasi admin.', 'data' => $reservations, 'meta' => ['total' => $reservations->count()]]);
    }

    public function tables(): JsonResponse
    {
        $tables = Table::orderBy('table_number')->get();

        return response()->json(['success' => true, 'data' => $tables]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:20',
            'reservation_date' => 'required|date',
            'reservation_time' => 'required|date_format:H:i',
            'party_size' => 'required|integer|min:1',
            'purpose' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'table_id' => 'nullable|uuid|exists:tables,id',
        ]);

        $validated['status'] = 'dikonfirmasi'; // Admin/Kasir bypasses menunggu_konfirmasi

        $reservation = Reservation::create($validated);

        if (! empty($validated['table_id'])) {
            $table = Table::find($validated['table_id']);
            if ($table) {
                $table->status = 'reservasi';
                $table->save();
            }
        }

        return response()->json(['success' => true, 'message' => 'Reservasi berhasil ditambahkan.', 'data' => $reservation->load('table'), 'meta' => null], 201);
    }

    public function show(Reservation $reservation): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail reservasi.', 'data' => $reservation->load('table'), 'meta' => null]);
    }

    public function updateStatus(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:menunggu_konfirmasi,dikonfirmasi,check_in,ditolak,selesai,dibatalkan',
            'table_id' => 'nullable|uuid|exists:tables,id',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['table_id'])) {
            $reservation->table_id = $validated['table_id'];
        }
        if (array_key_exists('notes', $validated)) {
            $reservation->notes = $validated['notes'];
        }

        $reservation->status = $validated['status'];
        $reservation->save();

        // Sync table status
        if ($reservation->table_id) {
            $table = Table::find($reservation->table_id);
            if ($table) {
                if ($reservation->status === 'dikonfirmasi') {
                    $table->status = 'reservasi';
                } elseif ($reservation->status === 'check_in') {
                    $table->status = 'terisi';
                } elseif (in_array($reservation->status, ['selesai', 'dibatalkan', 'ditolak'])) {
                    $table->status = 'tersedia';
                }
                $table->save();
            }
        }

        return response()->json(['success' => true, 'message' => "Status reservasi diperbarui menjadi {$reservation->status}.", 'data' => $reservation->load('table'), 'meta' => null]);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();

        return response()->json(['success' => true, 'message' => 'Reservasi berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
