<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasUuids;

    protected $fillable = [
        'image',
        'category',
        'caption',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];
}
