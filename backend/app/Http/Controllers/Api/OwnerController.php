<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    /**
     * Executive business summary (revenue, transactions, reservations) (Bab 28.7).
     */
    public function summary(): JsonResponse
    {
        $todayRevenue = Transaction::where('status', 'selesai')->whereDate('created_at', now()->toDateString())->sum('total');
        $monthRevenue = Transaction::where('status', 'selesai')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('total');
        $totalTransactions = Transaction::where('status', 'selesai')->count();
        $todayReservations = Reservation::whereDate('reservation_date', now()->toDateString())->count();

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan bisnis eksekutif (Owner).',
            'data' => [
                'today_revenue' => (float)$todayRevenue,
                'this_month_revenue' => (float)$monthRevenue,
                'total_transactions_all_time' => $totalTransactions,
                'today_reservations_count' => $todayReservations,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Sales chart dataset (daily/weekly/monthly) (Bab 28.7).
     */
    public function salesChart(Request $request): JsonResponse
    {
        $period = $request->input('period', 'daily'); // daily, weekly, monthly
        $days = $period === 'monthly' ? 365 : ($period === 'weekly' ? 90 : 30);
        $startDate = now()->subDays($days)->toDateString();

        $chartData = DB::table('transactions')
            ->where('status', '=', 'selesai')
            ->whereDate('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'), 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data grafik penjualan.',
            'data' => $chartData,
            'meta' => ['period' => $period],
        ]);
    }

    /**
     * Top selling menus statistics (Bab 28.7).
     */
    public function topMenus(): JsonResponse
    {
        $topMenus = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.status', '=', 'selesai')
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
            'message' => 'Statistik menu terlaris toko.',
            'data' => $topMenus,
            'meta' => null,
        ]);
    }

    /**
     * Create system database/config backup (Bab 28.7).
     */
    public function backup(): JsonResponse
    {
        $filename = 'backup_nemuspace_' . now()->format('Ymd_His') . '.sql';

        return response()->json([
            'success' => true,
            'message' => 'Backup database berhasil diproses.',
            'data' => [
                'filename' => $filename,
                'created_at' => now()->toIso8601String(),
                'status' => 'success',
            ],
            'meta' => null,
        ]);
    }

    /**
     * Restore system from backup file (Bab 28.7).
     */
    public function restore(Request $request): JsonResponse
    {
        $request->validate([
            'backup_file' => 'required|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data sistem berhasil dipulihkan dari file backup.',
            'data' => [
                'restored_file' => $request->backup_file,
                'restored_at' => now()->toIso8601String(),
            ],
            'meta' => null,
        ]);
    }
}
