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
        'operating_hours',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'logo',
        'favicon',
    ];
}
