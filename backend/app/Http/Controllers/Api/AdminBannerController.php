<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = HeroBanner::orderBy('display_order')->get();
        return response()->json(['success' => true, 'message' => 'Daftar hero banner.', 'data' => $banners, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|string',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $banner = HeroBanner::create($validated);
        return response()->json(['success' => true, 'message' => 'Hero banner berhasil dibuat.', 'data' => $banner, 'meta' => null], 201);
    }

    public function show(HeroBanner $heroBanner): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail hero banner.', 'data' => $heroBanner, 'meta' => null]);
    }

    public function update(Request $request, HeroBanner $heroBanner): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'sometimes|required|string',
            'button_text' => 'nullable|string|max:50',
            'button_link' => 'nullable|string|max:255',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $heroBanner->update($validated);
        return response()->json(['success' => true, 'message' => 'Hero banner berhasil diperbarui.', 'data' => $heroBanner, 'meta' => null]);
    }

    public function destroy(HeroBanner $heroBanner): JsonResponse
    {
        $heroBanner->delete();
        return response()->json(['success' => true, 'message' => 'Hero banner berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
