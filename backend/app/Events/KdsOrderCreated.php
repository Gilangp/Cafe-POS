<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('branch.' . $this->order->branch_id . '.kitchen'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'kds.order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'branch_id' => $this->order->branch_id,
            'customer_name' => $this->order->customer_name,
            'table_number' => $this->order->table_number,
            'order_type' => $this->order->order_type,
            'status' => $this->order->status,
            'kitchen_status' => $this->order->kitchen_status ?? 'PENDING',
            'created_at' => $this->order->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'items' => $this->order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name ?? 'Unknown Item',
                    'quantity' => $item->quantity,
                    'notes' => $item->notes,
                    'modifiers' => $item->modifiers,
                ];
            })->toArray(),
        ];
    }
}
