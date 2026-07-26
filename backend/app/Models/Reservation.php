<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    use HasFactory, HasUuids;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->reservation_code)) {
                $model->reservation_code = 'NEMU-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }

    protected $fillable = [
        'reservation_code',
        'table_id',
        'customer_name',
        'customer_phone',
        'reservation_date',
        'reservation_time',
        'party_size',
        'purpose',
        'notes',
        'status',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'party_size' => 'integer',
        'status' => 'string',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class, 'table_id');
    }
}
