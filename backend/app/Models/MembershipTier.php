<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipTier extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'minimum_spend_cents', 'points_multiplier', 'benefits_json'];
    protected $casts = ['benefits_json' => 'array', 'points_multiplier' => 'decimal:2'];

    public function members() { return $this->hasMany(Member::class); }
}
