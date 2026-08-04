<?php

namespace App\Events;

use App\Models\OrderTicket;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class KdsOrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public OrderTicket $ticket
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('kitchen'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'kds.order.status_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
            'status' => $this->ticket->status,
            'updated_at' => $this->ticket->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }
}
