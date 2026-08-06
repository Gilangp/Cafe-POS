export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  MENU: {
    LIST: '/menus',
    DETAIL: (id: string) => `/menus/${id}`,
  },
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (slug: string) => `/articles/${slug}`,
  },
  TESTIMONIALS: {
    LIST: '/testimonials',
    STORE: '/testimonials',
  },
  LANDING: {
    DATA: '/landing-page',
  },
  RESERVATIONS: {
    LIST: '/reservations',
    STORE: '/reservations',
  },
  INVENTORY: {
    LIST: '/inventory',
  },
  GALLERY: {
    LIST: '/galleries',
  },
  PROMOTIONS: {
    LIST: '/promotions',
  },
  SETTINGS: {
    SHOW: '/settings',
  },
} as const;
