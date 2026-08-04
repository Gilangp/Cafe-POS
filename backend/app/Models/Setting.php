<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasUuids;

    protected $fillable = [
        'site_name',
        'site_tagline',
        'phone',
        'email',
        'address',
        'tax_rate',
        'tax_enabled',
        'operating_hours',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'logo',
        'favicon',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:2',
        'tax_enabled' => 'boolean',
    ];
}
