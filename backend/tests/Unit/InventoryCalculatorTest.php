<?php

namespace Tests\Unit;

use App\Services\InventoryCalculator;
use PHPUnit\Framework\TestCase;

/**
 * Unit test untuk InventoryCalculator (FEFO/COGS)
 *
 * Sesuai dokumentasi §08 Testing Specification §2.1
 * Logic bisnis wajib di-test: FEFO, COGS, weighted average
 */
class InventoryCalculatorTest extends TestCase
{
    /** @test */
    public function it_calculates_weighted_average_cost_correctly()
    {
        $existingQty = 100;
        $existingPrice = 10000;
        $newQty = 50;
        $newPrice = 12000;

        $weightedAvg = InventoryCalculator::calculateWeightedAverageCost(
            $existingQty,
            $existingPrice,
            $newQty,
            $newPrice
        );

        // ((100 * 10000) + (50 * 12000)) / (100 + 50)
        // (1000000 + 600000) / 150 = 1600000 / 150 = 10666.67
        $this->assertEquals(10666.67, $weightedAvg);
    }

    /** @test */
    public function it_returns_new_price_when_existing_stock_is_zero()
    {
        $existingQty = 0;
        $existingPrice = 10000;
        $newQty = 50;
        $newPrice = 12000;

        $weightedAvg = InventoryCalculator::calculateWeightedAverageCost(
            $existingQty,
            $existingPrice,
            $newQty,
            $newPrice
        );

        // (0 + (50 * 12000)) / 50 = 12000
        $this->assertEquals(12000, $weightedAvg);
    }

    /** @test */
    public function it_returns_zero_when_total_quantity_is_zero()
    {
        $weightedAvg = InventoryCalculator::calculateWeightedAverageCost(0, 10000, 0, 12000);
        $this->assertEquals(0, $weightedAvg);
    }

    /** @test */
    public function it_calculates_cogs_correctly()
    {
        $quantity = 10;
        $unitPrice = 15000;

        $cogs = InventoryCalculator::calculateCOGS($quantity, $unitPrice);

        // 10 * 15000 = 150000
        $this->assertEquals(150000, $cogs);
    }

    /** @test */
    public function it_calculates_stock_value_correctly()
    {
        $quantity = 25.5;
        $unitPrice = 8000;

        $value = InventoryCalculator::calculateStockValue($quantity, $unitPrice);

        // 25.5 * 8000 = 204000
        $this->assertEquals(204000, $value);
    }

    /** @test */
    public function it_detects_low_stock_correctly()
    {
        $this->assertTrue(InventoryCalculator::isLowStock(5, 10)); // Below minimum
        $this->assertTrue(InventoryCalculator::isLowStock(10, 10)); // At minimum
        $this->assertFalse(InventoryCalculator::isLowStock(15, 10)); // Above minimum
    }

    /** @test */
    public function it_calculates_remaining_stock_after_deduction()
    {
        $currentStock = 100;
        $deduction = 25;

        $remaining = InventoryCalculator::calculateRemainingStock($currentStock, $deduction);

        $this->assertEquals(75, $remaining);
    }

    /** @test */
    public function it_returns_zero_when_deduction_exceeds_stock()
    {
        $currentStock = 20;
        $deduction = 30;

        $remaining = InventoryCalculator::calculateRemainingStock($currentStock, $deduction);

        $this->assertEquals(0, $remaining);
    }

    /** @test */
    public function it_validates_deduction_is_possible()
    {
        $this->assertTrue(InventoryCalculator::canDeductStock(100, 50));
        $this->assertTrue(InventoryCalculator::canDeductStock(50, 50));
        $this->assertFalse(InventoryCalculator::canDeductStock(40, 50));
        $this->assertFalse(InventoryCalculator::canDeductStock(100, 0));
        $this->assertFalse(InventoryCalculator::canDeductStock(100, -10));
    }

