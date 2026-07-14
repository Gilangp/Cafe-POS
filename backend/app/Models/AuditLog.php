<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'branch_id', 'user_id', 'auditable_type', 'auditable_id', 'action',
        'old_values', 'new_values', 'ip_address', 'user_agent', 'created_at'
    ];

    protected $casts = ['old_values' => 'array', 'new_values' => 'array', 'created_at' => 'datetime'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function user() { return $this->belongsTo(User::class); }
}
