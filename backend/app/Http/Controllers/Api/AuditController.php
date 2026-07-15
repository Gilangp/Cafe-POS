<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * Get system audit logs with filtering options (user, module, action).
     */
    public function logs(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email');

        if ($request->filled('module')) {
            $query->where('module', 'like', '%' . $request->module . '%');
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $limit = (int) $request->input('limit', 50);
        $logs = $query->latest()->limit($limit)->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar audit log sistem.',
            'data' => $logs,
            'meta' => [
                'total' => $logs->count(),
            ],
        ]);
    }
}
