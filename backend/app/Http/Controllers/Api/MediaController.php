<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = MediaLibrary::with('uploader:id,name');
        if ($request->has('mime_type')) {
            $query->where('mime_type', 'like', '%' . $request->mime_type . '%');
        }
        return response()->json([
            'data' => $query->orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'disk' => 'nullable|string|max:40',
            'path' => 'required|string',
            'filename' => 'required|string|max:255',
            'mime_type' => 'nullable|string|max:120',
            'size_bytes' => 'nullable|integer|min:0',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $media = MediaLibrary::create([
            'disk' => $validated['disk'] ?? 'public',
            'path' => $validated['path'],
            'filename' => $validated['filename'],
            'mime_type' => $validated['mime_type'] ?? null,
            'size_bytes' => $validated['size_bytes'] ?? 0,
            'alt_text' => $validated['alt_text'] ?? null,
            'uploaded_by' => auth()->id(),
        ]);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => MediaLibrary::class,
            'auditable_id' => $media->id,
            'action' => 'CREATED',
            'old_values' => null,
            'new_values' => $media->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $media], 201);
    }

    public function show($id)
    {
        $media = MediaLibrary::with('uploader:id,name')->findOrFail($id);
        return response()->json(['data' => $media]);
    }

    public function update(Request $request, $id)
    {
        $media = MediaLibrary::findOrFail($id);
        $oldValues = $media->toArray();

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'filename' => 'sometimes|string|max:255',
        ]);

        $media->update($validated);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => MediaLibrary::class,
            'auditable_id' => $media->id,
            'action' => 'UPDATED',
            'old_values' => $oldValues,
            'new_values' => $media->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $media]);
    }

    public function destroy(Request $request, $id)
    {
        $media = MediaLibrary::findOrFail($id);
        $oldValues = $media->toArray();
        $media->delete();

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => MediaLibrary::class,
            'auditable_id' => $media->id,
            'action' => 'DELETED',
            'old_values' => $oldValues,
            'new_values' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Media deleted successfully']);
    }
}
