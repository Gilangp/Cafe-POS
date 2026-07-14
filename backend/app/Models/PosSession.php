<?php

namespace App\Models;

use App\Models\Concerns\BranchScoped;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PosSession extends Model
{
    use BranchScoped, HasFactory;

    protected $fillable = [
        'branch_id', 'user_id', 'session_number', 'opened_at', 'closed_at',
        'opening_cash_cents', 'closing_cash_cents', 'expected_cash_cents',
        'total_sales_cents', 'total_transactions', 'status', 'notes'
    ];

    protected $casts = ['opened_at' => 'datetime', 'closed_at' => 'datetime'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function user() { return $this->belongsTo(User::class); }
}
