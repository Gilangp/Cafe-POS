<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'name', 'yield_quantity', 'yield_unit', 'instructions', 'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function ingredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
