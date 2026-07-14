<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['member_id', 'order_id', 'type', 'points', 'description', 'expires_at'];
    protected $casts = ['expires_at' => 'datetime'];

    public function member() { return $this->belongsTo(Member::class); }
    public function order() { return $this->belongsTo(Order::class); }
}
