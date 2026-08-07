import api from '@/shared/api/axios';
import { ENDPOINTS } from '@/shared/api/endpoint';

export interface PublicMenu {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  image_url?: string;
  category?: { id: string; name: string };
  is_best_seller?: boolean;
  status?: string;
}

export interface PublicGallery {
  id: string;
  image: string;
  image_url?: string;
  caption?: string;
  category?: string;
}

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  thumbnail_url?: string;
  category?: { id: string; name: string } | string;
  created_at?: string;
  published_at?: string;
}

export interface PublicPromotion {
  id: string;
  title: string;
  description?: string;
  banner_url?: string;
  type?: string;
  value?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  content: string;
  role?: string;
  rating?: number;
  avatar?: string;
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PublicHeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  button_text?: string;
  button_link?: string;
}

export interface PublicSettings {
  site_name?: string;
  site_tagline?: string;
  coffee_shop_name?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  maps_embed?: string;
  social_media?: Array<{ platform: string; url: string; is_active: boolean }>;
  instagram?: string;
  facebook?: string;
}

export interface LandingData {
  menus: PublicMenu[];
  best_sellers: PublicMenu[];
  galleries: PublicGallery[];
  articles: PublicArticle[];
  promotions: PublicPromotion[];
  testimonials: PublicTestimonial[];
  settings: PublicSettings;
  hero_banners?: PublicHeroBanner[];
  faqs?: PublicFaq[];
}

export const publicService = {
  getLandingData: async (): Promise<LandingData> => {
    try {
      const [landingRes, menusRes, galleriesRes, articlesRes, promotionsRes] = await Promise.all([
        api.get(ENDPOINTS.LANDING.DATA).catch(() => ({ data: { data: {} } })),
        api.get(ENDPOINTS.MENU.LIST).catch(() => ({ data: { data: [] } })),
        api.get(ENDPOINTS.GALLERY.LIST).catch(() => ({ data: { data: [] } })),
        api.get(ENDPOINTS.ARTICLES.LIST).catch(() => ({ data: { data: [] } })),
        api.get(ENDPOINTS.PROMOTIONS.LIST).catch(() => ({ data: { data: [] } })),
      ]);

      const landing = landingRes.data?.data || landingRes.data || {};
      
      return {
        settings: landing.settings || {},
        hero_banners: landing.hero_banners || [],
        faqs: landing.faqs || [],
        best_sellers: landing.best_seller_menus || [],
        testimonials: landing.testimonials || [],
        menus: menusRes.data?.data || menusRes.data || [],
        galleries: galleriesRes.data?.data || galleriesRes.data || [],
        articles: articlesRes.data?.data || articlesRes.data || [],
        promotions: promotionsRes.data?.data || promotionsRes.data || [],
      };
    } catch (error) {
      console.error("Failed to fetch landing data", error);
      return {
        settings: {},
        best_sellers: [],
        testimonials: [],
        menus: [],
        galleries: [],
        articles: [],
        promotions: [],
      };
    }
  },

  getMenus: async (params?: Record<string, unknown>): Promise<PublicMenu[]> => {
    const res = await api.get(ENDPOINTS.MENU.LIST, { params });
    return res.data.data ?? res.data;
  },

  getGalleries: async (): Promise<PublicGallery[]> => {
    const res = await api.get(ENDPOINTS.GALLERY.LIST);
    return res.data.data ?? res.data;
  },

  getArticles: async (): Promise<PublicArticle[]> => {
    const res = await api.get(ENDPOINTS.ARTICLES.LIST);
    return res.data.data ?? res.data;
  },

  getPromotions: async (): Promise<PublicPromotion[]> => {
    const res = await api.get(ENDPOINTS.PROMOTIONS.LIST);
    return res.data.data ?? res.data;
  },

  submitReservation: async (data: Record<string, unknown>): Promise<unknown> => {
    const res = await api.post(ENDPOINTS.RESERVATIONS.STORE, data);
    return res.data.data ?? res.data;
  },
};
