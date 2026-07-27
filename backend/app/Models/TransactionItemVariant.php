<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItemVariant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'transaction_item_id',
        'variant_option_id',
        'option_name_snapshot',
        'additional_price_snapshot',
    ];

    protected $casts = [
        'additional_price_snapshot' => 'decimal:2',
    ];

    public function transactionItem(): BelongsTo
    {
        return $this->belongsTo(TransactionItem::class, 'transaction_item_id');
    }

    public function variantOption(): BelongsTo
    {
        return $this->belongsTo(VariantOption::class, 'variant_option_id');
    }
}
