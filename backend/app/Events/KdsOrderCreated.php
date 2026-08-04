<?php

namespace App\Events;

use App\Models\OrderTicket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public OrderTicket $ticket
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('kitchen'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'kds.order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
            'status' => $this->ticket->status,
            'received_at' => $this->ticket->received_at?->toIso8601String(),
            'transaction' => [
                'invoice_number' => $this->ticket->transaction?->invoice_number,
                'order_type' => $this->ticket->transaction?->order_type,
                'table_number' => $this->ticket->transaction?->table_number,
                'customer_name' => $this->ticket->transaction?->customer_name,
            ],
            'items' => $this->ticket->items->map(fn ($item) => [
                'id' => $item->id,
                'menu_name_snapshot' => $item->menu_name_snapshot,
                'quantity' => $item->quantity,
                'note' => $item->note,
                'item_status' => $item->item_status,
            ])->toArray(),
        ];
    }
}
