<?php

namespace App\Services;

/**
 * CartCalculator - Pure function untuk kalkulasi cart POS
 * 
 * Sesuai dokumentasi §08 Testing Specification
 * Unit test wajib untuk logic bisnis: hitung total, diskon, pajak
 */
class CartCalculator
{
    /**
     * Calculate subtotal from cart items
     * 
     * @param array $items Format: [['price' => float, 'quantity' => int, 'variants' => [['additional_price' => float]]]]
     * @return float
     */
    public static function calculateSubtotal(array $items): float
    {
        $subtotal = 0;

        foreach ($items as $item) {
            $price = (float)($item['price'] ?? 0);
            $quantity = (int)($item['quantity'] ?? 0);
            
            // Base item price
            $itemSubtotal = $price * $quantity;
            
            // Add variant additional prices
            if (!empty($item['variants']) && is_array($item['variants'])) {
                $variantsTotal = 0;
                foreach ($item['variants'] as $variant) {
                    $variantsTotal += (float)($variant['additional_price'] ?? 0);
                }
                $itemSubtotal += ($variantsTotal * $quantity);
            }
            
            $subtotal += $itemSubtotal;
        }

        return round($subtotal, 2);
    }

    /**
     * Calculate tax amount based on subtotal after discount
     * 
     * @param float $subtotal
     * @param float $discount
     * @param float $taxRate Percentage (e.g., 11 for 11%)
     * @param bool $taxEnabled
     * @return float
     */
    public static function calculateTax(float $subtotal, float $discount, float $taxRate, bool $taxEnabled = true): float
    {
        if (!$taxEnabled || $taxRate <= 0) {
            return 0;
        }

        $taxableAmount = max(0, $subtotal - $discount);
        return round($taxableAmount * $taxRate / 100, 2);
    }

    /**
     * Calculate final total
     * 
     * Formula: max(0, subtotal - discount + tax)
     * 
     * @param float $subtotal
     * @param float $discount
     * @param float $taxAmount
     * @return float
     */
    public static function calculateTotal(float $subtotal, float $discount, float $taxAmount): float
    {
        return max(0, round($subtotal - $discount + $taxAmount, 2));
    }

    /**
     * Calculate all cart values in one go
     * 
     * @param array $items Cart items
     * @param float $discount Discount amount
     * @param float $taxRate Tax rate percentage
     * @param bool $taxEnabled Whether tax is enabled
     * @return array ['subtotal' => float, 'discount' => float, 'tax_amount' => float, 'total' => float]
     */
    public static function calculate(array $items, float $discount = 0, float $taxRate = 11, bool $taxEnabled = true): array
    {
        $subtotal = self::calculateSubtotal($items);
        $taxAmount = self::calculateTax($subtotal, $discount, $taxRate, $taxEnabled);
        $total = self::calculateTotal($subtotal, $discount, $taxAmount);

        return [
            'subtotal' => $subtotal,
            'discount' => max(0, $discount),
            'tax_amount' => $taxAmount,
            'total' => $total,
        ];
    }

    /**
     * Validate discount does not exceed subtotal
     * 
     * @param float $discount
     * @param float $subtotal
     * @return bool
     */
    public static function isDiscountValid(float $discount, float $subtotal): bool
    {
        return $discount >= 0 && $discount <= $subtotal;
    }

    /**
     * Calculate ingredient deductions for menu items
     * 
     * @param array $menuIngredients Format: [['inventory_id' => string, 'quantity_used' => float]]
     * @param array $variants Format: [['inventory_item_id' => string, 'inventory_action' => string, 'inventory_action_value' => float]]
     * @param int $quantity Item quantity
     * @return array ['inventory_id' => total_quantity_to_deduct]
     */
    public static function calculateIngredientDeductions(array $menuIngredients, array $variants, int $quantity): array
    {
        $deductions = [];

        // Base ingredients from menu recipe
        foreach ($menuIngredients as $ingredient) {
            $invId = $ingredient['inventory_id'] ?? null;
            $qtyUsed = (float)($ingredient['quantity_used'] ?? 0);
            
            if ($invId) {
                $deductions[$invId] = $qtyUsed;
            }
        }

        // Apply variant actions
        foreach ($variants as $variant) {
            $invId = $variant['inventory_item_id'] ?? null;
            $action = $variant['inventory_action'] ?? 'none';
            $value = (float)($variant['inventory_action_value'] ?? 0);

            if (!$invId || $action === 'none') {
                continue;
            }

            switch ($action) {
                case 'add':
                    $deductions[$invId] = ($deductions[$invId] ?? 0) + $value;
                    break;
                case 'subtract':
                    $deductions[$invId] = max(0, ($deductions[$invId] ?? 0) - $value);
                    break;
                case 'multiply':
                    $deductions[$invId] = ($deductions[$invId] ?? 0) * $value;
                    break;
                case 'swap':
                    $deductions[$invId] = $value;
                    break;
            }
        }

        // Multiply by item quantity
        foreach ($deductions as $invId => $baseQty) {
            $deductions[$invId] = $baseQty * $quantity;
        }

        return $deductions;
    }
}
