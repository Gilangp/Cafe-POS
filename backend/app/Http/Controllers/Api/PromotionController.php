<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::query();
        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }
        return response()->json([
            'data' => $query->orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:160',
            'code' => 'required|string|max:80|unique:promotions,code',
            'type' => 'required|in:percent,nominal,bogo,bundle',
            'value' => 'required|numeric|min:0',
            'min_order_cents' => 'nullable|integer|min:0',
            'max_discount_cents' => 'nullable|integer|min:0',
            'channel' => 'nullable|string|max:40',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'max_usage' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $promotion = Promotion::create([
            ...$validated,
            'min_order_cents' => $validated['min_order_cents'] ?? 0,
            'channel' => $validated['channel'] ?? 'All',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Promotion::class,
            'auditable_id' => $promotion->id,
            'action' => 'CREATED',
            'old_values' => null,
            'new_values' => $promotion->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $promotion], 201);
    }

    public function show(Promotion $promotion)
    {
        return response()->json(['data' => $promotion]);
    }

    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:160',
            'code' => 'sometimes|string|max:80|unique:promotions,code,' . $promotion->id,
            'type' => 'sometimes|in:percent,nominal,bogo,bundle',
            'value' => 'sometimes|numeric|min:0',
            'min_order_cents' => 'nullable|integer|min:0',
            'max_discount_cents' => 'nullable|integer|min:0',
            'channel' => 'nullable|string|max:40',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'max_usage' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $oldValues = $promotion->toArray();
        $promotion->update($validated);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Promotion::class,
            'auditable_id' => $promotion->id,
            'action' => 'UPDATED',
            'old_values' => $oldValues,
            'new_values' => $promotion->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $promotion]);
    }

    public function destroy(Request $request, Promotion $promotion)
    {
        $oldValues = $promotion->toArray();
        $promotion->delete();

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Promotion::class,
            'auditable_id' => $promotion->id,
            'action' => 'DELETED',
            'old_values' => $oldValues,
            'new_values' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Promotion deleted successfully']);
    }

    public function validatePromo(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal_cents' => 'required|integer|min:0',
            'channel' => 'nullable|string',
        ]);

        $promo = Promotion::where('code', $request->code)->first();

        if (!$promo || !$promo->is_active) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode promo tidak ditemukan atau tidak aktif.',
            ], 422);
        }

        if ($promo->max_usage !== null && $promo->usage_count >= $promo->max_usage) {
            return response()->json([
                'valid' => false,
                'message' => 'Kuota promo telah habis.',
            ], 422);
        }

        $channel = $request->input('channel', 'All');
        if ($promo->channel !== 'All' && strtolower($promo->channel) !== strtolower($channel)) {
            return response()->json([
                'valid' => false,
                'message' => 'Promo tidak berlaku untuk saluran pemesanan ini.',
            ], 422);
        }

        if ($request->subtotal_cents < $promo->min_order_cents) {
            return response()->json([
                'valid' => false,
                'message' => 'Minimum order belum terpenuhi (min. Rp ' . number_format($promo->min_order_cents, 0, ',', '.') . ').',
            ], 422);
        }

        $discountCents = $promo->calculateDiscount($request->subtotal_cents, $channel);

        return response()->json([
            'valid' => true,
            'discount_cents' => $discountCents,
            'promotion' => $promo,
        ]);
    }
}
