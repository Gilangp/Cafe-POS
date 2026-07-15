<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::with('category');
        if ($request->filled('category_id')) {
            $query->where('article_category_id', $request->category_id);
        }
        $articles = $query->latest()->get();
        return response()->json(['success' => true, 'message' => 'Daftar artikel admin.', 'data' => $articles, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'article_category_id' => 'required|uuid|exists:article_categories,id',
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'image' => 'nullable|string',
            'status' => 'required|in:draf,diterbitkan',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);
        $article = Article::create($validated);

        return response()->json(['success' => true, 'message' => 'Artikel berhasil dibuat.', 'data' => $article->load('category'), 'meta' => null], 201);
    }

    public function show(Article $article): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail artikel.', 'data' => $article->load('category'), 'meta' => null]);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'article_category_id' => 'sometimes|required|uuid|exists:article_categories,id',
            'title' => 'sometimes|required|string|max:200',
            'content' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'status' => 'sometimes|required|in:draf,diterbitkan',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $article->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);
        }

        $article->update($validated);
        return response()->json(['success' => true, 'message' => 'Artikel berhasil diperbarui.', 'data' => $article->load('category'), 'meta' => null]);
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();
        return response()->json(['success' => true, 'message' => 'Artikel berhasil dihapus.', 'data' => null, 'meta' => null]);
    }

    // Article Categories CRUD helper methods
    public function categories(): JsonResponse
    {
        $categories = ArticleCategory::withCount('articles')->orderBy('name')->get();
        return response()->json(['success' => true, 'message' => 'Daftar kategori artikel.', 'data' => $categories, 'meta' => null]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:100|unique:article_categories,name']);
        $category = ArticleCategory::create($validated);
        return response()->json(['success' => true, 'message' => 'Kategori artikel berhasil dibuat.', 'data' => $category, 'meta' => null], 201);
    }

    public function destroyCategory(ArticleCategory $category): JsonResponse
    {
        if ($category->articles()->exists()) {
            return response()->json(['success' => false, 'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh artikel.', 'data' => null, 'meta' => null], 422);
        }
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Kategori artikel berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
