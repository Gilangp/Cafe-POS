<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id', 'inventory_item_id', 'quantity', 'unit',
        'unit_price_cents', 'total_price_cents', 'received_quantity'
    ];

    protected $casts = ['quantity' => 'decimal:3', 'received_quantity' => 'decimal:3'];

    public function purchaseOrder() { return $this->belongsTo(PurchaseOrder::class); }
    public function inventoryItem() { return $this->belongsTo(InventoryItem::class); }
}
