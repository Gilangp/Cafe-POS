<?php

use App\Http\Controllers\Api\AdminArticleController;
use App\Http\Controllers\Api\AdminBannerController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminFaqController;
use App\Http\Controllers\Api\AdminGalleryController;
use App\Http\Controllers\Api\AdminMenuController;
use App\Http\Controllers\Api\AdminPromotionController;
use App\Http\Controllers\Api\AdminReservationController;
use App\Http\Controllers\Api\AdminSettingController;
use App\Http\Controllers\Api\AdminVariantController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\KdsController;
use App\Http\Controllers\Api\LandingPageController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\OwnerController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\PublicArticleController;
use App\Http\Controllers\Api\PublicGalleryController;
use App\Http\Controllers\Api\PublicMenuController;
use App\Http\Controllers\Api\PublicReservationController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitConversionController;
use App\Http\Controllers\Api\UserController;
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
    Route::get('/landing-page', [LandingPageController::class, 'index']);

    // 3.2 Menu Publik & Detail
    Route::get('/menus', [PublicMenuController::class, 'index']);
    Route::get('/menus/{slug}', [PublicMenuController::class, 'show']);
    Route::get('/categories', [PublicMenuController::class, 'categories']);

    // 3.3 Reservasi Meja Publik
    Route::post('/reservations', [PublicReservationController::class, 'store']);
    Route::get('/reservations/check', [PublicReservationController::class, 'check']);

    // 3.4 Artikel & Galeri
    Route::get('/articles', [PublicArticleController::class, 'index']);
    Route::get('/articles/categories', [PublicArticleController::class, 'categories']);
    Route::get('/articles/{slug}', [PublicArticleController::class, 'show']);
    Route::get('/galleries', [PublicGalleryController::class, 'index']);

    // 3.5 Promo, FAQ, Testimoni & Settings Publik (Bab 28.2)
    Route::get('/promotions', [LandingPageController::class, 'promotions']);
    Route::get('/faqs', [LandingPageController::class, 'faqs']);
    Route::get('/testimonials', [LandingPageController::class, 'testimonials']);
    Route::post('/testimonials', [LandingPageController::class, 'storeTestimonial']);
    Route::get('/settings', [LandingPageController::class, 'settings']);

    // ─── Auth Endpoints (FASE 2) ─────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

    // ─── Protected Endpoints ─────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth profile & logout
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::patch('/auth/me', [AuthController::class, 'updateProfile']);

        // ─── Admin CMS & Media Endpoints (FASE 3.5) ──────────────────
        Route::middleware(['role:Admin,Owner', 'audit'])->prefix('admin')->group(function () {
            // Hero Banners
            Route::apiResource('banners', AdminBannerController::class);

            // Menus & Categories
            Route::post('menus/{id}/restore', [AdminMenuController::class, 'restore']);
            Route::apiResource('menus', AdminMenuController::class);
            Route::apiResource('categories', AdminCategoryController::class);
            Route::apiResource('variants', AdminVariantController::class);

            // Promotions
            Route::apiResource('promotions', AdminPromotionController::class);

            // Articles & Categories
            Route::get('article-categories', [AdminArticleController::class, 'categories']);
            Route::post('article-categories', [AdminArticleController::class, 'storeCategory']);
            Route::delete('article-categories/{category}', [AdminArticleController::class, 'destroyCategory']);
            Route::apiResource('articles', AdminArticleController::class);

            // Galleries & FAQs
            Route::apiResource('galleries', AdminGalleryController::class);
            Route::apiResource('faqs', AdminFaqController::class);

            // Identity Settings & Contact
            Route::get('settings', [AdminSettingController::class, 'index']);
            Route::put('settings', [AdminSettingController::class, 'updateSettings']);
            Route::post('social-media', [AdminSettingController::class, 'storeSocialMedia']);
            Route::put('social-media/{socialMedia}', [AdminSettingController::class, 'updateSocialMedia']);
            Route::delete('social-media/{socialMedia}', [AdminSettingController::class, 'destroySocialMedia']);
            Route::post('about-us', [AdminSettingController::class, 'storeAboutUs']);
            Route::put('about-us/{aboutUs}', [AdminSettingController::class, 'updateAboutUs']);
            Route::delete('about-us/{aboutUs}', [AdminSettingController::class, 'destroyAboutUs']);

            // Table Reservations Management
            Route::get('reservations/tables', [AdminReservationController::class, 'tables']);
            Route::patch('reservations/{reservation}/status', [AdminReservationController::class, 'updateStatus']);
            Route::apiResource('reservations', AdminReservationController::class);

            // Media Upload & Management
            Route::post('media/upload', [MediaController::class, 'upload']);
            Route::apiResource('media', MediaController::class);

            // Inventory & Supplier Management
            Route::get('inventories/logs', [InventoryController::class, 'logs']);
            Route::post('inventories/{inventory}/adjust', [InventoryController::class, 'adjust']);
            Route::post('inventories/{inventory}/stock-in', [InventoryController::class, 'stockIn']);
            Route::post('inventories/{inventory}/stock-out', [InventoryController::class, 'stockOut']);
            Route::apiResource('inventories', InventoryController::class);
            Route::get('inventory-categories', [InventoryController::class, 'categories']);
            Route::post('inventory-categories', [InventoryController::class, 'storeCategory']);
            Route::delete('inventory-categories/{category}', [InventoryController::class, 'destroyCategory']);
            Route::apiResource('suppliers', SupplierController::class);
            Route::apiResource('unit-conversions', UnitConversionController::class);
            Route::apiResource('purchase-orders', PurchaseOrderController::class);
            Route::post('purchase-orders/{purchase_order}/receive', [PurchaseOrderController::class, 'receive']);
            Route::post('purchase-orders/{purchase_order}/cancel', [PurchaseOrderController::class, 'cancel']);

            // Reports & Analytics (Bab 28.6)
            Route::get('reports/sales', [ReportController::class, 'sales']);
            Route::get('reports/reservations', [ReportController::class, 'reservations']);
            Route::get('reports/inventory', [ReportController::class, 'inventory']);
            Route::get('reports/revenue', [ReportController::class, 'revenue']);
            Route::get('reports/export', [ReportController::class, 'export']);

            // User & Role Management (Owner/Admin)
            Route::get('roles', [UserController::class, 'roles']);
            Route::apiResource('users', UserController::class);

            // System Audit Logs
            Route::get('audit-logs', [AuditController::class, 'logs']);
        });

        // ─── Owner Specific Endpoints (Bab 28.7) ─────────────────────
        Route::middleware(['role:Owner', 'audit'])->prefix('owner')->group(function () {
            Route::get('/dashboard/summary', [OwnerController::class, 'summary']);
            Route::get('/dashboard/sales-chart', [OwnerController::class, 'salesChart']);
            Route::get('/dashboard/top-menus', [OwnerController::class, 'topMenus']);
            Route::post('/backup', [OwnerController::class, 'backup']);
            Route::post('/restore', [OwnerController::class, 'restore']);
            Route::apiResource('users', UserController::class);
            Route::get('audit-logs', [AuditController::class, 'logs']);
        });

        // ─── POS Routes (FASE 4.1) ───────────────────────────────────
        Route::middleware(['role:Kasir,Admin,Owner', 'audit'])->prefix('pos')->group(function () {
            Route::get('/menus', [PosController::class, 'menus']);
            Route::get('/reservations/today', [PosController::class, 'todayReservations']);
            Route::get('/transactions', [PosController::class, 'index']);
            Route::post('/transactions', [PosController::class, 'createOrder']);
            Route::get('/transactions/{id}', [PosController::class, 'show']);
            Route::get('/summary', [PosController::class, 'summary']);
        });

        // Void transaksi — hanya Admin/Owner (GAP-RBAC-01)
        Route::middleware(['role:Admin,Owner', 'audit'])->prefix('pos')->group(function () {
            Route::patch('/transactions/{id}/void', [PosController::class, 'voidOrder']);
        });

        // ─── KDS / Kitchen Display Routes (FASE 4.2) ─────────────────
        // Read-only untuk Kasir, Dapur/Barista, Admin, Owner (GAP-RBAC-02)
        Route::middleware(['role:Kasir,Dapur_Barista,Admin,Owner'])->prefix('kds')->group(function () {
            Route::get('/tickets', [KdsController::class, 'activeTickets']);
            Route::get('/tickets/{id}', [KdsController::class, 'show']);
        });

        // Write access KDS — hanya Dapur/Barista, Admin, Owner (GAP-RBAC-02)
        Route::middleware(['role:Dapur_Barista,Admin,Owner'])->group(function () {
            Route::prefix('kds')->group(function () {
                Route::patch('/tickets/{id}/status', [KdsController::class, 'updateStatus']);
                Route::patch('/tickets/{ticketId}/items/{itemId}/status', [KdsController::class, 'updateItemStatus']);
            });

            Route::prefix('kitchen')->group(function () {
                Route::get('/tickets', [KdsController::class, 'activeTickets']);
                Route::get('/tickets/{id}', [KdsController::class, 'show']);
                Route::patch('/tickets/{id}/status', [KdsController::class, 'updateStatus']);
                Route::patch('/tickets/{ticketId}/items/{itemId}/status', [KdsController::class, 'updateItemStatus']);
            });
        });

        // Reports & Analytics
        Route::middleware(['role:Admin,Owner'])->prefix('reports')->group(function () {
            Route::get('/sales', [ReportController::class, 'sales']);
            Route::get('/inventory', [ReportController::class, 'inventory']);
            Route::get('/revenue', [ReportController::class, 'revenue']);
            Route::get('/reservations', [ReportController::class, 'reservations']);
            Route::get('/export', [ReportController::class, 'export']);
        });
    });
});
