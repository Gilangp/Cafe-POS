<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\InventoryLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /**
     * Get list of raw material inventory items with categories and suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::with(['category', 'supplier']);

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'minimum_stock');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%");
            });
        }

        $items = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar item bahan baku (Inventory).',
            'data' => $items,
            'meta' => [
                'total' => $items->count(),
                'low_stock_count' => Inventory::whereColumn('stock_quantity', '<=', 'minimum_stock')->count(),
            ],
        ]);
    }

    /**
     * Create a new raw material item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|uuid|exists:inventory_categories,id',
            'supplier_id' => 'nullable|uuid|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'stock_quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'minimum_stock' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $inventory = Inventory::create($validated);

            if ($validated['stock_quantity'] > 0) {
                InventoryLog::create([
                    'inventory_id' => $inventory->id,
                    'type' => 'stock_in',
                    'quantity' => $validated['stock_quantity'],
                    'reference_type' => 'INITIAL_STOCK',
                    'reference_id' => $inventory->id,
                    'user_id' => $request->user()?->id,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Item bahan baku berhasil ditambahkan.',
                'data' => $inventory->load(['category', 'supplier']),
                'meta' => null,
            ], 201);
        });
    }

    /**
     * Get single inventory item detail with logs.
     */
    public function show(string $id): JsonResponse
    {
        $inventory = Inventory::with(['category', 'supplier', 'logs' => function ($q) {
            $q->latest()->limit(50)->with('user:id,name');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail bahan baku.',
            'data' => $inventory,
            'meta' => null,
        ]);
    }

    /**
     * Update basic inventory item information.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $inventory = Inventory::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|required|uuid|exists:inventory_categories,id',
            'supplier_id' => 'nullable|uuid|exists:suppliers,id',
            'name' => 'sometimes|required|string|max:255',
            'unit' => 'sometimes|required|string|max:50',
            'minimum_stock' => 'sometimes|required|numeric|min:0',
        ]);

        $inventory->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Detail bahan baku berhasil diperbarui.',
            'data' => $inventory->load(['category', 'supplier']),
            'meta' => null,
        ]);
    }

    /**
     * Delete inventory item if not linked to any menu ingredients.
     */
    public function destroy(string $id): JsonResponse
    {
        $inventory = Inventory::withCount('menuIngredients')->findOrFail($id);

        if ($inventory->menu_ingredients_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Bahan baku tidak dapat dihapus karena masih digunakan sebagai komposisi resep menu aktif.',
                'data' => null,
                'meta' => null,
            ], 400);
        }

        $inventory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item bahan baku berhasil dihapus.',
            'data' => null,
            'meta' => null,
        ]);
    }

    /**
     * Explicit stock-in recording (Bab 28.6).
     */
    public function stockIn(Request $request, string $id): JsonResponse
    {
        $request->merge(['type' => 'stock_in']);
        return $this->adjust($request, $id);
    }

    /**
     * Explicit stock-out recording (Bab 28.6).
     */
    public function stockOut(Request $request, string $id): JsonResponse
    {
        $request->merge(['type' => 'stock_out']);
        return $this->adjust($request, $id);
    }

    /**
     * Adjust stock level (stock_in, stock_out, adjustment) and record to inventory_logs.
     */
    public function adjust(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:stock_in,stock_out,adjustment',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:255',
        ]);

        $inventory = Inventory::findOrFail($id);

        return DB::transaction(function () use ($inventory, $validated, $request) {
            $change = (float)$validated['quantity'];

            if ($validated['type'] === 'stock_out') {
                if ($inventory->stock_quantity < $change) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok tidak mencukupi untuk pengurangan. Stok saat ini: {$inventory->stock_quantity} {$inventory->unit}",
                        'data' => null,
                        'meta' => null,
                    ], 400);
                }
                $inventory->stock_quantity -= $change;
            } elseif ($validated['type'] === 'stock_in') {
                $inventory->stock_quantity += $change;
            } elseif ($validated['type'] === 'adjustment') {
                $inventory->stock_quantity = $change;
            }

            $inventory->save();

            $log = InventoryLog::create([
                'inventory_id' => $inventory->id,
                'type' => $validated['type'],
                'quantity' => $change,
                'reference_type' => 'MANUAL_ADJUSTMENT',
                'reference_id' => $validated['notes'] ?? 'Penyesuaian manual',
                'user_id' => $request->user()?->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stok bahan baku berhasil disesuaikan.',
                'data' => [
                    'inventory' => $inventory->load(['category', 'supplier']),
                    'log' => $log->load('user:id,name'),
                ],
                'meta' => null,
            ]);
        });
    }

    /**
     * Get global inventory mutation logs.
     */
    public function logs(Request $request): JsonResponse
    {
        $query = InventoryLog::with(['inventory:id,name,unit', 'user:id,name']);

        if ($request->filled('inventory_id')) {
            $query->where('inventory_id', $request->inventory_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $limit = (int)$request->input('limit', 50);
        $logs = $query->latest()->limit($limit)->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat mutasi stok bahan baku.',
            'data' => $logs,
            'meta' => ['total' => $logs->count()],
        ]);
    }

    /**
     * Get all inventory categories.
     */
    public function categories(): JsonResponse
    {
        $categories = InventoryCategory::withCount('inventories')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori bahan baku.',
            'data' => $categories,
            'meta' => ['total' => $categories->count()],
        ]);
    }

    /**
     * Create new inventory category.
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_categories,name',
        ]);

        $category = InventoryCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori bahan baku berhasil dibuat.',
            'data' => $category,
            'meta' => null,
        ], 201);
    }

    /**
     * Delete inventory category if unused.
     */
    public function destroyCategory(string $id): JsonResponse
    {
        $category = InventoryCategory::withCount('inventories')->findOrFail($id);

        if ($category->inventories_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak dapat dihapus karena masih berisi item bahan baku.',
                'data' => null,
                'meta' => null,
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori bahan baku berhasil dihapus.',
            'data' => null,
            'meta' => null,
        ]);
    }
}
