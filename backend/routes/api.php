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

    // ─── Public Endpoints (FASE 3) ───────────────────────────────────
    // 3.1 Landing Page Dinamis
    Route::get('/landing-page', [App\Http\Controllers\Api\LandingPageController::class, 'index']);

    // 3.2 Menu Publik & Detail
    Route::get('/menus', [App\Http\Controllers\Api\PublicMenuController::class, 'index']);
    Route::get('/menus/{slug}', [App\Http\Controllers\Api\PublicMenuController::class, 'show']);
    Route::get('/categories', [App\Http\Controllers\Api\PublicMenuController::class, 'categories']);

    // 3.3 Reservasi Meja Publik
    Route::post('/reservations', [App\Http\Controllers\Api\PublicReservationController::class, 'store']);
    Route::get('/reservations/check', [App\Http\Controllers\Api\PublicReservationController::class, 'check']);

    // 3.4 Artikel & Galeri
    Route::get('/articles', [App\Http\Controllers\Api\PublicArticleController::class, 'index']);
    Route::get('/articles/categories', [App\Http\Controllers\Api\PublicArticleController::class, 'categories']);
    Route::get('/articles/{slug}', [App\Http\Controllers\Api\PublicArticleController::class, 'show']);
    Route::get('/galleries', [App\Http\Controllers\Api\PublicGalleryController::class, 'index']);

    // 3.5 Promo, FAQ, Testimoni & Settings Publik (Bab 28.2)
    Route::get('/promotions', [App\Http\Controllers\Api\LandingPageController::class, 'promotions']);
    Route::get('/faqs', [App\Http\Controllers\Api\LandingPageController::class, 'faqs']);
    Route::get('/testimonials', [App\Http\Controllers\Api\LandingPageController::class, 'testimonials']);
    Route::get('/settings', [App\Http\Controllers\Api\LandingPageController::class, 'settings']);

    // ─── Auth Endpoints (FASE 2) ─────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
    });

    // ─── Protected Endpoints ─────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth profile & logout
        Route::post('/auth/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::post('/auth/refresh', [App\Http\Controllers\Api\AuthController::class, 'refresh']);
        Route::get('/auth/me', [App\Http\Controllers\Api\AuthController::class, 'me']);
        Route::patch('/auth/me', [App\Http\Controllers\Api\AuthController::class, 'updateProfile']);

        // ─── Admin CMS & Media Endpoints (FASE 3.5) ──────────────────
        Route::middleware(['role:Admin,Owner', 'audit'])->prefix('admin')->group(function () {
            // Hero Banners
            Route::apiResource('banners', App\Http\Controllers\Api\AdminBannerController::class);

            // Menus & Categories
            Route::post('menus/{id}/restore', [App\Http\Controllers\Api\AdminMenuController::class, 'restore']);
            Route::apiResource('menus', App\Http\Controllers\Api\AdminMenuController::class);
            Route::apiResource('categories', App\Http\Controllers\Api\AdminCategoryController::class);

            // Promotions
            Route::apiResource('promotions', App\Http\Controllers\Api\AdminPromotionController::class);

            // Articles & Categories
            Route::get('article-categories', [App\Http\Controllers\Api\AdminArticleController::class, 'categories']);
            Route::post('article-categories', [App\Http\Controllers\Api\AdminArticleController::class, 'storeCategory']);
            Route::delete('article-categories/{category}', [App\Http\Controllers\Api\AdminArticleController::class, 'destroyCategory']);
            Route::apiResource('articles', App\Http\Controllers\Api\AdminArticleController::class);

            // Galleries & FAQs
            Route::apiResource('galleries', App\Http\Controllers\Api\AdminGalleryController::class);
            Route::apiResource('faqs', App\Http\Controllers\Api\AdminFaqController::class);

            // Identity Settings & Contact
            Route::get('settings', [App\Http\Controllers\Api\AdminSettingController::class, 'index']);
            Route::put('settings', [App\Http\Controllers\Api\AdminSettingController::class, 'updateSettings']);
            Route::post('social-media', [App\Http\Controllers\Api\AdminSettingController::class, 'storeSocialMedia']);
            Route::put('social-media/{socialMedia}', [App\Http\Controllers\Api\AdminSettingController::class, 'updateSocialMedia']);
            Route::delete('social-media/{socialMedia}', [App\Http\Controllers\Api\AdminSettingController::class, 'destroySocialMedia']);
            Route::post('about-us', [App\Http\Controllers\Api\AdminSettingController::class, 'storeAboutUs']);
            Route::put('about-us/{aboutUs}', [App\Http\Controllers\Api\AdminSettingController::class, 'updateAboutUs']);
            Route::delete('about-us/{aboutUs}', [App\Http\Controllers\Api\AdminSettingController::class, 'destroyAboutUs']);

            // Table Reservations Management
            Route::patch('reservations/{reservation}/status', [App\Http\Controllers\Api\AdminReservationController::class, 'updateStatus']);
            Route::apiResource('reservations', App\Http\Controllers\Api\AdminReservationController::class);

            // Media Upload & Management
            Route::post('media/upload', [App\Http\Controllers\Api\MediaController::class, 'upload']);
            Route::apiResource('media', App\Http\Controllers\Api\MediaController::class);

            // Inventory & Supplier Management
            Route::get('inventories/logs', [App\Http\Controllers\Api\InventoryController::class, 'logs']);
            Route::post('inventories/{inventory}/adjust', [App\Http\Controllers\Api\InventoryController::class, 'adjust']);
            Route::post('inventories/{inventory}/stock-in', [App\Http\Controllers\Api\InventoryController::class, 'stockIn']);
            Route::post('inventories/{inventory}/stock-out', [App\Http\Controllers\Api\InventoryController::class, 'stockOut']);
            Route::apiResource('inventories', App\Http\Controllers\Api\InventoryController::class);
            Route::get('inventory-categories', [App\Http\Controllers\Api\InventoryController::class, 'categories']);
            Route::post('inventory-categories', [App\Http\Controllers\Api\InventoryController::class, 'storeCategory']);
            Route::delete('inventory-categories/{category}', [App\Http\Controllers\Api\InventoryController::class, 'destroyCategory']);
            Route::apiResource('suppliers', App\Http\Controllers\Api\SupplierController::class);

            // Reports & Analytics (Bab 28.6)
            Route::get('reports/sales', [App\Http\Controllers\Api\ReportController::class, 'sales']);
            Route::get('reports/reservations', [App\Http\Controllers\Api\ReportController::class, 'reservations']);
            Route::get('reports/inventory', [App\Http\Controllers\Api\ReportController::class, 'inventory']);
            Route::get('reports/revenue', [App\Http\Controllers\Api\ReportController::class, 'revenue']);
            Route::get('reports/export', [App\Http\Controllers\Api\ReportController::class, 'export']);

            // User & Role Management (Owner/Admin)
            Route::get('roles', [App\Http\Controllers\Api\UserController::class, 'roles']);
            Route::apiResource('users', App\Http\Controllers\Api\UserController::class);

            // System Audit Logs
            Route::get('audit-logs', [App\Http\Controllers\Api\AuditController::class, 'logs']);
        });

        // ─── Owner Specific Endpoints (Bab 28.7) ─────────────────────
        Route::middleware(['role:Owner', 'audit'])->prefix('owner')->group(function () {
            Route::get('/dashboard/summary', [App\Http\Controllers\Api\OwnerController::class, 'summary']);
            Route::get('/dashboard/sales-chart', [App\Http\Controllers\Api\OwnerController::class, 'salesChart']);
            Route::get('/dashboard/top-menus', [App\Http\Controllers\Api\OwnerController::class, 'topMenus']);
            Route::post('/backup', [App\Http\Controllers\Api\OwnerController::class, 'backup']);
            Route::post('/restore', [App\Http\Controllers\Api\OwnerController::class, 'restore']);
            Route::apiResource('users', App\Http\Controllers\Api\UserController::class);
            Route::get('audit-logs', [App\Http\Controllers\Api\AuditController::class, 'logs']);
        });

        // ─── POS Routes (FASE 4.1) ───────────────────────────────────
        Route::middleware(['role:Kasir,Admin,Owner', 'audit'])->prefix('pos')->group(function () {
            Route::get('/menus', [App\Http\Controllers\Api\PosController::class, 'menus']);
            Route::get('/reservations/today', [App\Http\Controllers\Api\PosController::class, 'todayReservations']);
            Route::get('/transactions', [App\Http\Controllers\Api\PosController::class, 'index']);
            Route::post('/transactions', [App\Http\Controllers\Api\PosController::class, 'createOrder']);
            Route::get('/transactions/{id}', [App\Http\Controllers\Api\PosController::class, 'show']);
            Route::patch('/transactions/{id}/void', [App\Http\Controllers\Api\PosController::class, 'voidOrder']);
            Route::get('/summary', [App\Http\Controllers\Api\PosController::class, 'summary']);
        });

        // ─── KDS / Kitchen Display Routes (FASE 4.2) ─────────────────
        Route::middleware(['role:Dapur_Barista,Kasir,Admin,Owner'])->group(function () {
            Route::prefix('kds')->group(function () {
                Route::get('/tickets', [App\Http\Controllers\Api\KdsController::class, 'activeTickets']);
                Route::get('/tickets/{id}', [App\Http\Controllers\Api\KdsController::class, 'show']);
                Route::patch('/tickets/{id}/status', [App\Http\Controllers\Api\KdsController::class, 'updateStatus']);
                Route::patch('/tickets/{ticketId}/items/{itemId}/status', [App\Http\Controllers\Api\KdsController::class, 'updateItemStatus']);
            });

            Route::prefix('kitchen')->group(function () {
                Route::get('/tickets', [App\Http\Controllers\Api\KdsController::class, 'activeTickets']);
                Route::get('/tickets/{id}', [App\Http\Controllers\Api\KdsController::class, 'show']);
                Route::patch('/tickets/{id}/status', [App\Http\Controllers\Api\KdsController::class, 'updateStatus']);
                Route::patch('/tickets/{ticketId}/items/{itemId}/status', [App\Http\Controllers\Api\KdsController::class, 'updateItemStatus']);
            });
        });

        // Reports & Analytics
        Route::middleware(['role:Admin,Owner'])->prefix('reports')->group(function () {
            Route::get('/sales', [App\Http\Controllers\Api\ReportController::class, 'sales']);
            Route::get('/inventory', [App\Http\Controllers\Api\ReportController::class, 'inventory']);
            Route::get('/revenue', [App\Http\Controllers\Api\ReportController::class, 'revenue']);
            Route::get('/reservations', [App\Http\Controllers\Api\ReportController::class, 'reservations']);
            Route::get('/export', [App\Http\Controllers\Api\ReportController::class, 'export']);
        });
    });
});
