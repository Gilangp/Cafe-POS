<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProcurementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::all();
        $inventories = Inventory::all();

        if ($suppliers->isEmpty() || $inventories->isEmpty()) {
            $this->command->warn('Suppliers or Inventories are empty. Please run DatabaseSeeder first.');
            return;
        }

        // Create 5 Purchase Orders
        for ($i = 1; $i <= 5; $i++) {
            $supplier = $suppliers->random();
            // Get 2-4 random inventory items for this PO
            // Ideally we'd get items belonging to this supplier, but if none, just pick random
            $supplierItems = $inventories->where('supplier_id', $supplier->id);
            if ($supplierItems->isEmpty()) {
                $supplierItems = $inventories->random(min(3, $inventories->count()));
            } else {
                $supplierItems = $supplierItems->random(min(rand(2, 4), $supplierItems->count()));
            }

            $orderDate = Carbon::now()->subDays(rand(1, 30));
            $expectedDate = $orderDate->copy()->addDays(rand(1, 5));
            $isReceived = rand(0, 1) == 1;

            $status = 'ORDERED';
            if ($isReceived) {
                $status = rand(0, 1) == 1 ? 'RECEIVED' : 'PARTIAL';
            }

            $po = PurchaseOrder::create([
                'id' => Str::uuid(),
                'po_number' => 'PO-' . $orderDate->format('Ymd') . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'supplier_id' => $supplier->id,
                'order_date' => $orderDate,
                'expected_delivery_date' => $expectedDate,
                'status' => $status,
                'notes' => 'Seeded PO untuk testing ' . $i,
                'total_cents' => 0,
            ]);

            $totalCents = 0;

            foreach ($supplierItems as $item) {
                $qty = rand(10, 50);
                $unitPrice = $item->unit_price ?? 10000;
                $receivedQty = 0;
                
                if ($status === 'RECEIVED') {
                    $receivedQty = $qty;
                } else if ($status === 'PARTIAL') {
                    $receivedQty = rand(1, $qty - 1);
                }

                $totalPrice = $qty * $unitPrice;
                $totalCents += $totalPrice;

                PurchaseOrderItem::create([
                    'id' => Str::uuid(),
                    'purchase_order_id' => $po->id,
                    'inventory_item_id' => $item->id,
                    'quantity' => $qty,
                    'received_quantity' => $receivedQty,
                    'unit' => $item->unit ?? 'satuan',
                    'unit_price_cents' => $unitPrice,
                    'total_price_cents' => $totalPrice,
                ]);
            }

            $po->update(['total_cents' => $totalCents]);
        }
    }
}
