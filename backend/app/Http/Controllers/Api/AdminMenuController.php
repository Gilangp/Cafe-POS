<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminMenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Menu::with('category')->withTrashed();

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $menus = $query->orderBy('name')->get();
        return response()->json(['success' => true, 'message' => 'Daftar menu admin.', 'data' => $menus, 'meta' => ['total' => $menus->count()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|uuid|exists:categories,id',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'status' => 'required|in:tersedia,tidak_tersedia',
            'is_best_seller' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . substr(uniqid(), -4);
        $menu = Menu::create($validated);

        return response()->json(['success' => true, 'message' => 'Menu berhasil dibuat.', 'data' => $menu->load('category'), 'meta' => null], 201);
    }

    public function show(string $id): JsonResponse
    {
        $menu = Menu::with(['category', 'promotions', 'ingredients'])->withTrashed()->findOrFail($id);
        return response()->json(['success' => true, 'message' => 'Detail menu.', 'data' => $menu, 'meta' => null]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $menu = Menu::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|required|uuid|exists:categories,id',
            'name' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'nullable|string',
            'status' => 'sometimes|required|in:tersedia,tidak_tersedia',
            'is_best_seller' => 'boolean',
        ]);

        if (isset($validated['name']) && $validated['name'] !== $menu->name) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . substr(uniqid(), -4);
        }

        $menu->update($validated);
        return response()->json(['success' => true, 'message' => 'Menu berhasil diperbarui.', 'data' => $menu->load('category'), 'meta' => null]);
    }

    public function destroy(string $id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();
        return response()->json(['success' => true, 'message' => 'Menu berhasil dihapus (soft delete).', 'data' => null, 'meta' => null]);
    }

    public function restore(string $id): JsonResponse
    {
        $menu = Menu::onlyTrashed()->findOrFail($id);
        $menu->restore();
        return response()->json(['success' => true, 'message' => 'Menu berhasil dipulihkan.', 'data' => $menu->load('category'), 'meta' => null]);
    }
}
