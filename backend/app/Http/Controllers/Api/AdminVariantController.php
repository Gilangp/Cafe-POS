<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VariantGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVariantController extends Controller
{
    public function index(): JsonResponse
    {
        $groups = VariantGroup::with('options')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Master Varian',
            'data' => $groups,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:single,multiple',
            'options' => 'required|array|min:1',
            'options.*.name' => 'required|string|max:100',
            'options.*.additional_price' => 'nullable|numeric|min:0',
            'options.*.inventory_item_id' => 'nullable|uuid|exists:inventories,id',
            'options.*.inventory_action' => 'nullable|in:none,multiply,swap,add',
            'options.*.inventory_action_value' => 'nullable|numeric',
        ]);

        $group = VariantGroup::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
        ]);

        foreach ($validated['options'] as $opt) {
            $group->options()->create([
                'name' => $opt['name'],
                'additional_price' => $opt['additional_price'] ?? 0,
                'inventory_item_id' => $opt['inventory_item_id'] ?? null,
                'inventory_action' => $opt['inventory_action'] ?? 'none',
                'inventory_action_value' => $opt['inventory_action_value'] ?? 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Grup varian berhasil dibuat',
            'data' => $group->load('options'),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $group = VariantGroup::with('options')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $group,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $group = VariantGroup::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:single,multiple',
            'options' => 'required|array|min:1',
            'options.*.id' => 'nullable|uuid',
            'options.*.name' => 'required|string|max:100',
            'options.*.additional_price' => 'nullable|numeric|min:0',
            'options.*.inventory_item_id' => 'nullable|uuid|exists:inventories,id',
            'options.*.inventory_action' => 'nullable|in:none,multiply,swap,add',
            'options.*.inventory_action_value' => 'nullable|numeric',
        ]);

        $group->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
        ]);

        $existingOptionIds = $group->options()->pluck('id')->toArray();
        $updatedOptionIds = [];

        foreach ($validated['options'] as $opt) {
            if (isset($opt['id']) && in_array($opt['id'], $existingOptionIds)) {
                $group->options()->where('id', $opt['id'])->update([
                    'name' => $opt['name'],
                    'additional_price' => $opt['additional_price'] ?? 0,
                    'inventory_item_id' => $opt['inventory_item_id'] ?? null,
                    'inventory_action' => $opt['inventory_action'] ?? 'none',
                    'inventory_action_value' => $opt['inventory_action_value'] ?? 0,
                ]);
                $updatedOptionIds[] = $opt['id'];
            } else {
                $newOpt = $group->options()->create([
                    'name' => $opt['name'],
                    'additional_price' => $opt['additional_price'] ?? 0,
                    'inventory_item_id' => $opt['inventory_item_id'] ?? null,
                    'inventory_action' => $opt['inventory_action'] ?? 'none',
                    'inventory_action_value' => $opt['inventory_action_value'] ?? 0,
                ]);
                $updatedOptionIds[] = $newOpt->id;
            }
        }

        // Delete options that were removed
        $optionsToDelete = array_diff($existingOptionIds, $updatedOptionIds);
        if (! empty($optionsToDelete)) {
            $group->options()->whereIn('id', $optionsToDelete)->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Grup varian berhasil diperbarui',
            'data' => $group->load('options'),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $group = VariantGroup::findOrFail($id);
        // Note: options will be cascade deleted based on DB migration, but we can be explicit
        $group->options()->delete();
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grup varian berhasil dihapus',
        ]);
    }
}
