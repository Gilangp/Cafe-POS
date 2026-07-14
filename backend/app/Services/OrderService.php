<?php

namespace App\Services;

use App\Data\OrderPayload;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected readonly InventoryService $inventoryService
    ) {
    }

    public function createOrder(OrderPayload $payload): Order
    {
        return DB::transaction(function () use ($payload) {
            $subtotal = $this->calculateSubtotal($payload->items);
            $total = $subtotal; // Simplified for now

            $order = Order::create([
                'order_number' => 'ORD-'.Str::upper(Str::random(8)),
                'branch_id' => $payload->branchId,
                'user_id' => $payload->userId,
                'customer_name' => $payload->userId ? 'User #'.$payload->userId : 'Guest',
                'order_type' => $payload->orderType,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $payload->paymentMethod,
                'subtotal' => $subtotal,
                'tax' => 0,
                'discount' => 0,
                'total' => $total,
                'notes' => $payload->notes,
                'completed_at' => null,
            ]);

            foreach ($payload->items as $item) {
                $product = Product::find($item['product_id']);

                $orderItem = $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->base_price,
                    'subtotal' => $product->base_price * $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);

                $this->inventoryService->deductStockForOrderItem($orderItem, $payload->userId);
            }

            return $order;
        });
    }

    protected function calculateSubtotal(iterable $items): float
    {
        $subtotal = 0;
        $productIds = collect($items)->pluck('product_id')->unique();
        $products = Product::whereIn('id', $productIds)->pluck('base_price', 'id');

        foreach ($items as $item) {
            $subtotal += $products[$item['product_id']] * $item['quantity'];
        }

        return $subtotal;
    }
}