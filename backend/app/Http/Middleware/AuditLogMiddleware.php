<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request and record mutations (POST, PUT, PATCH, DELETE) by authenticated users.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log mutation requests performed by logged-in users
        if (in_array(strtoupper($request->method()), ['POST', 'PUT', 'PATCH', 'DELETE']) && $request->user()) {
            try {
                $user = $request->user();
                $action = strtoupper($request->method()) . ' ' . $request->path();
                
                // Extract clean module name from path segments (e.g., /api/v1/pos/transactions -> pos/transactions)
                $segment2 = $request->segment(2); // v1
                $segment3 = $request->segment(3); // pos or admin
                $segment4 = $request->segment(4); // transactions or menus
                
                $module = trim(($segment3 ?? '') . ($segment4 ? '/' . $segment4 : ''), '/');
                if (empty($module)) {
                    $module = $request->path();
                }

                $payload = $request->except(['password', 'password_confirmation', 'token', 'secret']);
                $description = "Status HTTP: {$response->getStatusCode()}. ";
                if (!empty($payload)) {
                    $description .= "Payload: " . json_encode($payload, JSON_UNESCAPED_UNICODE);
                }
                
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => substr($action, 0, 100),
                    'module' => substr($module, 0, 50),
                    'description' => substr($description, 0, 1000),
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                // Ensure logging failure does not disrupt the main HTTP response
                Log::error('AuditLogMiddleware exception: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
