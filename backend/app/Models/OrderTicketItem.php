<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderTicketItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_ticket_id',
        'menu_name_snapshot',
        'quantity',
        'note',
        'item_status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'item_status' => 'string',
    ];

    public function orderTicket(): BelongsTo
    {
        return $this->belongsTo(OrderTicket::class, 'order_ticket_id');
    }
}
