<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'items.inventoryItem'])->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $perPage = $request->get('per_page', 50);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        \Log::info('PO Create Request: ', $request->all());

        try {
            $request->validate([
                'supplier_id' => 'required',
                'order_date' => 'required|date',
                'items' => 'required|array',
                'items.*.inventory_item_id' => 'required',
                'items.*.quantity' => 'required|numeric|min:0.01',
                'items.*.conversion_multiplier' => 'nullable|numeric|min:1',
                'items.*.unit_price_cents' => 'required|integer|min:0',
            ]);
        } catch (ValidationException $e) {
            \Log::error('PO Validation Error: ', $e->errors());
            throw $e;
        }

        DB::beginTransaction();
        try {
            // Generate PO Number
            $latestPo = PurchaseOrder::whereDate('created_at', today())->count();
            $poNumber = 'PO-'.now()->format('Ymd').'-'.str_pad($latestPo + 1, 3, '0', STR_PAD_LEFT);

            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $request->supplier_id,
                'branch_id' => $request->branch_id,
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'status' => $request->status ?? 'ORDERED',
                'total_cents' => collect($request->items)->sum(fn ($i) => $i['quantity'] * $i['unit_price_cents']),
            ]);

            foreach ($request->items as $item) {
                $inventory = Inventory::find($item['inventory_item_id']);
                $po->items()->create([
                    'inventory_item_id' => $item['inventory_item_id'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? $inventory->unit,
                    'conversion_multiplier' => $item['conversion_multiplier'] ?? 1,
                    'unit_price_cents' => $item['unit_price_cents'],
                    'total_price_cents' => $item['quantity'] * $item['unit_price_cents'],
                ]);
            }

            DB::commit();

            return response()->json($po->load('items.inventoryItem', 'supplier'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Gagal membuat PO', 'message' => $e->getMessage()], 500);
        }
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.received_quantity' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            $user = auth()->user() ?? User::first();

            foreach ($request->items as $receivedItem) {
                $poItem = $purchaseOrder->items()->find($receivedItem['purchase_order_item_id']);
                if (! $poItem) {
                    continue;
                }

                $qty = $receivedItem['received_quantity'];

                // Update PO Item received quantity
                $poItem->increment('received_quantity', $qty);

                // Add to inventory with conversion
                $inventory = $poItem->inventoryItem;
                $convertedQty = $qty * ($poItem->conversion_multiplier ?? 1);
                $inventory->increment('stock_quantity', $convertedQty);

                // Create Inventory Log
                InventoryLog::create([
                    'inventory_id' => $inventory->id,
                    'type' => 'masuk',
                    'quantity' => $convertedQty,
                    'reference_type' => 'purchase_order',
                    'reference_id' => $purchaseOrder->id,
                    'user_id' => $user->id,
                ]);
            }

            // Check if PO is fully received
            $purchaseOrder->load('items');
            $allReceived = true;
            foreach ($purchaseOrder->items as $item) {
                if ((float) $item->received_quantity < (float) $item->quantity) {
                    $allReceived = false;
                    break;
                }
            }

            $purchaseOrder->update([
                'status' => $allReceived ? 'RECEIVED' : 'PARTIAL',
            ]);

            DB::commit();

            return response()->json($purchaseOrder->load('items.inventoryItem', 'supplier'));
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['error' => 'Gagal menerima PO', 'message' => $e->getMessage()], 500);
        }
    }

    public function cancel(Request $request, PurchaseOrder $purchaseOrder)
    {
        if (! in_array($purchaseOrder->status, ['DRAFT', 'ORDERED'])) {
            return response()->json(['error' => 'Hanya PO berstatus DRAFT atau ORDERED yang dapat dibatalkan.'], 400);
        }

        $purchaseOrder->update([
            'status' => 'CANCELLED',
        ]);

        return response()->json($purchaseOrder->load('items.inventoryItem', 'supplier'));
    }
}
