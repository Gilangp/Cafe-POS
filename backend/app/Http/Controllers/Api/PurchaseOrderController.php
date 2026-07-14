<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with('supplier', 'items.inventoryItem');

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $pos = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json($pos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'po_number' => 'nullable|string|max:80|unique:purchase_orders,po_number',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit' => 'required|string|max:40',
            'items.*.unit_price_cents' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $poNumber = $validated['po_number'] ?? ('PO-' . strtoupper(Str::random(8)));
            $totalCents = 0;

            foreach ($validated['items'] as $item) {
                $totalCents += ($item['quantity'] * $item['unit_price_cents']);
            }

            $po = PurchaseOrder::create([
                'branch_id' => $validated['branch_id'],
                'supplier_id' => $validated['supplier_id'],
                'po_number' => $poNumber,
                'order_date' => $validated['order_date'],
                'expected_delivery_date' => $validated['expected_delivery_date'] ?? null,
                'status' => 'DRAFT',
                'total_cents' => (int) round($totalCents),
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'inventory_item_id' => $item['inventory_item_id'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'unit_price_cents' => $item['unit_price_cents'],
                    'total_price_cents' => (int) round($item['quantity'] * $item['unit_price_cents']),
                    'received_quantity' => 0,
                ]);
            }

            return response()->json($po->load('supplier', 'items.inventoryItem'), 201);
        });
    }

    public function show(PurchaseOrder $purchase_order)
    {
        return response()->json($purchase_order->load('supplier', 'items.inventoryItem'));
    }

    public function update(Request $request, PurchaseOrder $purchase_order)
    {
        $validated = $request->validate([
            'order_date' => 'nullable|date',
            'expected_delivery_date' => 'nullable|date',
            'status' => 'nullable|string|max:40',
            'notes' => 'nullable|string',
        ]);

        $purchase_order->update($validated);

        return response()->json($purchase_order->load('supplier', 'items.inventoryItem'));
    }

    /**
     * PUR & INV-006: Receive Purchase Order Items
     * Creates StockBatch records with expiration dates and calculates weighted-average unit cost
     */
    public function receive(Request $request, PurchaseOrder $purchase_order)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.received_quantity' => 'required|numeric|min:0.001',
            'items.*.batch_number' => 'nullable|string|max:80',
            'items.*.expiration_date' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request, $validated, $purchase_order) {
            $allFullyReceived = true;
            $batchesCreated = [];

            foreach ($validated['items'] as $recvItem) {
                $poItem = PurchaseOrderItem::where('purchase_order_id', $purchase_order->id)
                    ->where('id', $recvItem['purchase_order_item_id'])
                    ->firstOrFail();

                $receivedQty = (float) $recvItem['received_quantity'];
                $poItem->received_quantity += $receivedQty;
                $poItem->save();

                if ($poItem->received_quantity < $poItem->quantity) {
                    $allFullyReceived = false;
                }

                $invItem = InventoryItem::findOrFail($poItem->inventory_item_id);

                // Calculate weighted-average unit cost
                $currentQty = (float) $invItem->quantity;
                $currentCost = (float) ($invItem->unit_cost ?? 0);
                $incomingCost = ($poItem->unit_price_cents / 100);

                if (($currentQty + $receivedQty) > 0) {
                    $newWeightedAverage = (($currentQty * $currentCost) + ($receivedQty * $incomingCost)) / ($currentQty + $receivedQty);
                } else {
                    $newWeightedAverage = $incomingCost;
                }

                $invItem->quantity = $currentQty + $receivedQty;
                $invItem->unit_cost = round($newWeightedAverage, 2);
                $invItem->save();

                // Create Stock Batch for FEFO tracking (INV-006)
                $batchNumber = $recvItem['batch_number'] ?? ('BATCH-' . strtoupper(Str::random(6)));
                $batch = StockBatch::create([
                    'branch_id' => $purchase_order->branch_id,
                    'inventory_item_id' => $invItem->id,
                    'batch_number' => $batchNumber,
                    'quantity_received' => $receivedQty,
                    'quantity_remaining' => $receivedQty,
                    'received_date' => now()->toDateString(),
                    'expiration_date' => $recvItem['expiration_date'] ?? null,
                    'unit_cost_cents' => (int) $poItem->unit_price_cents,
                    'purchase_order_id' => $purchase_order->id,
                    'status' => 'ACTIVE',
                ]);
                $batchesCreated[] = $batch;

                // Record Inventory Transaction
                InventoryTransaction::create([
                    'branch_id' => $purchase_order->branch_id,
                    'inventory_item_id' => $invItem->id,
                    'type' => 'RECEIVED',
                    'quantity' => $receivedQty,
                    'unit' => $poItem->unit,
                    'unit_cost_cents' => (int) $poItem->unit_price_cents,
                    'reference_type' => 'PURCHASE_ORDER',
                    'reference_id' => $purchase_order->id,
                    'notes' => 'Received from PO ' . $purchase_order->po_number . ' (Batch ' . $batchNumber . ')',
                    'created_by' => $request->user()?->id,
                ]);
            }

            $purchase_order->status = $allFullyReceived ? 'RECEIVED' : 'PARTIAL';
            $purchase_order->save();

            return response()->json([
                'purchase_order' => $purchase_order->fresh()->load('supplier', 'items.inventoryItem'),
                'batches_created' => $batchesCreated,
            ]);
        });
    }
}
