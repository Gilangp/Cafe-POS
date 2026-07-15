<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'image',
        'status',
        'is_best_seller',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_best_seller' => 'boolean',
        'status' => 'string',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'menu_promotions');
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Inventory::class, 'menu_ingredients')
            ->withPivot('quantity_used')
            ->withTimestamps();
    }

    public function menuIngredients(): HasMany
    {
        return $this->hasMany(MenuIngredient::class, 'menu_id');
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class, 'menu_id');
    }
}
