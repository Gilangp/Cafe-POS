<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * List uploaded media records.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('uploader:id,name,email');
        if ($request->filled('mime_type')) {
            $query->where('mime_type', 'like', '%' . $request->mime_type . '%');
        }
        $media = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar berkas media admin.',
            'data' => $media,
            'meta' => ['total' => $media->count()],
        ]);
    }

    /**
     * Upload physical file to storage and save metadata in media table.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpeg,png,jpg,webp,svg,mp4,pdf',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Store in public/media or external storage
        $storedPath = $file->storeAs('media/' . date('Y/m'), Str::uuid() . '.' . $file->getClientOriginalExtension(), 'public');
        $publicUrl = Storage::disk('public')->url($storedPath);

        $media = Media::create([
            'file_name' => $originalName,
            'file_path' => $publicUrl,
            'mime_type' => $mimeType,
            'size' => $size,
            'uploaded_by' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berkas media berhasil diunggah.',
            'data' => $media->load('uploader:id,name'),
            'meta' => null,
        ], 201);
    }

    /**
     * Store media metadata directly (for client-side direct uploads to Supabase Storage).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => 'required|string|max:255',
            'file_path' => 'required|string',
            'mime_type' => 'nullable|string|max:120',
            'size' => 'nullable|integer|min:0',
        ]);

        $media = Media::create([
            'file_name' => $validated['file_name'],
            'file_path' => $validated['file_path'],
            'mime_type' => $validated['mime_type'] ?? null,
            'size' => $validated['size'] ?? 0,
            'uploaded_by' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Metadata media berhasil disimpan.',
            'data' => $media->load('uploader:id,name'),
            'meta' => null,
        ], 201);
    }

    /**
     * Show single media detail.
     */
    public function show(string $id): JsonResponse
    {
        $media = Media::with('uploader:id,name,email')->findOrFail($id);
        return response()->json(['success' => true, 'message' => 'Detail media.', 'data' => $media, 'meta' => null]);
    }

    /**
     * Delete media record and file.
     */
    public function destroy(string $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        $media->delete();

        return response()->json(['success' => true, 'message' => 'Media berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
