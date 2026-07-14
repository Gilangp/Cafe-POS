<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        } else {
            $query->where('is_active', true);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        $sortField = $request->input('sort', 'name');
        $sortDir = str_starts_with($sortField, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sortField, '-');
        $allowedSorts = ['name', 'base_price', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir);
        }

        $products = $query->paginate($request->input('per_page', 12));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'sku' => 'nullable|string|max:80|unique:products,sku',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'preparation_time' => 'nullable|integer|min:1',
            'tags' => 'nullable|array',
            'recipe_id' => 'nullable|exists:recipes,id',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $product = Product::create($validated);

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'exists:categories,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'numeric|min:0',
            'sku' => 'nullable|string|max:80|unique:products,sku,' . $product->id,
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'preparation_time' => 'nullable|integer|min:1',
            'tags' => 'nullable|array',
            'recipe_id' => 'nullable|exists:recipes,id',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}