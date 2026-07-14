<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $query = Recipe::with('ingredients.inventoryItem');

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'ILIKE', "%{$search}%");
        }

        $recipes = $query->orderBy('name')->paginate($request->input('per_page', 20));

        return response()->json($recipes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'name' => 'required|string|max:160',
            'yield_quantity' => 'required|numeric|min:0.001',
            'yield_unit' => 'required|string|max:40',
            'instructions' => 'nullable|string',
            'status' => 'nullable|string|max:40',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.001',
            'ingredients.*.unit' => 'required|string|max:40',
        ]);

        return DB::transaction(function () use ($validated) {
            $recipe = Recipe::create([
                'branch_id' => $validated['branch_id'] ?? null,
                'name' => $validated['name'],
                'yield_quantity' => $validated['yield_quantity'],
                'yield_unit' => $validated['yield_unit'],
                'instructions' => $validated['instructions'] ?? null,
                'status' => $validated['status'] ?? 'ACTIVE',
            ]);

            if (!empty($validated['ingredients'])) {
                foreach ($validated['ingredients'] as $ing) {
                    RecipeIngredient::create([
                        'recipe_id' => $recipe->id,
                        'inventory_item_id' => $ing['inventory_item_id'],
                        'quantity' => $ing['quantity'],
                        'unit' => $ing['unit'],
                    ]);
                }
            }

            return response()->json($recipe->load('ingredients.inventoryItem'), 201);
        });
    }

    public function show(Recipe $recipe)
    {
        return response()->json($recipe->load('ingredients.inventoryItem'));
    }

    public function update(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'name' => 'string|max:160',
            'yield_quantity' => 'numeric|min:0.001',
            'yield_unit' => 'string|max:40',
            'instructions' => 'nullable|string',
            'status' => 'string|max:40',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.001',
            'ingredients.*.unit' => 'required|string|max:40',
        ]);

        return DB::transaction(function () use ($request, $validated, $recipe) {
            $recipe->update($validated);

            if ($request->has('ingredients')) {
                $recipe->ingredients()->delete();
                foreach ($validated['ingredients'] as $ing) {
                    RecipeIngredient::create([
                        'recipe_id' => $recipe->id,
                        'inventory_item_id' => $ing['inventory_item_id'],
                        'quantity' => $ing['quantity'],
                        'unit' => $ing['unit'],
                    ]);
                }
            }

            return response()->json($recipe->load('ingredients.inventoryItem'));
        });
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();

        return response()->json([
            'message' => 'Recipe deleted successfully',
        ]);
    }

    /**
     * RCP-003: Recipe Costing Engine (Weighted-Average COGS calculation)
     */
    public function calculateCosting(Request $request, Recipe $recipe)
    {
        $recipe->load('ingredients.inventoryItem');

        $totalCostCents = 0;
        $breakdown = [];

        foreach ($recipe->ingredients as $ingredient) {
            $item = $ingredient->inventoryItem;
            $itemCostCents = round(($item ? ($item->unit_cost ?? 0) : 0) * 100);
            $ingredientCost = round($ingredient->quantity * $itemCostCents);
            $totalCostCents += $ingredientCost;

            $breakdown[] = [
                'inventory_item_id' => $ingredient->inventory_item_id,
                'name' => $item ? $item->name : 'Unknown Item',
                'quantity' => (float) $ingredient->quantity,
                'unit' => $ingredient->unit,
                'unit_cost_cents' => (int) $itemCostCents,
                'total_ingredient_cost_cents' => (int) $ingredientCost,
            ];
        }

        $yield = (float) ($recipe->yield_quantity > 0 ? $recipe->yield_quantity : 1);
        $costPerPortionCents = (int) round($totalCostCents / $yield);

        if ($request->boolean('sync_products')) {
            Product::where('recipe_id', $recipe->id)->update([
                'cost_cents' => $costPerPortionCents,
            ]);
        }

        return response()->json([
            'recipe_id' => $recipe->id,
            'recipe_name' => $recipe->name,
            'yield_quantity' => $yield,
            'yield_unit' => $recipe->yield_unit,
            'total_recipe_cost_cents' => (int) $totalCostCents,
            'cost_per_portion_cents' => $costPerPortionCents,
            'ingredients_breakdown' => $breakdown,
        ]);
    }
}