    /** @test */
    public function it_sorts_batches_by_fefo()
    {
        $batches = [
            ['id' => 'batch-3', 'quantity' => 50, 'expiry_date' => '2026-12-31', 'unit_price' => 10000],
            ['id' => 'batch-1', 'quantity' => 100, 'expiry_date' => '2026-08-15', 'unit_price' => 9000],
            ['id' => 'batch-2', 'quantity' => 75, 'expiry_date' => '2026-10-20', 'unit_price' => 9500],
        ];

        $sorted = InventoryCalculator::sortByFEFO($batches);

        // Should be sorted: batch-1 (Aug), batch-2 (Oct), batch-3 (Dec)
        $this->assertEquals('batch-1', $sorted[0]['id']);
        $this->assertEquals('batch-2', $sorted[1]['id']);
        $this->assertEquals('batch-3', $sorted[2]['id']);
    }

    /** @test */
    public function it_sorts_batches_by_fifo()
    {
        $batches = [
            ['id' => 'batch-3', 'quantity' => 50, 'received_date' => '2026-07-15', 'unit_price' => 10000],
            ['id' => 'batch-1', 'quantity' => 100, 'received_date' => '2026-06-01', 'unit_price' => 9000],
            ['id' => 'batch-2', 'quantity' => 75, 'received_date' => '2026-06-20', 'unit_price' => 9500],
        ];

        $sorted = InventoryCalculator::sortByFIFO($batches);

        // Should be sorted: batch-1 (Jun 1), batch-2 (Jun 20), batch-3 (Jul 15)
        $this->assertEquals('batch-1', $sorted[0]['id']);
        $this->assertEquals('batch-2', $sorted[1]['id']);
        $this->assertEquals('batch-3', $sorted[2]['id']);
    }

    /** @test */
    public function it_calculates_fefo_deduction_from_single_batch()
    {
        $batches = [
            ['quantity' => 100, 'unit_price' => 10000, 'expiry_date' => '2026-08-31'],
        ];
        $quantityNeeded = 50;

        $result = InventoryCalculator::calculateFEFODeduction($batches, $quantityNeeded);

        $this->assertEquals(500000, $result['total_cogs']); // 50 * 10000
        $this->assertCount(1, $result['deductions']);
        $this->assertEquals(50, $result['deductions'][0]['quantity']);
        $this->assertEquals(0, $result['remaining_needed']);
    }

    /** @test */
    public function it_calculates_fefo_deduction_from_multiple_batches()
    {
        $batches = [
            ['quantity' => 30, 'unit_price' => 9000, 'expiry_date' => '2026-08-15'],
            ['quantity' => 50, 'unit_price' => 10000, 'expiry_date' => '2026-10-20'],
            ['quantity' => 100, 'unit_price' => 11000, 'expiry_date' => '2026-12-31'],
        ];
        $quantityNeeded = 60;

        $result = InventoryCalculator::calculateFEFODeduction($batches, $quantityNeeded);

        // Deduct 30 from batch-1 (expires first) @ 9000 = 270000
        // Deduct 30 from batch-2 (expires second) @ 10000 = 300000
        // Total COGS = 570000
        $this->assertEquals(570000, $result['total_cogs']);
        $this->assertCount(2, $result['deductions']);
        $this->assertEquals(30, $result['deductions'][0]['quantity']);
        $this->assertEquals(30, $result['deductions'][1]['quantity']);
        $this->assertEquals(0, $result['remaining_needed']);
    }

    /** @test */
    public function it_handles_insufficient_stock_in_fefo_deduction()
    {
        $batches = [
            ['quantity' => 20, 'unit_price' => 10000, 'expiry_date' => '2026-08-31'],
            ['quantity' => 15, 'unit_price' => 11000, 'expiry_date' => '2026-09-30'],
        ];
        $quantityNeeded = 50;

        $result = InventoryCalculator::calculateFEFODeduction($batches, $quantityNeeded);

        // Can only deduct 35 total (20 + 15)
        // COGS = (20 * 10000) + (15 * 11000) = 200000 + 165000 = 365000
        $this->assertEquals(365000, $result['total_cogs']);
        $this->assertEquals(15, $result['remaining_needed']); // 50 - 35 = 15 still needed
    }

    /** @test */
    public function it_converts_unit_with_multiplier()
    {
        $quantity = 2.5; // kg
        $multiplier = 1000; // kg to gram

        $converted = InventoryCalculator::convertUnit($quantity, $multiplier);

        $this->assertEquals(2500, $converted);
    }

