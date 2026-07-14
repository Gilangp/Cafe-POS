<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\AccessLog;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function logs(Request $request)
    {
        $query = AuditLog::with('user:id,name,email', 'branch:id,name');

        if ($request->has('auditable_type')) {
            $query->where('auditable_type', 'like', '%' . $request->auditable_type . '%');
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $limit = $request->input('limit', 50);

        return response()->json([
            'data' => $query->orderBy('id', 'desc')->limit($limit)->get()
        ]);
    }

    public function accessLogs(Request $request)
    {
        $query = AccessLog::with('user:id,name,email');

        if ($request->has('status_code')) {
            $query->where('status_code', $request->status_code);
        }

        $limit = $request->input('limit', 50);

        return response()->json([
            'data' => $query->orderBy('id', 'desc')->limit($limit)->get()
        ]);
    }
}
