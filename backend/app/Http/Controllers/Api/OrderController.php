<?php

namespace App\Http\Controllers\Api;

use App\Data\OrderPayload;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(
        protected readonly OrderService $orderService
    ) {
    }

    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'branch']);

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to . ' 23:59:59');
        }

        // Non-admin users only see own orders
        $user = $request->user();
        if ($user && !$user->hasRole('super_admin') && !$user->hasRole('corporate_admin') && !$user->hasRole('branch_manager') && !$user->hasRole('cashier')) {
            $query->where('user_id', $user->id);
        }

        $orders = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        if ($request->has('idempotency_key') && $request->input('idempotency_key')) {
            $existing = Order::withoutGlobalScopes()->where('idempotency_key', $request->input('idempotency_key'))->first();
            if ($existing) {
                return response()->json($existing->load('items.product'), 200);
            }
        }

        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'order_type' => ['required', Rule::in(['dine_in', 'take_away', 'takeaway', 'delivery', 'online'])],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'qris', 'transfer'])],
            'member_id' => 'nullable|exists:members,id',
            'notes' => 'nullable|string|max:500',
            'table_number' => 'nullable|string|max:20',
            'idempotency_key' => 'nullable|string|max:120',
            'points_to_redeem' => 'nullable|integer|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => [
                    'code' => 'VALIDATION_FAILED',
                    'message' => 'The given data was invalid.',
                    'status_code' => 422,
                    'details' => $validator->errors(),
                ],
            ], 422);
        }

        $validated = $validator->validated();

        $payload = new OrderPayload(
            branchId: $validated['branch_id'],
            userId: $request->user()?->id,
            items: collect($validated['items']),
            orderType: $validated['order_type'],
            paymentMethod: $validated['payment_method'],
            memberId: $validated['member_id'] ?? null,
            notes: $validated['notes'] ?? null,
            idempotencyKey: $validated['idempotency_key'] ?? null,
            tableNumber: $validated['table_number'] ?? null,
            kitchenStatus: 'PENDING',
            pointsToRedeem: (int) ($validated['points_to_redeem'] ?? 0)
        );

        $order = $this->orderService->createOrder($payload);

        return response()->json($order->load('items.product'), 201);
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['items.product', 'branch', 'payment']));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
            'table_number' => 'nullable|string|max:20',
        ]);

        $order->update($validated);

        return response()->json($order->load('items.product'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled',
            ])],
        ]);

        $kitchenMap = [
            'preparing' => 'IN_PROGRESS',
            'ready' => 'READY',
            'completed' => 'SERVED',
        ];

        $order->update([
            'status' => $validated['status'],
            'kitchen_status' => $kitchenMap[$validated['status']] ?? $order->kitchen_status,
            'completed_at' => $validated['status'] === 'completed' ? now() : $order->completed_at,
        ]);

        if ($validated['status'] === 'completed') {
            $this->orderService->awardLoyaltyPoints($order);
        }

        try {
            event(new \App\Events\KdsOrderStatusUpdated($order));
        } catch (\Exception $e) {
            // Ignore broadcasting exceptions during testing
        }

        return response()->json($order->load('items.product'));
    }

    public function cancel(Request $request, Order $order)
    {
        if (in_array($order->status, ['completed', 'cancelled'])) {
            return response()->json([
                'error' => [
                    'code' => 'ORDER_NOT_CANCELLABLE',
                    'message' => 'This order cannot be cancelled.',
                    'status_code' => 400,
                ],
            ], 400);
        }

        $order->update([
            'status' => 'cancelled',
            'kitchen_status' => 'CANCELLED',
        ]);

        try {
            event(new \App\Events\KdsOrderStatusUpdated($order));
        } catch (\Exception $e) {
            // Ignore broadcasting exceptions during testing
        }

        return response()->json($order->load('items.product'));
    }

    /**
     * Sync offline queued orders in batch with idempotency checks (POS-002)
     */
    public function batchSync(Request $request)
    {
        $validated = $request->validate([
            'orders' => 'required|array|min:1',
            'orders.*.idempotency_key' => 'required|string|max:120',
            'orders.*.branch_id' => 'required|exists:branches,id',
            'orders.*.order_type' => ['required', Rule::in(['dine_in', 'take_away', 'takeaway', 'delivery', 'online'])],
            'orders.*.payment_method' => ['required', Rule::in(['cash', 'card', 'qris', 'transfer'])],
            'orders.*.table_number' => 'nullable|string|max:20',
            'orders.*.notes' => 'nullable|string|max:500',
            'orders.*.points_to_redeem' => 'nullable|integer|min:0',
            'orders.*.items' => 'required|array|min:1',
            'orders.*.items.*.product_id' => 'required|exists:products,id',
            'orders.*.items.*.quantity' => 'required|integer|min:1',
            'orders.*.items.*.notes' => 'nullable|string',
        ]);

        $results = [];
        $syncedCount = 0;
        $duplicateCount = 0;

        foreach ($validated['orders'] as $orderData) {
            $existing = Order::withoutGlobalScopes()->where('idempotency_key', $orderData['idempotency_key'])->first();
            if ($existing) {
                $results[] = [
                    'idempotency_key' => $orderData['idempotency_key'],
                    'order_id' => $existing->id,
                    'order_number' => $existing->order_number,
                    'sync_status' => 'ALREADY_SYNCED',
                ];
                $duplicateCount++;
                continue;
            }

            $payload = new OrderPayload(
                branchId: $orderData['branch_id'],
                userId: $request->user()?->id,
                items: collect($orderData['items']),
                orderType: $orderData['order_type'],
                paymentMethod: $orderData['payment_method'],
                memberId: $orderData['member_id'] ?? null,
                notes: $orderData['notes'] ?? null,
                idempotencyKey: $orderData['idempotency_key'],
                tableNumber: $orderData['table_number'] ?? null,
                kitchenStatus: 'PENDING',
                pointsToRedeem: (int) ($orderData['points_to_redeem'] ?? 0)
            );

            $order = $this->orderService->createOrder($payload);
            $order->update(['status' => 'confirmed', 'kitchen_status' => 'PENDING']);

            $results[] = [
                'idempotency_key' => $orderData['idempotency_key'],
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'sync_status' => 'SYNCED',
            ];
            $syncedCount++;
        }

        return response()->json([
            'synced_count' => $syncedCount,
            'duplicate_count' => $duplicateCount,
            'results' => $results,
        ], 200);
    }
}