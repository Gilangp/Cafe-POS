<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicGalleryController extends Controller
{
    /**
     * Get list of galleries with optional category filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Gallery::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $galleries = $query->orderBy('display_order')->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar galeri foto NEMU Space.',
            'data' => $galleries,
            'meta' => [
                'total' => $galleries->count(),
            ],
        ]);
    }
}
