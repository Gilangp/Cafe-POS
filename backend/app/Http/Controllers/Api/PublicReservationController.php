<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicReservationController extends Controller
{
    /**
     * Submit a new public reservation with thorough validation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_id' => 'nullable|uuid|exists:tables,id',
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:25',
            'reservation_date' => 'required|date|after_or_equal:today',
            'reservation_time' => 'required|string|max:10',
            'guest_count' => 'required|integer|min:1|max:50',
            'purpose' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Auto-assign table if not provided or check table capacity/availability
        $tableId = $validated['table_id'] ?? null;
        if (!$tableId) {
            $table = Table::where('status', 'tersedia')
                ->where('capacity', '>=', $validated['guest_count'])
                ->orderBy('capacity', 'asc')
                ->first();

            if ($table) {
                $tableId = $table->id;
            }
        }

        $reservation = Reservation::create([
            'table_id' => $tableId,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'reservation_date' => $validated['reservation_date'],
            'reservation_time' => $validated['reservation_time'],
            'guest_count' => $validated['guest_count'],
            'purpose' => $validated['purpose'] ?? 'Santai / Berkumpul',
            'notes' => $validated['notes'] ?? null,
            'status' => 'menunggu',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservasi berhasil dikirim. Tim kami akan segera meninjau dan menghubungi Anda.',
            'data' => $reservation->load('table'),
            'meta' => null,
        ], 201);
    }

    /**
     * Check reservation status by Phone Number and Date.
     */
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'date' => 'required|date',
        ]);

        $reservations = Reservation::with('table')
            ->where('phone', $request->phone)
            ->whereDate('reservation_date', $request->date)
            ->latest()
            ->get();

        if ($reservations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ditemukan reservasi dengan nomor HP dan tanggal tersebut.',
                'data' => [],
                'meta' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status reservasi ditemukan.',
            'data' => $reservations,
            'meta' => [
                'total' => $reservations->count(),
            ],
        ]);
    }
}
