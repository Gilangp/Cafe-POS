<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'branch_id', 'inventory_item_id', 'type', 'quantity', 'unit', 'unit_cost_cents',
        'reference_type', 'reference_id', 'notes', 'created_by', 'created_at'
    ];

    protected $casts = ['created_at' => 'datetime', 'quantity' => 'decimal:3'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function inventoryItem() { return $this->belongsTo(InventoryItem::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
