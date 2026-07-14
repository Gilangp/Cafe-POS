<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\CmsBlock;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $query = Page::with('blocks', 'author:id,name,email');
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
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'nullable|in:draft,published,archived',
            'is_homepage' => 'boolean',
            'blocks' => 'nullable|array',
        ]);

        $slug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'content' => $validated['content'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'is_homepage' => $validated['is_homepage'] ?? false,
            'author_id' => auth()->id() ?? 1,
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        if (!empty($validated['blocks'])) {
            foreach ($validated['blocks'] as $index => $block) {
                CmsBlock::create([
                    'page_id' => $page->id,
                    'type' => $block['type'] ?? 'text',
                    'sort_order' => $block['sort_order'] ?? $index,
                    'content_json' => $block['content_json'] ?? [],
                ]);
            }
        }

        $page->load('blocks');

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $page->id,
            'action' => 'CREATED',
            'old_values' => null,
            'new_values' => $page->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $page], 201);
    }

    public function show($id)
    {
        $page = Page::with('blocks', 'author:id,name,email')->findOrFail($id);
        return response()->json(['data' => $page]);
    }

    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        $oldValues = $page->toArray();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,archived',
            'is_homepage' => 'boolean',
            'blocks' => 'nullable|array',
        ]);

        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        } elseif (isset($validated['title']) && !$page->slug) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$page->published_at) {
            $validated['published_at'] = now();
        }

        $page->update($validated);

        if (isset($validated['blocks'])) {
            $page->blocks()->delete();
            foreach ($validated['blocks'] as $index => $block) {
                CmsBlock::create([
                    'page_id' => $page->id,
                    'type' => $block['type'] ?? 'text',
                    'sort_order' => $block['sort_order'] ?? $index,
                    'content_json' => $block['content_json'] ?? [],
                ]);
            }
        }

        $page->load('blocks');

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $page->id,
            'action' => 'UPDATED',
            'old_values' => $oldValues,
            'new_values' => $page->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['data' => $page]);
    }

    public function destroy(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        $oldValues = $page->toArray();
        $page->delete();

        AuditLog::create([
            'branch_id' => null,
            'user_id' => auth()->id(),
            'auditable_type' => Page::class,
            'auditable_id' => $page->id,
            'action' => 'DELETED',
            'old_values' => $oldValues,
            'new_values' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Page deleted successfully']);
    }
}
