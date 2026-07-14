<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use BranchScoped, HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'branch_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'order_type',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'tax',
        'discount',
        'total',
        'notes',
        'table_number',
        'completed_at',
        'idempotency_key',
        'kitchen_status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
