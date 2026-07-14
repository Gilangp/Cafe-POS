<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use BranchScoped, HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'member_id', 'reservation_code', 'customer_name', 'customer_phone',
        'customer_email', 'reservation_date', 'reservation_time', 'party_size',
        'table_number', 'special_requests', 'status', 'deposit_cents'
    ];

    protected $casts = ['reservation_date' => 'date'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function member() { return $this->belongsTo(Member::class); }
}
