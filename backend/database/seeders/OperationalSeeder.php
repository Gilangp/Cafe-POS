<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OperationalSeeder extends Seeder
{
    public function run(): void
    {
        $branchId = DB::table('branches')->where('code', 'HQ')->value('id')
            ?? DB::table('branches')->value('id');
        $adminId = DB::table('users')->where('email', 'admin@velvra.test')->value('id')
            ?? DB::table('users')->value('id');

        if (!$branchId || !$adminId) {
            $this->command->warn('OperationalSeeder skipped: branch/admin missing.');
            return;
        }

        $this->seedSuppliers();
        $this->seedInventoryItems($branchId);
        $this->seedRecipes($branchId);
        $this->seedBranchProducts($branchId);
        $this->seedMembers($branchId);
        $this->seedReservations($branchId);
        $this->seedOrders($branchId, $adminId);
        $this->seedPurchaseOrders($branchId, $adminId);
        $this->seedPosSessions($branchId, $adminId);
        $this->seedLogs($branchId, $adminId);

        $this->command->info('Operational seed data ready.');
    }

    private function seedSuppliers(): void
    {
        $suppliers = [
            ['name' => 'Nusantara Coffee Roasters', 'code' => 'SUP-COFFEE', 'contact_person' => 'Raka Pratama', 'email' => 'sales@nusantararoast.test', 'phone' => '0812-1000-1000', 'address' => 'Bandung, Jawa Barat'],
            ['name' => 'Fresh Dairy Indonesia', 'code' => 'SUP-DAIRY', 'contact_person' => 'Maya Lestari', 'email' => 'order@freshdairy.test', 'phone' => '0812-2000-2000', 'address' => 'Bogor, Jawa Barat'],
            ['name' => 'Urban Bakery Supply', 'code' => 'SUP-BAKERY', 'contact_person' => 'Dian Saputra', 'email' => 'hello@urbanbakery.test', 'phone' => '0812-3000-3000', 'address' => 'Jakarta Selatan'],
        ];

        foreach ($suppliers as $supplier) {
            DB::table('suppliers')->updateOrInsert(
                ['code' => $supplier['code']],
                array_merge($supplier, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    private function seedInventoryItems(int $branchId): void
    {
        $items = [
            ['name' => 'Arabica Beans', 'sku' => 'INV-BEAN-ARABICA', 'description' => 'House blend arabica coffee beans', 'unit' => 'gram', 'quantity' => 50000, 'min_quantity' => 10000, 'unit_cost' => 0.18],
            ['name' => 'Fresh Milk', 'sku' => 'INV-MILK-FRESH', 'description' => 'Pasteurized fresh milk', 'unit' => 'ml', 'quantity' => 80000, 'min_quantity' => 15000, 'unit_cost' => 0.02],
            ['name' => 'Caramel Syrup', 'sku' => 'INV-SYR-CARAMEL', 'description' => 'House caramel syrup', 'unit' => 'ml', 'quantity' => 12000, 'min_quantity' => 3000, 'unit_cost' => 0.05],
            ['name' => 'Sourdough Bread', 'sku' => 'INV-BRD-SOURDOUGH', 'description' => 'Sliced sourdough bread', 'unit' => 'slice', 'quantity' => 300, 'min_quantity' => 60, 'unit_cost' => 2500],
            ['name' => 'Mushroom Mix', 'sku' => 'INV-VEG-MUSHROOM', 'description' => 'Mixed button and shimeji mushrooms', 'unit' => 'gram', 'quantity' => 15000, 'min_quantity' => 3000, 'unit_cost' => 0.12],
        ];

        foreach ($items as $item) {
            DB::table('inventory_items')->updateOrInsert(
                ['sku' => $item['sku']],
                array_merge($item, ['branch_id' => $branchId, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        foreach (DB::table('inventory_items')->where('branch_id', $branchId)->get() as $item) {
            DB::table('inventory_transactions')->updateOrInsert(
                ['inventory_item_id' => $item->id, 'type' => 'OPENING_BALANCE', 'reference_type' => 'Seeder'],
                [
                    'branch_id' => $branchId,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'unit_cost_cents' => (int) round(((float) $item->unit_cost) * 100),
                    'reference_id' => null,
                    'notes' => 'Initial stock from seeder',
                    'created_by' => DB::table('users')->where('email', 'admin@velvra.test')->value('id'),
                    'created_at' => now(),
                ]
            );
        }
    }

    private function seedRecipes(int $branchId): void
    {
        $recipes = [
            'Velvra Signature Latte' => [
                'yield_unit' => 'cup',
                'instructions' => 'Extract espresso, steam milk, add caramel syrup, serve warm.',
                'ingredients' => [
                    'INV-BEAN-ARABICA' => [18, 'gram'],
                    'INV-MILK-FRESH' => [220, 'ml'],
                    'INV-SYR-CARAMEL' => [20, 'ml'],
                ],
            ],
            'Truffle Mushroom Toast' => [
                'yield_unit' => 'portion',
                'instructions' => 'Toast sourdough, saute mushrooms, finish with herbs.',
                'ingredients' => [
                    'INV-BRD-SOURDOUGH' => [2, 'slice'],
                    'INV-VEG-MUSHROOM' => [120, 'gram'],
                ],
            ],
        ];

        foreach ($recipes as $name => $recipe) {
            DB::table('recipes')->updateOrInsert(
                ['branch_id' => $branchId, 'name' => $name],
                [
                    'yield_quantity' => 1,
                    'yield_unit' => $recipe['yield_unit'],
                    'instructions' => $recipe['instructions'],
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $recipeId = DB::table('recipes')->where('branch_id', $branchId)->where('name', $name)->value('id');
            foreach ($recipe['ingredients'] as $sku => [$quantity, $unit]) {
                $inventoryItemId = DB::table('inventory_items')->where('sku', $sku)->value('id');
                if ($recipeId && $inventoryItemId) {
                    DB::table('recipe_ingredients')->updateOrInsert(
                        ['recipe_id' => $recipeId, 'inventory_item_id' => $inventoryItemId],
                        ['quantity' => $quantity, 'unit' => $unit, 'created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }
    }

    private function seedBranchProducts(int $branchId): void
    {
        foreach (DB::table('products')->get() as $product) {
            DB::table('branch_products')->updateOrInsert(
                ['branch_id' => $branchId, 'product_id' => $product->id],
                [
                    'price' => $product->base_price,
                    'is_available' => true,
                    'stock_quantity' => 100,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function seedMembers(int $branchId): void
    {
        $bronze = DB::table('membership_tiers')->where('name', 'Bronze')->value('id');
        $silver = DB::table('membership_tiers')->where('name', 'Silver')->value('id');

        $members = [
            ['member_code' => 'MBR-0001', 'full_name' => 'Alya Mahendra', 'email' => 'alya@example.test', 'phone' => '081234567001', 'membership_tier_id' => $silver, 'points_balance' => 1250, 'lifetime_spend_cents' => 175000000],
            ['member_code' => 'MBR-0002', 'full_name' => 'Bimo Santoso', 'email' => 'bimo@example.test', 'phone' => '081234567002', 'membership_tier_id' => $bronze, 'points_balance' => 320, 'lifetime_spend_cents' => 42000000],
        ];

        foreach ($members as $member) {
            DB::table('members')->updateOrInsert(
                ['member_code' => $member['member_code']],
                array_merge($member, ['branch_id' => $branchId, 'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    private function seedReservations(int $branchId): void
    {
        $memberId = DB::table('members')->where('member_code', 'MBR-0001')->value('id');

        DB::table('reservations')->updateOrInsert(
            ['reservation_code' => 'RSV-0001'],
            [
                'branch_id' => $branchId,
                'member_id' => $memberId,
                'customer_name' => 'Alya Mahendra',
                'customer_phone' => '081234567001',
                'customer_email' => 'alya@example.test',
                'reservation_date' => now()->addDay()->toDateString(),
                'reservation_time' => '19:00:00',
                'party_size' => 4,
                'table_number' => 'T-05',
                'special_requests' => 'Near window seat if available.',
                'status' => 'CONFIRMED',
                'deposit_cents' => 10000000,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    private function seedOrders(int $branchId, int $adminId): void
    {
        $product = DB::table('products')->first();
        if (!$product) {
            return;
        }

        DB::table('orders')->updateOrInsert(
            ['order_number' => 'ORD-0001'],
            [
                'branch_id' => $branchId,
                'user_id' => $adminId,
                'customer_name' => 'Alya Mahendra',
                'customer_email' => 'alya@example.test',
                'customer_phone' => '081234567001',
                'order_type' => 'dine_in',
                'status' => 'completed',
                'payment_status' => 'paid',
                'payment_method' => 'cash',
                'subtotal' => $product->base_price * 2,
                'tax' => 0,
                'discount' => 0,
                'total' => $product->base_price * 2,
                'notes' => 'Seeder sample order',
                'table_number' => 'T-05',
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $orderId = DB::table('orders')->where('order_number', 'ORD-0001')->value('id');
        DB::table('order_items')->updateOrInsert(
            ['order_id' => $orderId, 'product_id' => $product->id],
            [
                'quantity' => 2,
                'price' => $product->base_price,
                'subtotal' => $product->base_price * 2,
                'notes' => 'Less sugar',
                'modifiers' => json_encode(['sugar' => 'less']),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('payments')->updateOrInsert(
            ['order_id' => $orderId, 'provider_transaction_id' => 'PAY-ORD-0001'],
            [
                'method' => 'CASH',
                'provider' => 'manual',
                'status' => 'PAID',
                'amount_cents' => (int) round(($product->base_price * 2) * 100),
                'paid_at' => now(),
                'failure_reason' => null,
                'raw_response' => json_encode(['source' => 'seeder']),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $memberId = DB::table('members')->where('member_code', 'MBR-0001')->value('id');
        if ($memberId) {
            DB::table('loyalty_transactions')->updateOrInsert(
                ['member_id' => $memberId, 'order_id' => $orderId, 'type' => 'EARN'],
                [
                    'points' => 84,
                    'description' => 'Points earned from ORD-0001',
                    'expires_at' => now()->addYear(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    private function seedPurchaseOrders(int $branchId, int $adminId): void
    {
        $supplierId = DB::table('suppliers')->where('code', 'SUP-COFFEE')->value('id');
        $inventoryItemId = DB::table('inventory_items')->where('sku', 'INV-BEAN-ARABICA')->value('id');
        if (!$supplierId || !$inventoryItemId) {
            return;
        }

        DB::table('purchase_orders')->updateOrInsert(
            ['po_number' => 'PO-0001'],
            [
                'branch_id' => $branchId,
                'supplier_id' => $supplierId,
                'order_date' => now()->toDateString(),
                'expected_delivery_date' => now()->addDays(3)->toDateString(),
                'status' => 'APPROVED',
                'total_cents' => 9000000,
                'notes' => 'Monthly coffee bean replenishment',
                'created_by' => $adminId,
                'approved_by' => $adminId,
                'approved_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $poId = DB::table('purchase_orders')->where('po_number', 'PO-0001')->value('id');
        DB::table('purchase_order_items')->updateOrInsert(
            ['purchase_order_id' => $poId, 'inventory_item_id' => $inventoryItemId],
            [
                'quantity' => 50000,
                'unit' => 'gram',
                'unit_price_cents' => 1800,
                'total_price_cents' => 9000000,
                'received_quantity' => 50000,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    private function seedPosSessions(int $branchId, int $adminId): void
    {
        DB::table('pos_sessions')->updateOrInsert(
            ['session_number' => 'POS-SESSION-0001'],
            [
                'branch_id' => $branchId,
                'user_id' => $adminId,
                'opened_at' => now()->subHours(4),
                'closed_at' => now()->subHour(),
                'opening_cash_cents' => 50000000,
                'closing_cash_cents' => 58400000,
                'expected_cash_cents' => 58400000,
                'total_sales_cents' => 8400000,
                'total_transactions' => 1,
                'status' => 'CLOSED',
                'notes' => 'Seeder sample POS session',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    private function seedLogs(int $branchId, int $adminId): void
    {
        DB::table('audit_logs')->insertOrIgnore([
            'branch_id' => $branchId,
            'user_id' => $adminId,
            'auditable_type' => 'Seeder',
            'auditable_id' => 1,
            'action' => 'SEED',
            'old_values' => null,
            'new_values' => json_encode(['status' => 'baseline seeded']),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'artisan db:seed',
            'created_at' => now(),
        ]);

        DB::table('access_logs')->insertOrIgnore([
            'user_id' => $adminId,
            'method' => 'GET',
            'path' => '/api/v1/health',
            'status_code' => 200,
            'duration_ms' => 12,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder',
            'created_at' => now(),
        ]);
    }
}