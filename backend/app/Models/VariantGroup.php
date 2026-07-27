<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VariantGroup extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'type',
    ];

    public function options(): HasMany
    {
        return $this->hasMany(VariantOption::class, 'variant_group_id');
    }
}
