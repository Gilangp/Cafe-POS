<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'latitude',
        'longitude',
        'timezone',
        'currency',
        'is_active',
        'opening_hours',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opening_hours' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'branch_products')
            ->withPivot('price', 'is_available', 'stock_quantity')
            ->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }
}
