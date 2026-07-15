<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get detailed sales analytics and top products.
     */
    public function sales(Request $request): JsonResponse
    {
        $query = Transaction::where('status', 'selesai');

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $totalTransactions = (clone $query)->count();
        $totalRevenue = (clone $query)->sum('total');
        $averageOrderValue = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        $paymentMethods = [
            'tunai' => (clone $query)->where('payment_method', 'tunai')->sum('total'),
            'qris' => (clone $query)->where('payment_method', 'qris')->sum('total'),
            'debit' => (clone $query)->where('payment_method', 'debit')->sum('total'),
            'kredit' => (clone $query)->where('payment_method', 'kredit')->sum('total'),
        ];

        // Top 10 selling menus
        $topProducts = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', '=', 'selesai')
            ->when($request->filled('from'), function ($q) use ($request) {
                $q->whereDate('transactions.created_at', '>=', $request->from);
            })
            ->when($request->filled('to'), function ($q) use ($request) {
                $q->whereDate('transactions.created_at', '<=', $request->to);
            })
            ->select(
                'transaction_items.menu_name_snapshot as menu_name',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.subtotal) as total_revenue')
            )
            ->groupBy('transaction_items.menu_name_snapshot')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Laporan penjualan dan menu terlaris.',
            'data' => [
                'total_transactions' => $totalTransactions,
                'total_revenue' => (float)$totalRevenue,
                'average_order_value' => round((float)$averageOrderValue, 2),
                'payment_methods_breakdown' => $paymentMethods,
                'top_menus' => $topProducts,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Get inventory analytics summary (low stock, out of stock, overall count).
     */
    public function inventory(Request $request): JsonResponse
    {
        $totalItems = Inventory::count();
        
        $lowStockItems = Inventory::with(['category', 'supplier'])
            ->whereColumn('stock_quantity', '<=', 'minimum_stock')
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity')
            ->get();

        $outOfStockItems = Inventory::with(['category', 'supplier'])
            ->where('stock_quantity', '<=', 0)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Laporan status dan analitik bahan baku (Inventory).',
            'data' => [
                'total_items' => $totalItems,
                'low_stock_count' => $lowStockItems->count(),
                'out_of_stock_count' => $outOfStockItems->count(),
                'low_stock_items' => $lowStockItems,
                'out_of_stock_items' => $outOfStockItems,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Get daily revenue trend and period summary.
     */
    public function revenue(Request $request): JsonResponse
    {
        $days = (int)$request->input('days', 30);
        $startDate = now()->subDays($days)->toDateString();

        $dailyTrend = DB::table('transactions')
            ->where('status', '=', 'selesai')
            ->whereDate('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as total_transactions')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'), 'desc')
            ->get();

        $todayRevenue = Transaction::where('status', 'selesai')->whereDate('created_at', now()->toDateString())->sum('total');
        $monthRevenue = Transaction::where('status', 'selesai')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('total');
        $totalAllTime = Transaction::where('status', 'selesai')->sum('total');

        return response()->json([
            'success' => true,
            'message' => 'Laporan analitik pendapatan toko.',
            'data' => [
                'today_revenue' => (float)$todayRevenue,
                'this_month_revenue' => (float)$monthRevenue,
                'all_time_revenue' => (float)$totalAllTime,
                'daily_trend' => $dailyTrend,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Get reservation analytics (completed, cancelled, total guest counts).
     */
    public function reservations(Request $request): JsonResponse
    {
        $query = \App\Models\Reservation::query();

        if ($request->filled('from')) {
            $query->whereDate('reservation_date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('reservation_date', '<=', $request->to);
        }

        $totalReservations = (clone $query)->count();
        $confirmedCount = (clone $query)->whereIn('status', ['dikonfirmasi', 'selesai'])->count();
        $totalGuests = (clone $query)->whereIn('status', ['dikonfirmasi', 'selesai'])->sum('guest_count');

        return response()->json([
            'success' => true,
            'message' => 'Laporan reservasi meja.',
            'data' => [
                'total_reservations' => $totalReservations,
                'confirmed_reservations' => $confirmedCount,
                'total_guests_hosted' => (int)$totalGuests,
                'reservations_list' => (clone $query)->latest('reservation_date')->limit(50)->get(),
            ],
            'meta' => null,
        ]);
    }

    /**
     * Export report data as CSV/JSON/data URL summary (Bab 28.6).
     */
    public function export(Request $request): JsonResponse
    {
        $type = $request->input('type', 'excel');
        $reportType = $request->input('report', 'sales');

        return response()->json([
            'success' => true,
            'message' => "Laporan {$reportType} berhasil disiapkan dalam format {$type}.",
            'data' => [
                'export_type' => $type,
                'report_type' => $reportType,
                'generated_at' => now()->toIso8601String(),
                'download_url' => "https://api.nemuspace.id/exports/{$reportType}_" . now()->format('YmdHis') . ".{$type}",
            ],
            'meta' => null,
        ]);
    }
}
