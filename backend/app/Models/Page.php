<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'content', 'meta_title', 'meta_description', 'featured_image',
        'status', 'is_homepage', 'author_id', 'published_at'
    ];

    protected $casts = ['is_homepage' => 'boolean', 'published_at' => 'datetime'];

    public function author() { return $this->belongsTo(User::class, 'author_id'); }
    public function blocks() { return $this->hasMany(CmsBlock::class); }
}
