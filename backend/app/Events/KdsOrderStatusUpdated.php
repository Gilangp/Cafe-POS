<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderStatusUpdated implements ShouldBroadcastNow
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
        return 'kds.order.status_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'branch_id' => $this->order->branch_id,
            'status' => $this->order->status,
            'kitchen_status' => $this->order->kitchen_status ?? 'PENDING',
            'updated_at' => $this->order->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }
}
