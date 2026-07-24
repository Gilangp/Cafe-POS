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
  TESTIMONIALS: {
    LIST: '/testimonials',
    STORE: '/testimonials',
  },
  LANDING: {
    DATA: '/landing',
  },
  RESERVATIONS: {
    LIST: '/reservations',
    STORE: '/reservations',
  },
  INVENTORY: {
    LIST: '/inventory',
  },
  GALLERY: {
    LIST: '/gallery',
  },
  PROMOTIONS: {
    LIST: '/promotions',
  },
} as const;
