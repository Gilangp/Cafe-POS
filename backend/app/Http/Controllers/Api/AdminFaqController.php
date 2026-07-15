<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFaqController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = Faq::orderBy('display_order')->get();
        return response()->json(['success' => true, 'message' => 'Daftar FAQ admin.', 'data' => $faqs, 'meta' => null]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $faq = Faq::create($validated);
        return response()->json(['success' => true, 'message' => 'FAQ berhasil dibuat.', 'data' => $faq, 'meta' => null], 201);
    }

    public function show(Faq $faq): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'Detail FAQ.', 'data' => $faq, 'meta' => null]);
    }

    public function update(Request $request, Faq $faq): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'sometimes|required|string|max:255',
            'answer' => 'sometimes|required|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $faq->update($validated);
        return response()->json(['success' => true, 'message' => 'FAQ berhasil diperbarui.', 'data' => $faq, 'meta' => null]);
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $faq->delete();
        return response()->json(['success' => true, 'message' => 'FAQ berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
