<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutUs;
use App\Models\Faq;
use App\Models\HeroBanner;
use App\Models\Menu;
use App\Models\Setting;
use App\Models\SocialMedia;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class LandingPageController extends Controller
{
    /**
     * Get all active landing page sections, hero banners, FAQs, testimonials, best seller menus, and contact settings.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::first();
        $socialMedia = SocialMedia::where('is_active', true)->orderBy('display_order')->get();
        $heroBanners = HeroBanner::where('is_active', true)->orderBy('display_order')->get();
        $aboutUs = AboutUs::where('is_active', true)->orderBy('display_order')->get();
        $bestSellerMenus = Menu::with('category')
            ->where('status', 'tersedia')
            ->where('is_best_seller', true)
            ->limit(8)
            ->get();
        $faqs = Faq::where('is_active', true)->orderBy('display_order')->get();
        $testimonials = Testimonial::where('is_active', true)->latest()->limit(6)->get();

        return response()->json([
            'success' => true,
            'message' => 'Data Landing Page dinamis NEMU Space.',
            'data' => [
                'settings' => $settings,
                'social_media' => $socialMedia,
                'hero_banners' => $heroBanners,
                'about_us' => $aboutUs,
                'best_seller_menus' => $bestSellerMenus,
                'faqs' => $faqs,
                'testimonials' => $testimonials,
            ],
            'meta' => null,
        ]);
    }

    /**
     * Public active promotions (Bab 28.2).
     */
    public function promotions(): JsonResponse
    {
        $promotions = \App\Models\Promotion::where('status', 'aktif')
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar promo aktif.',
            'data' => $promotions,
            'meta' => ['total' => $promotions->count()],
        ]);
    }

    /**
     * Public active FAQs (Bab 28.2).
     */
    public function faqs(): JsonResponse
    {
        $faqs = Faq::where('is_active', true)->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar FAQ aktif.',
            'data' => $faqs,
            'meta' => ['total' => $faqs->count()],
        ]);
    }

    /**
     * Public active testimonials (Bab 28.2).
     */
    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::where('is_active', true)->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar testimoni pelanggan.',
            'data' => $testimonials,
            'meta' => ['total' => $testimonials->count()],
        ]);
    }

    /**
     * Public settings (Bab 28.2).
     */
    public function settings(): JsonResponse
    {
        $setting = Setting::first();
        $socialMedia = SocialMedia::where('is_active', true)->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan umum dan kontak toko.',
            'data' => [
                'general' => $setting,
                'social_media' => $socialMedia,
            ],
            'meta' => null,
        ]);
    }
}
