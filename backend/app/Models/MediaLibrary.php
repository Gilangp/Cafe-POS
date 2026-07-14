<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaLibrary extends Model
{
    use HasFactory;

    protected $table = 'media_library';

    protected $fillable = [
        'disk', 'path', 'filename', 'mime_type', 'size_bytes', 'alt_text', 'uploaded_by'
    ];

    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }
}