    /** @test */
    public function it_converts_between_units_using_rules()
    {
        $conversionRules = [
            ['from' => 'kg', 'to' => 'gram', 'multiplier' => 1000],
            ['from' => 'liter', 'to' => 'ml', 'multiplier' => 1000],
        ];

        $result = InventoryCalculator::convertBetweenUnits(2.5, 'kg', 'gram', $conversionRules);
        $this->assertEquals(2500, $result);

        $result = InventoryCalculator::convertBetweenUnits(1.5, 'liter', 'ml', $conversionRules);
        $this->assertEquals(1500, $result);
    }

    /** @test */
    public function it_returns_same_quantity_when_units_are_identical()
    {
        $conversionRules = [];
        $result = InventoryCalculator::convertBetweenUnits(100, 'gram', 'gram', $conversionRules);
        $this->assertEquals(100, $result);
    }

    /** @test */
    public function it_converts_in_reverse_direction()
    {
        $conversionRules = [
            ['from' => 'kg', 'to' => 'gram', 'multiplier' => 1000],
        ];

        // Convert gram to kg (reverse)
        $result = InventoryCalculator::convertBetweenUnits(2500, 'gram', 'kg', $conversionRules);
        $this->assertEquals(2.5, $result);
    }

    /** @test */
    public function it_returns_null_when_conversion_not_found()
    {
        $conversionRules = [
            ['from' => 'kg', 'to' => 'gram', 'multiplier' => 1000],
        ];

        $result = InventoryCalculator::convertBetweenUnits(100, 'liter', 'ml', $conversionRules);
        $this->assertNull($result);
    }

    /** @test */
    public function it_calculates_total_inventory_value()
    {
        $items = [
            ['quantity' => 100, 'unit_price' => 10000],
            ['quantity' => 50, 'unit_price' => 15000],
            ['quantity' => 25, 'unit_price' => 8000],
        ];

        $totalValue = InventoryCalculator::calculateTotalInventoryValue($items);

        // (100 * 10000) + (50 * 15000) + (25 * 8000)
        // 1000000 + 750000 + 200000 = 1950000
        $this->assertEquals(1950000, $totalValue);
    }

    /** @test */
    public function it_calculates_inventory_turnover_ratio()
    {
        $cogs = 500000;
        $beginningInventory = 150000;
        $endingInventory = 100000;

        $turnover = InventoryCalculator::calculateInventoryTurnover($cogs, $beginningInventory, $endingInventory);

        // Average inventory = (150000 + 100000) / 2 = 125000
        // Turnover = 500000 / 125000 = 4
        $this->assertEquals(4, $turnover);
    }

    /** @test */
    public function it_returns_zero_turnover_when_average_inventory_is_zero()
    {
        $cogs = 500000;
        $beginningInventory = 0;
        $endingInventory = 0;

        $turnover = InventoryCalculator::calculateInventoryTurnover($cogs, $beginningInventory, $endingInventory);

        $this->assertEquals(0, $turnover);
    }

    /** @test */
    public function it_handles_decimal_quantities_in_calculations()
    {
        $quantity = 2.567;
        $unitPrice = 15000;

        $cogs = InventoryCalculator::calculateCOGS($quantity, $unitPrice);

        // 2.567 * 15000 = 38505
        $this->assertEquals(38505, $cogs);
    }

    /** @test */
    public function it_skips_empty_batches_in_fefo_deduction()
    {
        $batches = [
            ['quantity' => 0, 'unit_price' => 9000, 'expiry_date' => '2026-08-15'],
            ['quantity' => 50, 'unit_price' => 10000, 'expiry_date' => '2026-09-20'],
        ];
        $quantityNeeded = 30;

        $result = InventoryCalculator::calculateFEFODeduction($batches, $quantityNeeded);

        // Should skip empty batch and deduct from second batch
        $this->assertEquals(300000, $result['total_cogs']); // 30 * 10000
        $this->assertCount(1, $result['deductions']);
    }

    /** @test */
    public function it_handles_zero_needed_quantity()
    {
        $batches = [
            ['quantity' => 100, 'unit_price' => 10000, 'expiry_date' => '2026-08-31'],
        ];
        $quantityNeeded = 0;

        $result = InventoryCalculator::calculateFEFODeduction($batches, $quantityNeeded);

        $this->assertEquals(0, $result['total_cogs']);
        $this->assertCount(0, $result['deductions']);
        $this->assertEquals(0, $result['remaining_needed']);
    }
}
