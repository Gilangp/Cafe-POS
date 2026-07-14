<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::query();

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('low_stock') && $request->boolean('low_stock')) {
            $query->whereColumn('quantity', '<=', 'reorder_point');
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        $items = $query->orderBy('name')->paginate($request->input('per_page', 20));

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:80',
            'category' => 'nullable|string|max:100',
            'unit' => 'required|string|max:40',
            'quantity' => 'required|numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'reorder_quantity' => 'nullable|numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        $item = InventoryItem::create($validated);

        return response()->json($item, 201);
    }

    public function show(InventoryItem $inventory)
    {
        return response()->json($inventory);
    }

    public function update(Request $request, InventoryItem $inventory)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'sku' => 'nullable|string|max:80',
            'category' => 'nullable|string|max:100',
            'unit' => 'string|max:40',
            'quantity' => 'numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'reorder_quantity' => 'nullable|numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        $inventory->update($validated);

        return response()->json($inventory);
    }

    public function destroy(InventoryItem $inventory)
    {
        $inventory->delete();

        return response()->json([
            'message' => 'Inventory item deleted successfully',
        ]);
    }

    /**
     * Manual stock adjustment endpoint (with FEFO support for negative adjustments)
     */
    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:ADJUSTMENT_UP,ADJUSTMENT_DOWN,DAMAGED,WASTE,RETURNED',
            'quantity' => 'required|numeric|min:0.001',
            'notes' => 'nullable|string|max:500',
            'batch_number' => 'nullable|string|max:80',
            'expiration_date' => 'nullable|date',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        $isNegative = in_array($validated['type'], ['ADJUSTMENT_DOWN', 'DAMAGED', 'WASTE']);
        $quantityChange = $isNegative ? -$validated['quantity'] : $validated['quantity'];

        // INV-006: Perform First-Expired-First-Out (FEFO) batch deduction if negative adjustment
        $batchesAffected = [];
        if ($isNegative) {
            $needed = $validated['quantity'];
            $batches = \App\Models\StockBatch::withoutBranchScope()
                ->where('inventory_item_id', $item->id)
                ->where('branch_id', $item->branch_id)
                ->where('quantity_remaining', '>', 0)
                ->where('status', 'ACTIVE')
                ->orderByRaw('expiration_date ASC NULLS LAST, id ASC')
                ->get();

            foreach ($batches as $batch) {
                if ($needed <= 0) break;
                $deduct = min($batch->quantity_remaining, $needed);
                $batch->quantity_remaining -= $deduct;
                if ($batch->quantity_remaining <= 0) {
                    $batch->status = 'DEPLETED';
                }
                $batch->save();
                $needed -= $deduct;

                $batchesAffected[] = [
                    'batch_id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'quantity_deducted' => (float) $deduct,
                    'remaining_in_batch' => (float) $batch->quantity_remaining,
                ];
            }
        } elseif ($validated['type'] === 'ADJUSTMENT_UP' && !empty($validated['batch_number'])) {
            // Create a new stock batch for positive adjustments if batch details are provided
            $batch = \App\Models\StockBatch::create([
                'branch_id' => $item->branch_id,
                'inventory_item_id' => $item->id,
                'batch_number' => $validated['batch_number'],
                'quantity_received' => $validated['quantity'],
                'quantity_remaining' => $validated['quantity'],
                'received_date' => now()->toDateString(),
                'expiration_date' => $validated['expiration_date'] ?? null,
                'unit_cost_cents' => (int) round(($item->unit_cost ?? 0) * 100),
                'status' => 'ACTIVE',
            ]);
            $batchesAffected[] = [
                'batch_id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'quantity_added' => (float) $validated['quantity'],
            ];
        }

        $item->increment('quantity', $quantityChange);

        $transaction = InventoryTransaction::create([
            'branch_id' => $item->branch_id,
            'inventory_item_id' => $item->id,
            'type' => $validated['type'],
            'quantity' => $quantityChange,
            'unit' => $item->unit,
            'unit_cost_cents' => (int) round(($item->unit_cost ?? 0) * 100),
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'transaction' => $transaction,
            'new_quantity' => (float) $item->fresh()->quantity,
            'fefo_batches_affected' => $batchesAffected,
        ]);
    }

    /**
     * INV-006: Dedicated First-Expired-First-Out (FEFO) Stock Deduction Endpoint
     * Used by POS order completion and recipe costing engine when items are sold/consumed.
     */
    public function fefoDeduct(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|numeric|min:0.001',
            'reference_type' => 'nullable|string|max:80',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);
        $needed = $validated['quantity'];

        $batches = \App\Models\StockBatch::withoutBranchScope()
            ->where('inventory_item_id', $item->id)
            ->where('branch_id', $item->branch_id)
            ->where('quantity_remaining', '>', 0)
            ->where('status', 'ACTIVE')
            ->orderByRaw('expiration_date ASC NULLS LAST, id ASC')
            ->get();

        $batchesDeducted = [];
        foreach ($batches as $batch) {
            if ($needed <= 0) break;
            $deduct = min($batch->quantity_remaining, $needed);
            $batch->quantity_remaining -= $deduct;
            if ($batch->quantity_remaining <= 0) {
                $batch->status = 'DEPLETED';
            }
            $batch->save();
            $needed -= $deduct;

            $batchesDeducted[] = [
                'batch_id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'expiration_date' => $batch->expiration_date ? $batch->expiration_date->format('Y-m-d') : null,
                'quantity_deducted' => (float) $deduct,
                'remaining_in_batch' => (float) $batch->quantity_remaining,
            ];
        }

        $item->decrement('quantity', $validated['quantity']);

        $transaction = InventoryTransaction::create([
            'branch_id' => $item->branch_id,
            'inventory_item_id' => $item->id,
            'type' => 'SOLD',
            'quantity' => -$validated['quantity'],
            'unit' => $item->unit,
            'unit_cost_cents' => (int) round(($item->unit_cost ?? 0) * 100),
            'reference_type' => $validated['reference_type'] ?? 'POS_ORDER',
            'reference_id' => $validated['reference_id'] ?? null,
            'notes' => $validated['notes'] ?? 'FEFO automated deduction',
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'FEFO deduction completed',
            'transaction_id' => $transaction->id,
            'inventory_item_id' => $item->id,
            'total_deducted' => (float) $validated['quantity'],
            'new_quantity' => (float) $item->fresh()->quantity,
            'batches_deducted' => $batchesDeducted,
        ]);
    }
}
