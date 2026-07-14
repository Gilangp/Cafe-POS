<?php

namespace App\Http\Controllers\Api;

use App\Data\OrderPayload;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PosSession;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PosController extends Controller
{
    public function __construct(
        protected readonly OrderService $orderService
    ) {
    }

    /**
     * Open a new POS shift/session
     */
    public function openSession(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'opening_cash' => 'required|numeric|min:0',
        ]);

        // Close any existing open sessions for this user
        PosSession::where('user_id', $request->user()->id)
            ->whereNull('closed_at')
            ->update(['closed_at' => now()]);

        $session = PosSession::create([
            'branch_id' => $validated['branch_id'],
            'user_id' => $request->user()->id,
            'opening_cash' => $validated['opening_cash'],
            'opened_at' => now(),
        ]);

        return response()->json($session, 201);
    }

    /**
     * Close a POS shift/session
     */
    public function closeSession(Request $request, PosSession $session)
    {
        if ($session->closed_at) {
            return response()->json([
                'error' => [
                    'code' => 'SESSION_ALREADY_CLOSED',
                    'message' => 'This session is already closed.',
                    'status_code' => 400,
                ],
            ], 400);
        }

        $validated = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $session->update([
            'closing_cash' => $validated['closing_cash'],
            'notes' => $validated['notes'] ?? null,
            'closed_at' => now(),
        ]);

        return response()->json($session);
    }

    /**
     * Create an in-store order via POS
     */
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'order_type' => ['required', Rule::in(['dine_in', 'take_away'])],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'qris'])],
            'table_number' => 'nullable|string|max:20',
            'customer_name' => 'nullable|string|max:255',
            'member_id' => 'nullable|exists:members,id',
            'notes' => 'nullable|string|max:500',
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
            userId: $request->user()->id,
            items: collect($validated['items']),
            orderType: $validated['order_type'],
            paymentMethod: $validated['payment_method'],
            memberId: $validated['member_id'] ?? null,
            notes: $validated['notes'] ?? null
        );

        $order = $this->orderService->createOrder($payload);

        if (isset($validated['table_number'])) {
            $order->update(['table_number' => $validated['table_number']]);
        }
        if (isset($validated['customer_name'])) {
            $order->update(['customer_name' => $validated['customer_name']]);
        }

        return response()->json($order->load('items.product'), 201);
    }

    /**
     * Get POS shift summary
     */
    public function summary(Request $request)
    {
        $session = PosSession::where('user_id', $request->user()->id)
            ->whereNull('closed_at')
            ->latest()
            ->first();

        if (!$session) {
            return response()->json([
                'error' => [
                    'code' => 'NO_ACTIVE_SESSION',
                    'message' => 'No active POS session found.',
                    'status_code' => 404,
                ],
            ], 404);
        }

        $orders = Order::where('branch_id', $session->branch_id)
            ->where('created_at', '>=', $session->opened_at)
            ->where('user_id', $session->user_id)
            ->get();

        return response()->json([
            'session' => $session,
            'total_orders' => $orders->count(),
            'total_sales' => $orders->where('status', '!=', 'cancelled')->sum('total'),
            'cash_sales' => $orders->where('payment_method', 'cash')->where('status', '!=', 'cancelled')->sum('total'),
            'card_sales' => $orders->where('payment_method', 'card')->where('status', '!=', 'cancelled')->sum('total'),
            'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
        ]);
    }
}
