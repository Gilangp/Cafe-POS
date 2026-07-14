<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'user_id', 'membership_tier_id', 'member_code', 'full_name',
        'email', 'phone', 'birth_date', 'points_balance', 'lifetime_spend_cents', 'status'
    ];

    protected $casts = ['birth_date' => 'date'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function tier() { return $this->belongsTo(MembershipTier::class, 'membership_tier_id'); }
    public function loyaltyTransactions() { return $this->hasMany(LoyaltyTransaction::class); }
    public function orders() { return $this->hasMany(Order::class); }
}
