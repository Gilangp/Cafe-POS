<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class MenuPromotion extends Pivot
{
    use HasUuids;

    protected $table = 'menu_promotions';

    protected $fillable = [
        'menu_id',
        'promotion_id',
    ];
}
