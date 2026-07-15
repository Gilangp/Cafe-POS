<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Get list of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::withCount('inventories');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pemasok bahan baku.',
            'data' => $suppliers,
            'meta' => ['total' => $suppliers->count()],
        ]);
    }

    /**
     * Create a new supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:25',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pemasok berhasil ditambahkan.',
            'data' => $supplier->loadCount('inventories'),
            'meta' => null,
        ], 201);
    }

    /**
     * Show single supplier with supplied inventory items.
     */
    public function show(string $id): JsonResponse
    {
        $supplier = Supplier::with('inventories.category')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pemasok.',
            'data' => $supplier,
            'meta' => null,
        ]);
    }

    /**
     * Update supplier details.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:25',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pemasok berhasil diperbarui.',
            'data' => $supplier->loadCount('inventories'),
            'meta' => null,
        ]);
    }

    /**
     * Delete supplier if no inventory items depend on it.
     */
    public function destroy(string $id): JsonResponse
    {
        $supplier = Supplier::withCount('inventories')->findOrFail($id);

        if ($supplier->inventories_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Pemasok tidak dapat dihapus karena masih terikat dengan item bahan baku aktif.',
                'data' => null,
                'meta' => null,
            ], 400);
        }

        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pemasok berhasil dihapus.',
            'data' => null,
            'meta' => null,
        ]);
    }
}
