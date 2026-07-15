<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AboutUs extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'content',
        'image',
        'highlights',
    ];

    protected $casts = [
        'highlights' => 'array',
    ];
}
