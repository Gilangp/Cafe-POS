# 18. Information Architecture

**Dokumen:** Information Architecture & Sitemap
**Versi:** 1.0.0
**Status:** Baseline

---

## 18.1 Site Structure Overview

Velvra terdiri dari 3 aplikasi utama:
1. **Marketing Website** (public-facing)
2. **Customer Portal** (authenticated customers)
3. **Admin Dashboard** (staff & management)

---

## 18.2 Marketing Website Sitemap

```
/ (Home)
├── /about
├── /menu
│   └── /menu/{category}
│       └── /menu/item/{slug}
├── /branches
│   └── /branches/{slug}
├── /careers
│   └── /careers/{job-slug}
├── /events
│   └── /events/{event-slug}
├── /blog
│   └── /blog/{article-slug}
├── /gallery
├── /contact
├── /reservations
│   └── /reservations/book
├── /privacy-policy
├── /terms-of-service
└── /accessibility
```

### Navigation Structure

**Primary Navigation:**
- Home
- Menu
- Branches
- About
- Contact

**Footer Navigation:**
- Company: About, Careers, Press
- Support: Contact, FAQ, Accessibility
- Legal: Privacy, Terms, Cookies

---

## 18.3 Customer Portal Sitemap

```
/customer (requires authentication)
├── /customer/dashboard
├── /customer/orders
│   └── /customer/orders/{id}
├── /customer/reservations
│   └── /customer/reservations/{id}
├── /customer/membership
│   ├── /customer/membership/points
│   └── /customer/membership/rewards
├── /customer/profile
└── /customer/settings
```

---

## 18.4 Admin Dashboard Sitemap

```
/admin (requires staff authentication)
├── /admin/dashboard
│
├── /admin/pos
│   └── /admin/pos/session/{id}
│
├── /admin/kds
│
├── /admin/orders
│   ├── /admin/orders/list
│   └── /admin/orders/{id}
│
├── /admin/menu
│   ├── /admin/menu/categories
│   ├── /admin/menu/items
│   │   ├── /admin/menu/items/create
│   │   └── /admin/menu/items/{id}/edit
│   ├── /admin/menu/recipes
│   └── /admin/menu/modifiers
│
├── /admin/inventory
│   ├── /admin/inventory/items
│   ├── /admin/inventory/transactions
│   ├── /admin/inventory/low-stock
│   └── /admin/inventory/reports
│
├── /admin/procurement
│   ├── /admin/procurement/suppliers
│   ├── /admin/procurement/purchase-orders
│   └── /admin/procurement/receive
│
├── /admin/members
│   ├── /admin/members/list
│   ├── /admin/members/{id}
│   └── /admin/members/tiers
│
├── /admin/reservations
│   ├── /admin/reservations/calendar
│   └── /admin/reservations/list
│
├── /admin/cms
│   ├── /admin/cms/pages
│   ├── /admin/cms/blog
│   ├── /admin/cms/events
│   ├── /admin/cms/gallery
│   └── /admin/cms/media
│
├── /admin/analytics
│   ├── /admin/analytics/dashboard
│   ├── /admin/analytics/sales
│   ├── /admin/analytics/inventory
│   └── /admin/analytics/members
│
├── /admin/reports
│   ├── /admin/reports/sales
│   ├── /admin/reports/inventory
│   ├── /admin/reports/payroll
│   └── /admin/reports/exports
│
├── /admin/settings
│   ├── /admin/settings/branch
│   ├── /admin/settings/users
│   ├── /admin/settings/roles
│   └── /admin/settings/system
│
└── /admin/profile
```

---

## 18.5 Content Hierarchy

### Homepage

```
Hero Section
  ├── Headline
  ├── Subheadline
  ├── CTA (Order Now, View Menu)
  └── Hero Image/Video

Featured Menu
  └── Grid of 6-8 featured items

About Section
  ├── Brand story (short)
  └── CTA (Learn More)

Locations
  └── Map + Branch list

Testimonials
  └── Customer reviews

Instagram Feed
  └── Latest 6 posts

Footer
  ├── Newsletter signup
  ├── Navigation links
  └── Social media links
```

### Menu Page

```
Header
  └── Breadcrumb (Home > Menu)

Filters
  ├── Category tabs
  ├── Dietary filters (Vegan, Gluten-free)
  └── Search

Menu Grid
  └── Item cards
      ├── Image
      ├── Name
      ├── Description (truncated)
      ├── Price
      └── Add to Cart / View Detail

Sidebar (desktop)
  └── Cart summary (sticky)
```

### Admin Dashboard

```
Top Bar
  ├── Branch selector
  ├── Search
  ├── Notifications
  └── User menu

Sidebar
  ├── Logo
  └── Navigation menu (collapsible sections)

Main Content Area
  ├── Page title & breadcrumb
  ├── Action buttons
  └── Content (table, form, chart)
```

---

## 18.6 Navigation Patterns

### Marketing Site
- Sticky header dengan transparent background (solid saat scroll).
- Hamburger menu di mobile.
- Mega menu untuk "Menu" category (desktop).

### Admin Dashboard
- Persistent sidebar (collapsible).
- Breadcrumb untuk deep pages.
- Tabs untuk multi-section pages.

---

## 18.7 URL Naming Conventions

- **Lowercase:** `/menu/coffee`, bukan `/Menu/Coffee`
- **Kebab-case:** `/iced-latte`, bukan `/iced_latte` atau `/IcedLatte`
- **No trailing slash:** `/menu`, bukan `/menu/`
- **Plural for collections:** `/orders`, `/items`
- **Singular for detail:** `/order/{id}`, `/item/{slug}`

---

## 18.8 Metadata Strategy

### Homepage
```html
<title>Velvra - Premium Coffee & Kitchen</title>
<meta name="description" content="Experience artisan coffee and curated menu at Velvra. Order online or visit our branches." />
<meta property="og:title" content="Velvra - Premium Coffee & Kitchen" />
<meta property="og:image" content="/og-image.jpg" />
```

### Menu Item
```html
<title>Iced Latte - Velvra Menu</title>
<meta name="description" content="Cold milk coffee with double espresso. IDR 38,000. Order now for pickup or delivery." />
```

### Dynamic per page, relevant keywords, 50-60 karakter title, 150-160 karakter description.

---

## 18.9 Search Strategy

### Public Search
- Search menu by name, description, ingredients.
- Autocomplete suggestions.
- Filter by category, price range, dietary.

### Admin Search
- Global search (Cmd+K) untuk akses cepat ke:
  - Orders (by number, customer name)
  - Menu items
  - Members (by name, phone, email)
  - Inventory items

---

## 18.10 Mobile Navigation

**Bottom Tab Bar (Customer App):**
- Home
- Menu
- Orders
- Profile

**Admin Mobile:**
- Collapsible sidebar di mobile.
- Floating action button untuk quick action (tambah order, etc).

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
