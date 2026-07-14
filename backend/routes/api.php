<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
        ]);
    });

    // ─── Public Routes ───────────────────────────────────────────────
    Route::get('/menu/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('/menu/items', [App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/menu/items/{product}', [App\Http\Controllers\Api\ProductController::class, 'show']);
    Route::get('/branches/public', [App\Http\Controllers\Api\BranchController::class, 'index']);

    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
        Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);
        Route::post('/forgot-password', [App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);
    });

    // ─── Protected Routes ────────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/auth/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('/auth/refresh', [App\Http\Controllers\Api\AuthController::class, 'refresh']);
        Route::get('/auth/me', [App\Http\Controllers\Api\AuthController::class, 'me']);
        Route::patch('/auth/me', [App\Http\Controllers\Api\AuthController::class, 'updateProfile']);

        // Branches
        Route::apiResource('branches', App\Http\Controllers\Api\BranchController::class);

        // Menu Management (admin CRUD)
        Route::apiResource('categories', App\Http\Controllers\Api\CategoryController::class);
        Route::apiResource('products', App\Http\Controllers\Api\ProductController::class);
        Route::patch('products/{product}/branch-override', [App\Http\Controllers\Api\ProductController::class, 'overrideBranch']);
        Route::apiResource('recipes', App\Http\Controllers\Api\RecipeController::class);
        Route::post('recipes/{recipe}/calculate-cogs', [App\Http\Controllers\Api\RecipeController::class, 'calculateCosting']);

        // Orders
        Route::apiResource('orders', App\Http\Controllers\Api\OrderController::class);
        Route::post('orders/{order}/status', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
        Route::post('orders/{order}/cancel', [App\Http\Controllers\Api\OrderController::class, 'cancel']);

        // Inventory
        Route::apiResource('inventory', App\Http\Controllers\Api\InventoryController::class);
        Route::post('inventory/adjust', [App\Http\Controllers\Api\InventoryController::class, 'adjust']);
        Route::post('inventory/fefo-deduct', [App\Http\Controllers\Api\InventoryController::class, 'fefoDeduct']);
        Route::apiResource('suppliers', App\Http\Controllers\Api\SupplierController::class);
        Route::apiResource('purchase-orders', App\Http\Controllers\Api\PurchaseOrderController::class);
        Route::post('purchase-orders/{purchase_order}/receive', [App\Http\Controllers\Api\PurchaseOrderController::class, 'receive']);

        // Users & Employees
        Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
        Route::apiResource('employees', App\Http\Controllers\Api\EmployeeController::class);

        // CMS
        Route::apiResource('pages', App\Http\Controllers\Api\PageController::class);
        Route::apiResource('posts', App\Http\Controllers\Api\PostController::class);
        Route::apiResource('media', App\Http\Controllers\Api\MediaController::class);

        // POS
        Route::prefix('pos')->group(function () {
            Route::post('/sessions', [App\Http\Controllers\Api\PosController::class, 'openSession']);
            Route::post('/sessions/{session}/close', [App\Http\Controllers\Api\PosController::class, 'closeSession']);
            Route::post('/orders', [App\Http\Controllers\Api\PosController::class, 'createOrder']);
            Route::get('/summary', [App\Http\Controllers\Api\PosController::class, 'summary']);
        });

        // KDS (Kitchen Display System)
        Route::prefix('kds')->group(function () {
            Route::get('/orders', [App\Http\Controllers\Api\KdsController::class, 'activeOrders']);
            Route::patch('/orders/{order}/accept', [App\Http\Controllers\Api\KdsController::class, 'accept']);
            Route::patch('/orders/{order}/ready', [App\Http\Controllers\Api\KdsController::class, 'ready']);
        });

        // Reports
        Route::prefix('reports')->group(function () {
            Route::get('/sales', [App\Http\Controllers\Api\ReportController::class, 'sales']);
            Route::get('/inventory', [App\Http\Controllers\Api\ReportController::class, 'inventory']);
            Route::get('/revenue', [App\Http\Controllers\Api\ReportController::class, 'revenue']);
        });

        // Analytics dashboard
        Route::get('/analytics/dashboard', [App\Http\Controllers\Api\ReportController::class, 'sales']);

        // Settings
        Route::get('/settings', [App\Http\Controllers\Api\SettingController::class, 'index']);
        Route::put('/settings', [App\Http\Controllers\Api\SettingController::class, 'update']);
    });
});
