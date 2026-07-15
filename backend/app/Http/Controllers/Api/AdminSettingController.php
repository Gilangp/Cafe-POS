<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutUs;
use App\Models\Setting;
use App\Models\SocialMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    /**
     * Get identity settings, social media links, and about us sections.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::first();
        $socialMedia = SocialMedia::orderBy('display_order')->get();
        $aboutUs = AboutUs::orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data pengaturan CMS & identitas toko.',
            'data' => [
                'settings' => $settings,
                'social_media' => $socialMedia,
                'about_us' => $aboutUs,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Update identity & contact settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_name' => 'sometimes|required|string|max:150',
            'site_tagline' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'operating_hours' => 'nullable|string',
            'seo_title' => 'nullable|string|max:150',
            'seo_description' => 'nullable|string|max:300',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        $setting = Setting::first() ?? new Setting();
        $setting->fill($validated);
        $setting->save();

        return response()->json(['success' => true, 'message' => 'Pengaturan identitas & SEO berhasil diperbarui.', 'data' => $setting, 'meta' => null]);
    }

    // Social Media CRUD helper methods
    public function storeSocialMedia(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|string|max:50',
            'url' => 'required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        $sm = SocialMedia::create($validated);
        return response()->json(['success' => true, 'message' => 'Social media berhasil ditambahkan.', 'data' => $sm, 'meta' => null], 201);
    }

    public function updateSocialMedia(Request $request, SocialMedia $socialMedia): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'sometimes|required|string|max:50',
            'url' => 'sometimes|required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        $socialMedia->update($validated);
        return response()->json(['success' => true, 'message' => 'Social media berhasil diperbarui.', 'data' => $socialMedia, 'meta' => null]);
    }

    public function destroySocialMedia(SocialMedia $socialMedia): JsonResponse
    {
        $socialMedia->delete();
        return response()->json(['success' => true, 'message' => 'Social media berhasil dihapus.', 'data' => null, 'meta' => null]);
    }

    // About Us CRUD helper methods
    public function storeAboutUs(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'required|string',
            'image' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $about = AboutUs::create($validated);
        return response()->json(['success' => true, 'message' => 'Bagian Tentang Kami berhasil ditambahkan.', 'data' => $about, 'meta' => null], 201);
    }

    public function updateAboutUs(Request $request, AboutUs $aboutUs): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'description' => 'sometimes|required|string',
            'image' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $aboutUs->update($validated);
        return response()->json(['success' => true, 'message' => 'Bagian Tentang Kami berhasil diperbarui.', 'data' => $aboutUs, 'meta' => null]);
    }

    public function destroyAboutUs(AboutUs $aboutUs): JsonResponse
    {
        $aboutUs->delete();
        return response()->json(['success' => true, 'message' => 'Bagian Tentang Kami berhasil dihapus.', 'data' => null, 'meta' => null]);
    }
}
