<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id', 'name', 'sku', 'description', 'unit', 'quantity', 'min_quantity', 'unit_cost'
    ];

    protected $casts = ['quantity' => 'decimal:2', 'min_quantity' => 'decimal:2', 'unit_cost' => 'decimal:2'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function transactions() { return $this->hasMany(InventoryTransaction::class); }
    public function recipeIngredients() { return $this->hasMany(RecipeIngredient::class); }
}
