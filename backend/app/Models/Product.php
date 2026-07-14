<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'base_price', 'sku', 'image',
        'is_active', 'is_featured', 'preparation_time', 'tags', 'recipe_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'tags' => 'json',
        'base_price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function branchProducts()
    {
        return $this->hasMany(BranchProduct::class);
    }
}