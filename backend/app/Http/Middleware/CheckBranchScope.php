<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBranchScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => [
                    'code' => 'UNAUTHORIZED',
                    'message' => 'Authentication required to access branch-scoped resource.',
                    'status_code' => 401,
                ],
            ], 401);
        }

        // Determine target branch_id from header, payload, or route parameter
        $branchId = $request->header('X-Branch-Id')
            ?? $request->input('branch_id')
            ?? $request->route('branch')
            ?? $request->route('branch_id');

        // If route model binding passed a Branch object
        if (is_object($branchId) && isset($branchId->id)) {
            $branchId = $branchId->id;
        }

        if ($branchId !== null && !$user->canAccessBranch((int) $branchId)) {
            return response()->json([
                'error' => [
                    'code' => 'SCOPE_VIOLATION',
                    'message' => "Access denied to branch #{$branchId}. Outside of your assigned branch scope.",
                    'status_code' => 403,
                ],
            ], 403);
        }

        if ($branchId !== null) {
            $request->attributes->set('scoped_branch_id', (int) $branchId);
        }

        return $next($request);
    }
}
