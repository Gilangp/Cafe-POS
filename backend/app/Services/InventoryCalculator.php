<?php

namespace App\Services;

/**
 * InventoryCalculator - Pure function untuk kalkulasi inventory FEFO/COGS
 *
 * Sesuai dokumentasi §08 Testing Specification
 * Unit test wajib untuk logic bisnis: FEFO, COGS, weighted average
 */
class InventoryCalculator
{
    /**
     * Calculate weighted average cost when receiving new stock
     *
     * Formula: ((existing_qty * existing_price) + (new_qty * new_price)) / (existing_qty + new_qty)
     *
     * @param  float  $existingQty  Current stock quantity
     * @param  float  $existingPrice  Current unit price
     * @param  float  $newQty  Incoming stock quantity
     * @param  float  $newPrice  Incoming unit price
     * @return float New weighted average price
     */
    public static function calculateWeightedAverageCost(
        float $existingQty,
        float $existingPrice,
        float $newQty,
        float $newPrice
    ): float {
        if ($existingQty + $newQty <= 0) {
            return 0;
        }

        $existingValue = $existingQty * $existingPrice;
        $newValue = $newQty * $newPrice;
        $totalValue = $existingValue + $newValue;
        $totalQty = $existingQty + $newQty;

        return round($totalValue / $totalQty, 2);
    }

    /**
     * Calculate COGS (Cost of Goods Sold) for a sale
     *
     * @param  float  $quantity  Quantity sold
     * @param  float  $unitPrice  Cost per unit
     * @return float Total COGS
     */
    public static function calculateCOGS(float $quantity, float $unitPrice): float
    {
        return round($quantity * $unitPrice, 2);
    }

    /**
     * Calculate stock value (inventory valuation)
     *
     * @param  float  $quantity  Stock quantity
     * @param  float  $unitPrice  Price per unit
     * @return float Total stock value
     */
    public static function calculateStockValue(float $quantity, float $unitPrice): float
    {
        return round($quantity * $unitPrice, 2);
    }

    /**
     * Check if stock is below minimum threshold
     *
     * @param  float  $currentStock  Current stock quantity
     * @param  float  $minimumStock  Minimum threshold
     * @return bool True if stock is low
     */
    public static function isLowStock(float $currentStock, float $minimumStock): bool
    {
        return $currentStock <= $minimumStock;
    }

    /**
     * Calculate stock after deduction
     *
     * @param  float  $currentStock  Current stock
     * @param  float  $deduction  Amount to deduct
     * @return float Remaining stock (cannot go below 0)
     */
    public static function calculateRemainingStock(float $currentStock, float $deduction): float
    {
        return max(0, round($currentStock - $deduction, 4));
    }

    /**
     * Check if deduction is possible
     *
     * @param  float  $currentStock  Current stock
     * @param  float  $deduction  Amount to deduct
     * @return bool True if deduction is valid
     */
    public static function canDeductStock(float $currentStock, float $deduction): bool
    {
        return $currentStock >= $deduction && $deduction > 0;
    }

    /**
     * FEFO (First Expired, First Out) - Sort batches by expiry date
     *
     * @param  array  $batches  Format: [['id' => string, 'quantity' => float, 'expiry_date' => string, 'unit_price' => float]]
     * @return array Sorted batches (earliest expiry first)
     */
    public static function sortByFEFO(array $batches): array
    {
        usort($batches, function ($a, $b) {
            $dateA = strtotime($a['expiry_date'] ?? '9999-12-31');
            $dateB = strtotime($b['expiry_date'] ?? '9999-12-31');

            return $dateA <=> $dateB;
        });

        return $batches;
    }

    /**
     * FIFO (First In, First Out) - Sort batches by received date
     *
     * @param  array  $batches  Format: [['id' => string, 'quantity' => float, 'received_date' => string, 'unit_price' => float]]
     * @return array Sorted batches (earliest received first)
     */
    public static function sortByFIFO(array $batches): array
    {
        usort($batches, function ($a, $b) {
            $dateA = strtotime($a['received_date'] ?? '1970-01-01');
            $dateB = strtotime($b['received_date'] ?? '1970-01-01');

            return $dateA <=> $dateB;
        });

        return $batches;
    }

