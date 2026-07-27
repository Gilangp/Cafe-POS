<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuVariantGroup extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'menu_id',
        'variant_group_id',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    public function variantGroup(): BelongsTo
    {
        return $this->belongsTo(VariantGroup::class, 'variant_group_id');
    }
}
