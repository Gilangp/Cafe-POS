<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class KdsController extends Controller
{
    /**
     * Get active kitchen orders (not completed/cancelled)
     */
    public function activeOrders(Request $request)
    {
        $query = Order::with(['items.product', 'branch'])
            ->whereIn('status', ['confirmed', 'preparing'])
            ->orderBy('created_at', 'asc');

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $orders = $query->get()->map(function ($order) {
            $order->elapsed_minutes = now()->diffInMinutes($order->created_at);
            return $order;
        });

        return response()->json([
            'data' => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * Accept/start preparing an order
     */
    public function accept(Request $request, Order $order)
    {
        if ($order->status !== 'confirmed') {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_STATUS_TRANSITION',
                    'message' => 'Only confirmed orders can be accepted.',
                    'status_code' => 400,
                ],
            ], 400);
        }

        $order->update([
            'status' => 'preparing',
            'kitchen_status' => 'IN_PROGRESS',
        ]);

        try {
            event(new \App\Events\KdsOrderStatusUpdated($order));
        } catch (\Exception $e) {
            // Ignore broadcasting errors during offline/testing
        }

        return response()->json($order->load('items.product'));
    }

    /**
     * Mark an order as ready for pickup
     */
    public function ready(Request $request, Order $order)
    {
        if ($order->status !== 'preparing') {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_STATUS_TRANSITION',
                    'message' => 'Only orders being prepared can be marked as ready.',
                    'status_code' => 400,
                ],
            ], 400);
        }

        $order->update([
            'status' => 'ready',
            'kitchen_status' => 'READY',
        ]);

        try {
            event(new \App\Events\KdsOrderStatusUpdated($order));
        } catch (\Exception $e) {
            // Ignore broadcasting errors during offline/testing
        }

        return response()->json($order->load('items.product'));
    }
}
