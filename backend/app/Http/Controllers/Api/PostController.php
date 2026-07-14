<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request)
    {
        // Treat posts as pages where is_homepage is false and perhaps categorized/filtered
        $query = Page::with('author:id,name,email')->where('is_homepage', false);
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        return response()->json([
            'data' => $query->orderBy('id', 'desc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        $post = Page::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $validated['content'],
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'is_homepage' => false,
            'author_id' => auth()->id() ?? 1,
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $post->id,
            'action' => 'CREATED_POST',
            'old_values' => null,
            'new_values' => $post->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $post], 201);
    }

    public function show($id)
    {
        $post = Page::with('author:id,name,email')->findOrFail($id);
        return response()->json(['data' => $post]);
    }

    public function update(Request $request, $id)
    {
        $post = Page::findOrFail($id);
        $oldValues = $post->toArray();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:pages,slug,' . $post->id,
            'content' => 'sometimes|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        } elseif (isset($validated['title']) && !$post->slug) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $post->id,
            'action' => 'UPDATED_POST',
            'old_values' => $oldValues,
            'new_values' => $post->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $post]);
    }

    public function destroy(Request $request, $id)
    {
        $post = Page::findOrFail($id);
        $oldValues = $post->toArray();
        $post->delete();

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $post->id,
            'action' => 'DELETED_POST',
            'old_values' => $oldValues,
            'new_values' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
