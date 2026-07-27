<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantOption extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'variant_group_id',
        'name',
        'additional_price',
        'inventory_item_id',
        'inventory_action',
        'inventory_action_value',
    ];

    protected $casts = [
        'additional_price' => 'decimal:2',
        'inventory_action_value' => 'decimal:2',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(VariantGroup::class, 'variant_group_id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(Inventory::class, 'inventory_item_id');
    }
}
