<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicArticleController extends Controller
{
    /**
     * Get paginated articles with optional category and search filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::with('category')->where('status', 'diterbitkan');

        if ($request->filled('category_id')) {
            $query->where('article_category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('content', 'ilike', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $articles = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar artikel NEMU Space.',
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    /**
     * Get specific article by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $article = Article::with('category')
            ->where('slug', $slug)
            ->where('status', 'diterbitkan')
            ->first();

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
                'data' => null,
                'meta' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail artikel NEMU Space.',
            'data' => $article,
            'meta' => null,
        ]);
    }

    /**
     * Get all article categories.
     */
    public function categories(): JsonResponse
    {
        $categories = ArticleCategory::withCount(['articles' => function ($q) {
            $q->where('status', 'diterbitkan');
        }])->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori artikel.',
            'data' => $categories,
            'meta' => null,
        ]);
    }
}
