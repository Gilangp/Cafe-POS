<?php

namespace App\Services;

use App\Data\OrderPayload;
use App\Models\Member;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\LoyaltyTransaction;
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
            $tax = round($subtotal * 0.11, 2);
            $discount = 0;
            $pointsRedeemed = 0;

            $member = $payload->memberId ? Member::find($payload->memberId) : null;
            if (!$member && $payload->userId) {
                $member = Member::where('user_id', $payload->userId)->first();
            }

            if ($member && $payload->pointsToRedeem > 0) {
                $pointsRedeemed = min($member->points_balance, $payload->pointsToRedeem);
                $discount = min($subtotal + $tax, $pointsRedeemed * 100); // 1 point = Rp 100
                if ($pointsRedeemed > 0) {
                    $member->decrement('points_balance', $pointsRedeemed);
                    LoyaltyTransaction::create([
                        'member_id' => $member->id,
                        'type' => 'REDEEM',
                        'points' => -$pointsRedeemed,
                        'description' => 'Points redeemed on order creation',
                        'expires_at' => null,
                    ]);
                }
            }

            $total = max(0, $subtotal + $tax - $discount);

            $order = Order::create([
                'order_number' => 'ORD-'.Str::upper(Str::random(8)),
                'branch_id' => $payload->branchId,
                'user_id' => $payload->userId,
                'member_id' => $member?->id,
                'customer_name' => $member?->full_name ?? ($payload->userId ? 'User #'.$payload->userId : 'Guest'),
                'order_type' => $payload->orderType,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $payload->paymentMethod,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'notes' => $payload->notes,
                'table_number' => $payload->tableNumber,
                'idempotency_key' => $payload->idempotencyKey,
                'kitchen_status' => $payload->kitchenStatus ?? 'PENDING',
                'points_redeemed' => $pointsRedeemed,
                'points_earned' => 0,
                'completed_at' => null,
            ]);

            if ($pointsRedeemed > 0 && $member) {
                LoyaltyTransaction::where('member_id', $member->id)
                    ->where('type', 'REDEEM')
                    ->whereNull('order_id')
                    ->latest()
                    ->first()
                    ?->update(['order_id' => $order->id]);
            }

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

            // KDS-005: Trigger real-time broadcasting event for KDS displays
            try {
                event(new \App\Events\KdsOrderCreated($order->load('items.product')));
            } catch (\Exception $e) {
                // Ignore broadcasting exceptions during offline/unit testing
            }

            return $order;
        });
    }

    public function awardLoyaltyPoints(Order $order): void
    {
        if ($order->points_earned > 0 || $order->status !== 'completed') {
            return;
        }

        $member = $order->member_id ? Member::find($order->member_id) : null;
        if (!$member && $order->user_id) {
            $member = Member::where('user_id', $order->user_id)->first();
        }

        if (!$member) {
            return;
        }

        $multiplier = $member->tier?->points_multiplier ?? 1.0;
        $earned = (int) floor(($order->total / 1000) * $multiplier);

        if ($earned > 0) {
            DB::transaction(function () use ($member, $order, $earned) {
                $member->increment('points_balance', $earned);
                $member->increment('lifetime_spend_cents', (int) ($order->total * 100));

                LoyaltyTransaction::create([
                    'member_id' => $member->id,
                    'order_id' => $order->id,
                    'type' => 'EARN',
                    'points' => $earned,
                    'description' => "Points earned from order {$order->order_number}",
                    'expires_at' => now()->addYear(),
                ]);

                $order->update(['points_earned' => $earned, 'member_id' => $member->id]);
            });
        }
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