<?php

namespace App\Services;

use App\Exceptions\Api\ApiException;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\OrderItem;
use App\Models\Recipe;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function deductStockForOrderItem(OrderItem $orderItem, ?int $userId = null): void
    {
        $product = $orderItem->product;
        if (!$product || !$product->recipe_id) {
            return;
        }

        $recipe = Recipe::with('ingredients.inventoryItem')->find($product->recipe_id);
        if (!$recipe) {
            return;
        }

        foreach ($recipe->ingredients as $ingredient) {
            $inventoryItem = $ingredient->inventoryItem;
            if (!$inventoryItem) {
                continue;
            }
            
            $deductQuantity = $ingredient->quantity * $orderItem->quantity;

            DB::transaction(function () use ($inventoryItem, $deductQuantity, $orderItem, $userId) {
                $item = InventoryItem::where('id', $inventoryItem->id)->lockForUpdate()->first();

                if ($item->quantity < $deductQuantity) {
                    throw new ApiException(
                        message: "Insufficient stock for {$item->name}",
                        statusCode: 409,
                        errorCode: 'INSUFFICIENT_STOCK',
                        details: ['item_id' => $item->id, 'needed' => $deductQuantity, 'available' => $item->quantity]
                    );
                }

                // INV-006: First-Expired-First-Out (FEFO) Batch Deduction
                $needed = $deductQuantity;
                $batches = \App\Models\StockBatch::withoutBranchScope()
                    ->where('inventory_item_id', $item->id)
                    ->where('branch_id', $orderItem->order->branch_id)
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
                }

                $item->decrement('quantity', $deductQuantity);

                InventoryTransaction::create([
                    'branch_id' => $orderItem->order->branch_id,
                    'inventory_item_id' => $item->id,
                    'type' => 'SOLD',
                    'quantity' => -$deductQuantity,
                    'unit' => $item->unit,
                    'unit_cost_cents' => (int) round(((float) $item->unit_cost) * 100),
                    'reference_type' => 'App\Models\Order',
                    'reference_id' => $orderItem->order_id,
                    'notes' => "Sale via Order #{$orderItem->order->order_number}",
                    'created_by' => $userId,
                ]);
            });
        }
    }
}