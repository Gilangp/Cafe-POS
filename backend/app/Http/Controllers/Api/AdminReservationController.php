<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
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

    public function show(Reservation $reservation): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail reservasi.', 'data' => $reservation->load('table'), 'meta' => null]);
    }

    public function updateStatus(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:menunggu,dikonfirmasi,ditolak,selesai,batal',
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

        return response()->json(['success' => true, 'message' => "Status reservasi diperbarui menjadi {$reservation->status}.", 'data' => $reservation->load('table'), 'meta' => null]);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();
        return response()->json(['success' => true, 'message' => 'Reservasi berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
