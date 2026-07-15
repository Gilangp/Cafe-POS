<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderTicket;
use App\Models\OrderTicketItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KdsController extends Controller
{
    /**
     * Get active kitchen ticket queue (FIFO order: received_at ASC).
     * Filters tickets with status: 'diterima', 'diproses', 'siap'.
     */
    public function activeTickets(Request $request): JsonResponse
    {
        $query = OrderTicket::with(['items', 'transaction:id,invoice_number,payment_method,created_at'])
            ->whereIn('status', ['diterima', 'diproses', 'siap'])
            ->orderBy('received_at', 'asc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->get()->map(function ($ticket) {
            $ticket->elapsed_minutes = $ticket->received_at ? now()->diffInMinutes($ticket->received_at) : 0;
            return $ticket;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar antrian tiket dapur (KDS).',
            'data' => $tickets,
            'meta' => [
                'total' => $tickets->count(),
                'pending_count' => $tickets->where('status', 'diterima')->count(),
                'processing_count' => $tickets->where('status', 'diproses')->count(),
                'ready_count' => $tickets->where('status', 'siap')->count(),
            ],
        ]);
    }

    /**
     * Get single kitchen ticket details.
     */
    public function show(string $id): JsonResponse
    {
        $ticket = OrderTicket::with(['items', 'transaction', 'assignedUser:id,name'])->findOrFail($id);
        $ticket->elapsed_minutes = $ticket->received_at ? now()->diffInMinutes($ticket->received_at) : 0;

        return response()->json([
            'success' => true,
            'message' => 'Detail tiket dapur.',
            'data' => $ticket,
            'meta' => null,
        ]);
    }

    /**
     * Update overall ticket status (diterima -> diproses -> siap -> disajikan -> dibatalkan).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:diterima,diproses,siap,disajikan,dibatalkan',
        ]);

        $ticket = OrderTicket::with('items')->findOrFail($id);

        return DB::transaction(function () use ($ticket, $validated, $request) {
            $newStatus = $validated['status'];
            $ticket->status = $newStatus;

            if ($newStatus === 'diproses') {
                $ticket->processed_at = $ticket->processed_at ?? now();
                $ticket->assigned_to = $ticket->assigned_to ?? $request->user()?->id;
                // Update item statuses to 'diproses' if currently 'menunggu'
                $ticket->items()->where('item_status', 'menunggu')->update(['item_status' => 'diproses']);
            } elseif ($newStatus === 'siap') {
                $ticket->ready_at = $ticket->ready_at ?? now();
                // Update item statuses to 'selesai'
                $ticket->items()->update(['item_status' => 'selesai']);
            } elseif ($newStatus === 'disajikan') {
                $ticket->served_at = $ticket->served_at ?? now();
                $ticket->items()->update(['item_status' => 'selesai']);
            }

            $ticket->save();

            return response()->json([
                'success' => true,
                'message' => "Status tiket berhasil diperbarui menjadi {$newStatus}.",
                'data' => $ticket->load(['items', 'transaction:id,invoice_number']),
                'meta' => null,
            ]);
        });
    }

    /**
     * Update specific item status within a kitchen ticket.
     */
    public function updateItemStatus(Request $request, string $ticketId, string $itemId): JsonResponse
    {
        $validated = $request->validate([
            'item_status' => 'required|in:menunggu,diproses,selesai,dibatalkan',
        ]);

        $item = OrderTicketItem::where('order_ticket_id', $ticketId)->findOrFail($itemId);
        $item->item_status = $validated['item_status'];
        $item->save();

        // Check if all items in the ticket are finished ('selesai'), auto-advance ticket status to 'siap'
        $ticket = OrderTicket::with('items')->findOrFail($ticketId);
        $allFinished = $ticket->items->every(fn($i) => in_array($i->item_status, ['selesai', 'dibatalkan']));

        if ($allFinished && in_array($ticket->status, ['diterima', 'diproses'])) {
            $ticket->status = 'siap';
            $ticket->ready_at = $ticket->ready_at ?? now();
            $ticket->save();
        } elseif ($ticket->status === 'diterima' && $validated['item_status'] === 'diproses') {
            $ticket->status = 'diproses';
            $ticket->processed_at = $ticket->processed_at ?? now();
            $ticket->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Status item tiket dapur berhasil diperbarui.',
            'data' => $ticket->load('items'),
            'meta' => null,
        ]);
    }
}
