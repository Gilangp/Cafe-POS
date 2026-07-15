<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicMenuController extends Controller
{
    /**
     * Get all available menus with category filter, keyword search, and best seller filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Menu::with('category')->where('status', 'tersedia');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($request->boolean('is_best_seller')) {
            $query->where('is_best_seller', true);
        }

        $menus = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu publik NEMU Space.',
            'data' => $menus,
            'meta' => [
                'total' => $menus->count(),
            ],
        ]);
    }

    /**
     * Get specific menu details by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $menu = Menu::with(['category', 'promotions' => function ($q) {
            $q->where('status', 'aktif');
        }])->where('slug', $slug)->first();

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu tidak ditemukan.',
                'data' => null,
                'meta' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail menu NEMU Space.',
            'data' => $menu,
            'meta' => null,
        ]);
    }

    /**
     * Get all categories along with their available menus count.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::withCount(['menus' => function ($q) {
            $q->where('status', 'tersedia');
        }])->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori menu NEMU Space.',
            'data' => $categories,
            'meta' => null,
        ]);
    }
}