    /**
     * Calculate COGS using FEFO method from multiple batches
     *
     * @param  array  $batches  Format: [['quantity' => float, 'unit_price' => float, 'expiry_date' => string]]
     * @param  float  $quantityNeeded  Quantity to deduct
     * @return array ['total_cogs' => float, 'deductions' => [['batch_index' => int, 'quantity' => float, 'cogs' => float]]]
     */
    public static function calculateFEFODeduction(array $batches, float $quantityNeeded): array
    {
        $sortedBatches = self::sortByFEFO($batches);
        $remaining = $quantityNeeded;
        $totalCOGS = 0;
        $deductions = [];

        foreach ($sortedBatches as $index => $batch) {
            if ($remaining <= 0) {
                break;
            }

            $batchQty = (float) ($batch['quantity'] ?? 0);
            $batchPrice = (float) ($batch['unit_price'] ?? 0);

            if ($batchQty <= 0) {
                continue;
            }

            $deductQty = min($remaining, $batchQty);
            $cogs = self::calculateCOGS($deductQty, $batchPrice);

            $deductions[] = [
                'batch_index' => $index,
                'quantity' => $deductQty,
                'cogs' => $cogs,
                'unit_price' => $batchPrice,
            ];

            $totalCOGS += $cogs;
            $remaining -= $deductQty;
        }

        return [
            'total_cogs' => round($totalCOGS, 2),
            'deductions' => $deductions,
            'remaining_needed' => max(0, round($remaining, 4)),
        ];
    }

    /**
     * Convert unit quantities (e.g., kg to gram)
     *
     * @param  float  $quantity  Quantity to convert
     * @param  float  $multiplier  Conversion multiplier (e.g., 1000 for kg to gram)
     * @return float Converted quantity
     */
    public static function convertUnit(float $quantity, float $multiplier): float
    {
        return round($quantity * $multiplier, 4);
    }

    /**
     * Calculate conversion between units
     *
     * @param  float  $quantity  Quantity in source unit
     * @param  string  $fromUnit  Source unit
     * @param  string  $toUnit  Target unit
     * @param  array  $conversionRules  Format: [['from' => string, 'to' => string, 'multiplier' => float]]
     * @return float|null Converted quantity or null if conversion not found
     */
    public static function convertBetweenUnits(float $quantity, string $fromUnit, string $toUnit, array $conversionRules): ?float
    {
        if ($fromUnit === $toUnit) {
            return $quantity;
        }

        // Direct conversion
        foreach ($conversionRules as $rule) {
            if ($rule['from'] === $fromUnit && $rule['to'] === $toUnit) {
                return self::convertUnit($quantity, $rule['multiplier']);
            }
        }

        // Reverse conversion
        foreach ($conversionRules as $rule) {
            if ($rule['from'] === $toUnit && $rule['to'] === $fromUnit) {
                return self::convertUnit($quantity, 1 / $rule['multiplier']);
            }
        }

        return null;
    }

    /**
     * Calculate total inventory value for multiple items
     *
     * @param  array  $items  Format: [['quantity' => float, 'unit_price' => float]]
     * @return float Total inventory value
     */
    public static function calculateTotalInventoryValue(array $items): float
    {
        $totalValue = 0;

        foreach ($items as $item) {
            $qty = (float) ($item['quantity'] ?? 0);
            $price = (float) ($item['unit_price'] ?? 0);
            $totalValue += self::calculateStockValue($qty, $price);
        }

        return round($totalValue, 2);
    }

    /**
     * Calculate inventory turnover ratio
     *
     * Formula: COGS / Average Inventory Value
     *
     * @param  float  $cogs  Cost of Goods Sold for period
     * @param  float  $beginningInventory  Inventory value at start
     * @param  float  $endingInventory  Inventory value at end
     * @return float Turnover ratio
     */
    public static function calculateInventoryTurnover(float $cogs, float $beginningInventory, float $endingInventory): float
    {
        $averageInventory = ($beginningInventory + $endingInventory) / 2;

        if ($averageInventory <= 0) {
            return 0;
        }

        return round($cogs / $averageInventory, 2);
    }
}
