<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'method', 'provider', 'provider_transaction_id', 'status',
        'amount_cents', 'paid_at', 'failure_reason', 'raw_response'
    ];

    protected $casts = ['paid_at' => 'datetime', 'raw_response' => 'array'];

    public function order() { return $this->belongsTo(Order::class); }
}
