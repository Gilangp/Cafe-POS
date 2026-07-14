<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CmsBlock extends Model
{
    use HasFactory;

    protected $fillable = ['page_id', 'type', 'sort_order', 'content_json'];
    protected $casts = ['content_json' => 'array'];

    public function page() { return $this->belongsTo(Page::class); }
}
