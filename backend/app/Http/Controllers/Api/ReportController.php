<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $query = Order::query();

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to . ' 23:59:59');
        }

        $totalOrders = (clone $query)->count();
        $totalSales = (clone $query)->where('status', 'completed')->sum('total');
        $completedOrders = (clone $query)->where('status', 'completed')->count();
        $averageOrderValue = $completedOrders > 0 ? $totalSales / $completedOrders : 0;

        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->select(
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'total_sales' => round($totalSales, 2),
                'average_order_value' => round($averageOrderValue, 2),
                'top_products' => $topProducts,
            ],
        ]);
    }

    public function inventory(Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $query = InventoryItem::query();

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $lowStockItems = (clone $query)
            ->whereColumn('quantity', '<=', 'reorder_point')
            ->where('quantity', '>', 0)
            ->orderBy('quantity')
            ->get(['id', 'name', 'quantity', 'reorder_point', 'unit']);

        $outOfStockItems = (clone $query)
            ->where('quantity', '<=', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'quantity', 'unit']);

        $totalItems = (clone $query)->count();
        $totalValue = (clone $query)->selectRaw('SUM(quantity * unit_cost) as total')->value('total') ?? 0;

        return response()->json([
            'data' => [
                'total_items' => $totalItems,
                'total_value' => round($totalValue, 2),
                'low_stock_items' => $lowStockItems,
                'out_of_stock_items' => $outOfStockItems,
            ],
        ]);
    }

    public function revenue(Request $request)
    {
        $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'period' => 'nullable|in:daily,weekly,monthly',
        ]);

        $period = $request->input('period', 'daily');

        $query = Order::where('status', 'completed');

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $totalRevenue = (clone $query)->sum('total');

        $dateFormat = match ($period) {
            'weekly' => 'YYYY-IW',
            'monthly' => 'YYYY-MM',
            default => 'YYYY-MM-DD',
        };

        $revenueByPeriod = (clone $query)
            ->select(
                DB::raw("TO_CHAR(created_at, '{$dateFormat}') as period"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('period')
            ->orderBy('period', 'desc')
            ->limit(30)
            ->get();

        $revenueByBranch = (clone $query)
            ->join('branches', 'orders.branch_id', '=', 'branches.id')
            ->select(
                'branches.name as branch_name',
                DB::raw('SUM(orders.total) as revenue'),
                DB::raw('COUNT(orders.id) as orders')
            )
            ->groupBy('branches.id', 'branches.name')
            ->orderByDesc('revenue')
            ->get();

        return response()->json([
            'data' => [
                'total_revenue' => round($totalRevenue, 2),
                'revenue_by_period' => $revenueByPeriod,
                'revenue_by_branch' => $revenueByBranch,
            ],
        ]);
    }
}
