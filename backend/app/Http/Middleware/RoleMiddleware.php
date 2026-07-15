<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request and check if user has any of the required roles.
     * Supports multi-role users (e.g., staff who has both Kasir and Dapur_Barista roles).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Autentikasi diperlukan. Silakan login terlebih dahulu.',
                'data' => null,
                'meta' => null,
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi Administrator.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        // Flatten roles if passed separated by comma or pipe within single string arguments
        $parsedRoles = [];
        foreach ($roles as $r) {
            $split = preg_split('/[,|]/', $r, -1, PREG_SPLIT_NO_EMPTY);
            $parsedRoles = array_merge($parsedRoles, array_map('trim', $split));
        }

        // Check multi-role authorization
        if (!$user->hasRole($parsedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki otorisasi peran (' . implode('/', $parsedRoles) . ') untuk mengakses modul ini.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        return $next($request);
    }
}
