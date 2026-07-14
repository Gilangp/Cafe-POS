<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'code', 'type', 'value', 'min_order_cents', 'max_discount_cents',
        'channel', 'start_date', 'end_date', 'usage_count', 'max_usage',
        'is_active', 'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function calculateDiscount(int $subtotalCents, string $orderChannel = 'All'): int
    {
        if (!$this->is_active) {
            return 0;
        }

        if ($this->max_usage !== null && $this->usage_count >= $this->max_usage) {
            return 0;
        }

        if ($this->channel !== 'All' && strtolower($this->channel) !== strtolower($orderChannel)) {
            return 0;
        }

        if ($subtotalCents < $this->min_order_cents) {
            return 0;
        }

        $discount = 0;
        if ($this->type === 'percent') {
            $discount = (int) round(($subtotalCents * $this->value) / 100);
            if ($this->max_discount_cents !== null && $discount > $this->max_discount_cents) {
                $discount = $this->max_discount_cents;
            }
        } elseif ($this->type === 'nominal') {
            $discount = (int) round($this->value);
        } elseif ($this->type === 'bogo') {
            // Flat BOGO discount estimate or calculation
            $discount = (int) round($this->value > 0 ? $this->value : ($subtotalCents / 3));
        }

        return min($discount, $subtotalCents);
    }
}
