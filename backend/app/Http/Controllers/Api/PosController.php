<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Menu;
use App\Models\OrderTicket;
use App\Models\OrderTicketItem;
use App\Models\Reservation;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    /**
     * Get active menus for POS cashier interface along with categories & promotions.
     */
    public function menus(): JsonResponse
    {
        $menus = Menu::with(['category', 'promotions' => function ($q) {
            $q->where('status', 'aktif');
        }, 'menuIngredients.inventory'])
            ->where('status', 'tersedia')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu POS aktif.',
            'data' => $menus,
            'meta' => ['total' => $menus->count()],
        ]);
    }

    /**
     * Get today's table reservations for cashier reference.
     */
    public function todayReservations(): JsonResponse
    {
        $reservations = Reservation::with('table')
            ->whereDate('reservation_date', now()->toDateString())
            ->orderBy('reservation_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar reservasi hari ini.',
            'data' => $reservations,
            'meta' => ['total' => $reservations->count()],
        ]);
    }

    /**
     * List POS transactions with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['cashier:id,name', 'orderTicket']);

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        } else {
            // Default to today or latest if no filter provided
            $query->latest();
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat transaksi POS.',
            'data' => $transactions,
            'meta' => ['total' => $transactions->count()],
        ]);
    }

    /**
     * Get single POS transaction details.
     */
    public function show(string $id): JsonResponse
    {
        $transaction = Transaction::with(['cashier:id,name', 'items', 'orderTicket.items'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi POS.',
            'data' => $transaction,
            'meta' => null,
        ]);
    }

    /**
     * Create a new POS transaction: auto-calculate totals, auto-deduct raw inventory, generate kitchen ticket.
     */
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:tunai,qris,debit,kredit',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|uuid|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.note' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $itemsData = [];

            // Pre-fetch all requested menus
            $menuIds = collect($validated['items'])->pluck('menu_id')->unique();
            $menus = Menu::with('menuIngredients')->whereIn('id', $menuIds)->get()->keyBy('id');

            foreach ($validated['items'] as $itemRequest) {
                $menu = $menus[$itemRequest['menu_id']] ?? null;
                if (!$menu) continue;

                $itemSubtotal = (float)$menu->price * (int)$itemRequest['quantity'];
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'menu' => $menu,
                    'quantity' => (int)$itemRequest['quantity'],
                    'note' => $itemRequest['note'] ?? null,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = (float)($validated['discount'] ?? 0);
            $total = max(0, $subtotal - $discount);
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'cashier_id' => $request->user()?->id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => 'selesai',
            ]);

            $ticket = OrderTicket::create([
                'transaction_id' => $transaction->id,
                'ticket_number' => 'TKT-' . date('His') . '-' . strtoupper(substr(uniqid(), -3)),
                'status' => 'diterima',
                'received_at' => now(),
            ]);

            foreach ($itemsData as $data) {
                $menu = $data['menu'];
                $qty = $data['quantity'];

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'menu_id' => $menu->id,
                    'menu_name_snapshot' => $menu->name,
                    'price_snapshot' => $menu->price,
                    'quantity' => $qty,
                    'note' => $data['note'],
                    'subtotal' => $data['subtotal'],
                ]);

                OrderTicketItem::create([
                    'order_ticket_id' => $ticket->id,
                    'menu_name_snapshot' => $menu->name,
                    'quantity' => $qty,
                    'note' => $data['note'],
                    'item_status' => 'menunggu',
                ]);

                // Auto-deduct raw material inventory based on menu ingredients
                foreach ($menu->menuIngredients as $ingredient) {
                    $deductAmount = (float)$ingredient->quantity_used * $qty;
                    $invItem = Inventory::find($ingredient->inventory_id);

                    if ($invItem && $deductAmount > 0) {
                        $invItem->stock_quantity -= $deductAmount;
                        $invItem->save();

                        InventoryLog::create([
                            'inventory_id' => $invItem->id,
                            'type' => 'stock_out',
                            'quantity' => $deductAmount,
                            'reference_type' => Transaction::class,
                            'reference_id' => $transaction->id,
                            'user_id' => $request->user()?->id,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi POS berhasil diproses dan tiket dapur telah diterbitkan.',
                'data' => $transaction->load(['items', 'orderTicket.items']),
                'meta' => null,
            ], 201);
        });
    }

    /**
     * Void a transaction: require reason, update status, cancel kitchen ticket, and restore raw material inventory.
     */
    public function voidOrder(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'void_reason' => 'required|string|max:255',
        ]);

        $transaction = Transaction::with(['items', 'orderTicket'])->findOrFail($id);

        if ($transaction->status === 'dibatalkan') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi ini sudah dibatalkan sebelumnya.',
                'data' => null,
                'meta' => null,
            ], 400);
        }

        return DB::transaction(function () use ($transaction, $validated, $request) {
            $transaction->status = 'dibatalkan';
            $transaction->void_reason = $validated['void_reason'];
            $transaction->save();

            if ($transaction->orderTicket && $transaction->orderTicket->status !== 'disajikan') {
                $transaction->orderTicket->status = 'dibatalkan';
                $transaction->orderTicket->save();
            }

            // Restore inventory stock that was deducted during the sale
            $menuIds = $transaction->items->pluck('menu_id')->filter()->unique();
            $menus = Menu::with('menuIngredients')->whereIn('id', $menuIds)->get()->keyBy('id');

            foreach ($transaction->items as $item) {
                $menu = $menus[$item->menu_id] ?? null;
                if (!$menu) continue;

                foreach ($menu->menuIngredients as $ingredient) {
                    $restoreAmount = (float)$ingredient->quantity_used * (int)$item->quantity;
                    $invItem = Inventory::find($ingredient->inventory_id);

                    if ($invItem && $restoreAmount > 0) {
                        $invItem->stock_quantity += $restoreAmount;
                        $invItem->save();

                        InventoryLog::create([
                            'inventory_id' => $invItem->id,
                            'type' => 'stock_in',
                            'quantity' => $restoreAmount,
                            'reference_type' => Transaction::class,
                            'reference_id' => $transaction->id,
                            'user_id' => $request->user()?->id,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil di-void dan stok bahan baku telah dipulihkan.',
                'data' => $transaction->load(['items', 'orderTicket']),
                'meta' => null,
            ]);
        });
    }

    /**
     * Get summary of POS sales per shift/today.
     */
    public function summary(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());
        $transactions = Transaction::whereDate('created_at', $date)->get();

        $completedTransactions = $transactions->where('status', 'selesai');
        $cancelledTransactions = $transactions->where('status', 'dibatalkan');

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan penjualan POS.',
            'data' => [
                'date' => $date,
                'total_transactions' => $completedTransactions->count(),
                'total_revenue' => $completedTransactions->sum('total'),
                'payment_methods' => [
                    'tunai' => $completedTransactions->where('payment_method', 'tunai')->sum('total'),
                    'qris' => $completedTransactions->where('payment_method', 'qris')->sum('total'),
                    'debit' => $completedTransactions->where('payment_method', 'debit')->sum('total'),
                    'kredit' => $completedTransactions->where('payment_method', 'kredit')->sum('total'),
                ],
                'cancelled_transactions_count' => $cancelledTransactions->count(),
            ],
            'meta' => null,
        ]);
    }
}
