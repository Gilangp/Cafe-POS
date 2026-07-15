<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderTicket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'transaction_id',
        'ticket_number',
        'status',
        'assigned_to',
        'received_at',
        'processed_at',
        'ready_at',
        'served_at',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'processed_at' => 'datetime',
        'ready_at' => 'datetime',
        'served_at' => 'datetime',
        'status' => 'string',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderTicketItem::class, 'order_ticket_id');
    }
}
