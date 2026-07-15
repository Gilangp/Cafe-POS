<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPromotionController extends Controller
{
    public function index(): JsonResponse
    {
        $promotions = Promotion::with('menus')->latest()->get();
        return response()->json(['success' => true, 'message' => 'Daftar promo admin.', 'data' => $promotions, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'type' => 'required|in:percentage,nominal',
            'value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:aktif,tidak_aktif',
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'uuid|exists:menus,id',
        ]);

        $promotion = Promotion::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'value' => $validated['value'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'],
        ]);

        if (!empty($validated['menu_ids'])) {
            $promotion->menus()->sync($validated['menu_ids']);
        }

        return response()->json(['success' => true, 'message' => 'Promo berhasil dibuat.', 'data' => $promotion->load('menus'), 'meta' => null], 201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail promo.', 'data' => $promotion->load('menus'), 'meta' => null]);
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'type' => 'sometimes|required|in:percentage,nominal',
            'value' => 'sometimes|required|numeric|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'status' => 'sometimes|required|in:aktif,tidak_aktif',
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'uuid|exists:menus,id',
        ]);

        $promotion->update($request->only(['title', 'type', 'value', 'start_date', 'end_date', 'status']));

        if ($request->has('menu_ids')) {
            $promotion->menus()->sync($validated['menu_ids'] ?? []);
        }

        return response()->json(['success' => true, 'message' => 'Promo berhasil diperbarui.', 'data' => $promotion->load('menus'), 'meta' => null]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->menus()->detach();
        $promotion->delete();
        return response()->json(['success' => true, 'message' => 'Promo berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
