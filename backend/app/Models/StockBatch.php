<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockBatch extends Model
{
    use HasFactory, BranchScoped;

    protected $fillable = [
        'branch_id',
        'inventory_item_id',
        'batch_number',
        'quantity_received',
        'quantity_remaining',
        'received_date',
        'expiration_date',
        'unit_cost_cents',
        'purchase_order_id',
        'status',
    ];

    protected $casts = [
        'quantity_received' => 'decimal:3',
        'quantity_remaining' => 'decimal:3',
        'received_date' => 'date',
        'expiration_date' => 'date',
        'unit_cost_cents' => 'integer',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
