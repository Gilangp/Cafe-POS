<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Gallery::query();
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        $galleries = $query->orderBy('display_order')->latest()->get();
        return response()->json(['success' => true, 'message' => 'Daftar galeri foto admin.', 'data' => $galleries, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => 'required|string',
            'category' => 'nullable|string|max:100',
            'caption' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer',
        ]);

        $gallery = Gallery::create($validated);
        return response()->json(['success' => true, 'message' => 'Foto galeri berhasil ditambahkan.', 'data' => $gallery, 'meta' => null], 201);
    }

    public function show(Gallery $gallery): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail foto galeri.', 'data' => $gallery, 'meta' => null]);
    }

    public function update(Request $request, Gallery $gallery): JsonResponse
    {
        $validated = $request->validate([
            'image' => 'sometimes|required|string',
            'category' => 'nullable|string|max:100',
            'caption' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer',
        ]);

        $gallery->update($validated);
        return response()->json(['success' => true, 'message' => 'Foto galeri berhasil diperbarui.', 'data' => $gallery, 'meta' => null]);
    }

    public function destroy(Gallery $gallery): JsonResponse
    {
        $gallery->delete();
        return response()->json(['success' => true, 'message' => 'Foto galeri berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
