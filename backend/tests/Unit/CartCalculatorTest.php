<?php

namespace Tests\Unit;

use App\Services\CartCalculator;
use PHPUnit\Framework\TestCase;

/**
 * Unit test untuk CartCalculator
 * 
 * Sesuai dokumentasi §08 Testing Specification §2.1
 * Logic bisnis wajib di-test: hitung total, diskon, pajak
 */
class CartCalculatorTest extends TestCase
{
    /** @test */
    public function it_calculates_subtotal_for_single_item_without_variants()
    {
        $items = [
            ['price' => 25000, 'quantity' => 2, 'variants' => []],
        ];

        $subtotal = CartCalculator::calculateSubtotal($items);

        $this->assertEquals(50000, $subtotal);
    }

    /** @test */
    public function it_calculates_subtotal_for_multiple_items()
    {
        $items = [
            ['price' => 25000, 'quantity' => 2, 'variants' => []],
            ['price' => 30000, 'quantity' => 1, 'variants' => []],
            ['price' => 15000, 'quantity' => 3, 'variants' => []],
        ];

        $subtotal = CartCalculator::calculateSubtotal($items);

        // (25000 * 2) + (30000 * 1) + (15000 * 3) = 50000 + 30000 + 45000 = 125000
        $this->assertEquals(125000, $subtotal);
    }

    /** @test */
    public function it_calculates_subtotal_with_single_variant()
    {
        $items = [
            [
                'price' => 25000,
                'quantity' => 2,
                'variants' => [
                    ['additional_price' => 3000], // Large size
                ],
            ],
        ];

        $subtotal = CartCalculator::calculateSubtotal($items);

        // (25000 + 3000) * 2 = 56000
        $this->assertEquals(56000, $subtotal);
    }

    /** @test */
    public function it_calculates_subtotal_with_multiple_variants()
    {
        $items = [
            [
                'price' => 25000,
                'quantity' => 2,
                'variants' => [
                    ['additional_price' => 3000], // Large size
                    ['additional_price' => 5000], // Extra shot
                ],
            ],
        ];

        $subtotal = CartCalculator::calculateSubtotal($items);

        // (25000 + 3000 + 5000) * 2 = 66000
        $this->assertEquals(66000, $subtotal);
    }

    /** @test */
    public function it_calculates_tax_when_enabled()
    {
        $subtotal = 100000;
        $discount = 10000;
        $taxRate = 11; // 11%
        $taxEnabled = true;

        $tax = CartCalculator::calculateTax($subtotal, $discount, $taxRate, $taxEnabled);

        // (100000 - 10000) * 11% = 90000 * 0.11 = 9900
        $this->assertEquals(9900, $tax);
    }

    /** @test */
    public function it_returns_zero_tax_when_disabled()
    {
        $subtotal = 100000;
        $discount = 10000;
        $taxRate = 11;
        $taxEnabled = false;

        $tax = CartCalculator::calculateTax($subtotal, $discount, $taxRate, $taxEnabled);

        $this->assertEquals(0, $tax);
    }

    /** @test */
    public function it_returns_zero_tax_when_rate_is_zero()
    {
        $subtotal = 100000;
        $discount = 10000;
        $taxRate = 0;
        $taxEnabled = true;

        $tax = CartCalculator::calculateTax($subtotal, $discount, $taxRate, $taxEnabled);

        $this->assertEquals(0, $tax);
    }

    /** @test */
    public function it_calculates_tax_on_positive_amount_after_discount()
    {
        $subtotal = 50000;
        $discount = 50000; // Full discount
        $taxRate = 11;
        $taxEnabled = true;

        $tax = CartCalculator::calculateTax($subtotal, $discount, $taxRate, $taxEnabled);

        // No taxable amount
        $this->assertEquals(0, $tax);
    }

    /** @test */
    public function it_calculates_total_correctly()
    {
        $subtotal = 100000;
        $discount = 10000;
        $taxAmount = 9900;

        $total = CartCalculator::calculateTotal($subtotal, $discount, $taxAmount);

        // 100000 - 10000 + 9900 = 99900
        $this->assertEquals(99900, $total);
    }

    /** @test */
    public function it_returns_zero_when_discount_exceeds_subtotal()
    {
        $subtotal = 50000;
        $discount = 60000;
        $taxAmount = 0;

        $total = CartCalculator::calculateTotal($subtotal, $discount, $taxAmount);

        // max(0, 50000 - 60000 + 0) = 0
        $this->assertEquals(0, $total);
    }

    /** @test */
    public function it_calculates_all_values_in_one_go()
    {
        $items = [
            ['price' => 25000, 'quantity' => 2, 'variants' => []],
            ['price' => 30000, 'quantity' => 1, 'variants' => []],
        ];
        $discount = 10000;
        $taxRate = 11;
        $taxEnabled = true;

        $result = CartCalculator::calculate($items, $discount, $taxRate, $taxEnabled);

        // Subtotal: (25000 * 2) + (30000 * 1) = 80000
        // Tax: (80000 - 10000) * 0.11 = 7700
        // Total: 80000 - 10000 + 7700 = 77700
        $this->assertEquals(80000, $result['subtotal']);
        $this->assertEquals(10000, $result['discount']);
        $this->assertEquals(7700, $result['tax_amount']);
        $this->assertEquals(77700, $result['total']);
    }

