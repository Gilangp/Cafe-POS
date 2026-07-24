<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCorsManual
{
    /**
     * Daftar origin yang diizinkan mengakses API.
     */
    private array $allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://cafe-pos-alpha.vercel.app',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');

        // Tangani preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return $this->buildPreflightResponse($origin);
        }

        /** @var Response $response */
        $response = $next($request);

        return $this->addCorsHeaders($response, $origin);
    }

    private function buildPreflightResponse(?string $origin): Response
    {
        $response = response('', 200);
        $this->addCorsHeaders($response, $origin);
        $response->headers->set('Access-Control-Max-Age', '86400');
        return $response;
    }

    private function addCorsHeaders(Response $response, ?string $origin): Response
    {
        if ($origin && in_array($origin, $this->allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } else {
            // Di development, izinkan semua origin localhost
            $response->headers->set('Access-Control-Allow-Origin', $origin ?? '*');
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'false');
        $response->headers->set('Vary', 'Origin');

        return $response;
    }
}
