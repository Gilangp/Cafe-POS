<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('menus')->orderBy('display_order')->get();
        return response()->json(['success' => true, 'message' => 'Daftar kategori menu admin.', 'data' => $categories, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'display_order' => 'nullable|integer',
        ]);

        $category = Category::create($validated);
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dibuat.', 'data' => $category, 'meta' => null], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail kategori.', 'data' => $category->load('menus'), 'meta' => null]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:categories,name,' . $category->id,
            'display_order' => 'nullable|integer',
        ]);

        $category->update($validated);
        return response()->json(['success' => true, 'message' => 'Kategori berhasil diperbarui.', 'data' => $category, 'meta' => null]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->menus()->exists()) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak dapat dihapus karena masih memiliki menu yang terkait.', 'data' => null, 'meta' => null], 422);
        }

        $category->delete();
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