    /** @test */
    public function it_validates_discount_is_not_greater_than_subtotal()
    {
        $this->assertTrue(CartCalculator::isDiscountValid(10000, 50000));
        $this->assertTrue(CartCalculator::isDiscountValid(50000, 50000));
        $this->assertFalse(CartCalculator::isDiscountValid(60000, 50000));
    }

    /** @test */
    public function it_validates_discount_is_not_negative()
    {
        $this->assertFalse(CartCalculator::isDiscountValid(-1000, 50000));
        $this->assertTrue(CartCalculator::isDiscountValid(0, 50000));
    }

    /** @test */
    public function it_calculates_ingredient_deductions_for_base_recipe()
    {
        $menuIngredients = [
            ['inventory_id' => 'inv-001', 'quantity_used' => 10], // 10 gram kopi
            ['inventory_id' => 'inv-002', 'quantity_used' => 200], // 200 ml susu
        ];
        $variants = [];
        $quantity = 2;

        $deductions = CartCalculator::calculateIngredientDeductions($menuIngredients, $variants, $quantity);

        // Each quantity multiplied by item quantity
        $this->assertEquals(20, $deductions['inv-001']); // 10 * 2
        $this->assertEquals(400, $deductions['inv-002']); // 200 * 2
    }

    /** @test */
    public function it_calculates_ingredient_deductions_with_add_variant()
    {
        $menuIngredients = [
            ['inventory_id' => 'inv-001', 'quantity_used' => 10], // Base: 10 gram kopi
        ];
        $variants = [
            [
                'inventory_item_id' => 'inv-001',
                'inventory_action' => 'add',
                'inventory_action_value' => 5, // Extra shot: +5 gram
            ],
        ];
        $quantity = 1;

        $deductions = CartCalculator::calculateIngredientDeductions($menuIngredients, $variants, $quantity);

        // 10 + 5 = 15 gram
        $this->assertEquals(15, $deductions['inv-001']);
    }

    /** @test */
    public function it_calculates_ingredient_deductions_with_subtract_variant()
    {
        $menuIngredients = [
            ['inventory_id' => 'inv-002', 'quantity_used' => 200], // Base: 200 ml susu
        ];
        $variants = [
            [
                'inventory_item_id' => 'inv-002',
                'inventory_action' => 'subtract',
                'inventory_action_value' => 50, // Less milk: -50 ml
            ],
        ];
        $quantity = 1;

        $deductions = CartCalculator::calculateIngredientDeductions($menuIngredients, $variants, $quantity);

        // 200 - 50 = 150 ml
        $this->assertEquals(150, $deductions['inv-002']);
    }

    /** @test */
    public function it_calculates_ingredient_deductions_with_swap_variant()
    {
        $menuIngredients = [
            ['inventory_id' => 'inv-kopi-gayo', 'quantity_used' => 10], // Base: Kopi Gayo
        ];
        $variants = [
            [
                'inventory_item_id' => 'inv-kopi-toraja',
                'inventory_action' => 'swap',
                'inventory_action_value' => 12, // Swap to Toraja: 12 gram
            ],
        ];
        $quantity = 1;

        $deductions = CartCalculator::calculateIngredientDeductions($menuIngredients, $variants, $quantity);

        // Swap completely replaces the ingredient
        $this->assertEquals(12, $deductions['inv-kopi-toraja']);
        // Original ingredient should still be in base (not swapped in this simple model)
        $this->assertEquals(10, $deductions['inv-kopi-gayo']);
    }

    /** @test */
    public function it_calculates_ingredient_deductions_with_multiply_variant()
    {
        $menuIngredients = [
            ['inventory_id' => 'inv-001', 'quantity_used' => 10], // Base: 10 gram
        ];
        $variants = [
            [
                'inventory_item_id' => 'inv-001',
                'inventory_action' => 'multiply',
                'inventory_action_value' => 2, // Double shot: x2
            ],
        ];
        $quantity = 1;

        $deductions = CartCalculator::calculateIngredientDeductions($menuIngredients, $variants, $quantity);

        // 10 * 2 = 20 gram
        $this->assertEquals(20, $deductions['inv-001']);
    }

    /** @test */
    public function it_handles_empty_cart()
    {
        $items = [];
        $subtotal = CartCalculator::calculateSubtotal($items);
        $this->assertEquals(0, $subtotal);
    }

    /** @test */
    public function it_handles_zero_quantity()
    {
        $items = [
            ['price' => 25000, 'quantity' => 0, 'variants' => []],
        ];
        $subtotal = CartCalculator::calculateSubtotal($items);
        $this->assertEquals(0, $subtotal);
    }

    /** @test */
    public function it_rounds_results_to_two_decimals()
    {
        $items = [
            ['price' => 33.333, 'quantity' => 3, 'variants' => []],
        ];
        $subtotal = CartCalculator::calculateSubtotal($items);
        
        // 33.333 * 3 = 99.999, CartCalculator rounds to 100
        $this->assertEquals(100.00, $subtotal);
    }
}
