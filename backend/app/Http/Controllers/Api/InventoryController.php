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
     * Manual stock adjustment endpoint
     */
    public function adjust(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:ADJUSTMENT_UP,ADJUSTMENT_DOWN,DAMAGED,WASTE,RETURNED',
            'quantity' => 'required|numeric|min:0.001',
            'notes' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        $quantityChange = in_array($validated['type'], ['ADJUSTMENT_DOWN', 'DAMAGED', 'WASTE'])
            ? -$validated['quantity']
            : $validated['quantity'];

        $item->increment('quantity', $quantityChange);

        $transaction = InventoryTransaction::create([
            'branch_id' => $item->branch_id,
            'inventory_item_id' => $item->id,
            'type' => $validated['type'],
            'quantity' => $quantityChange,
            'unit' => $item->unit,
            'unit_cost_cents' => 0,
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'transaction' => $transaction,
            'new_quantity' => $item->fresh()->quantity,
        ]);
    }
}
