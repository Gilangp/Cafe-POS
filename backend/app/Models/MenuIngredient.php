<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class MenuIngredient extends Pivot
{
    use HasUuids;

    protected $table = 'menu_ingredients';

    protected $fillable = [
        'menu_id',
        'inventory_id',
        'quantity_used',
    ];

    protected $casts = [
        'quantity_used' => 'decimal:2',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
