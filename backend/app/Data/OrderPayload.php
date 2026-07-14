<?php

namespace App\Data;

use Illuminate\Support\Collection;

final class OrderPayload
{
    public function __construct(
        public readonly int $branchId,
        public readonly ?int $userId,
        public readonly Collection $items,
        public readonly string $orderType,
        public readonly string $paymentMethod,
        public readonly ?int $memberId = null,
        public readonly ?string $notes = null,
        public readonly ?string $idempotencyKey = null,
        public readonly ?string $tableNumber = null,
        public readonly ?string $kitchenStatus = 'PENDING'
    ) {
    }
}