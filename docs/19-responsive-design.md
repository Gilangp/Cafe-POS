# 19. Responsive Design

**Dokumen:** Responsive Design Guidelines
**Versi:** 1.0.0
**Status:** Baseline

---

## 19.1 Breakpoint Strategy

Velvra menggunakan **mobile-first approach** dengan breakpoint berbasis Tailwind CSS.

| Breakpoint | Min Width | Target Device | Notes |
|---|---|---|---|
| `xs` | 0px | Mobile portrait | Default, no prefix |
| `sm` | 640px | Mobile landscape, small tablet | `sm:` prefix |
| `md` | 768px | Tablet portrait | `md:` prefix |
| `lg` | 1024px | Tablet landscape, small laptop | `lg:` prefix |
| `xl` | 1280px | Desktop | `xl:` prefix |
| `2xl` | 1536px | Large desktop | `2xl:` prefix |

---

## 19.2 Layout Patterns

### Marketing Website

**Mobile (xs):**
- Single column layout.
- Hamburger menu.
- Stacked content sections.
- Full-width images.

**Tablet (md):**
- 2-column grid untuk menu items.
- Side drawer navigation (optional).

**Desktop (lg+):**
- Multi-column layout (hero full-width, content 2-3 columns).
- Persistent horizontal navigation.
- Sidebar untuk filters/cart.

### Admin Dashboard

**Mobile (xs-sm):**
- Hidden sidebar, accessible via hamburger.
- Single column forms.
- Horizontal scrollable tables.

**Tablet (md):**
- Collapsible sidebar (icon only).
- 2-column forms.

**Desktop (lg+):**
- Persistent sidebar (full width with labels).
- Multi-column layouts.
- Side-by-side panels.

---

## 19.3 Typography Scale

| Element | Mobile | Desktop | Weight |
|---|---|---|---|
| H1 | 32px / 2rem | 48px / 3rem | Bold (700) |
| H2 | 28px / 1.75rem | 36px / 2.25rem | Bold (700) |
| H3 | 24px / 1.5rem | 30px / 1.875rem | Semibold (600) |
| H4 | 20px / 1.25rem | 24px / 1.5rem | Semibold (600) |
| Body | 16px / 1rem | 16px / 1rem | Regular (400) |
| Small | 14px / 0.875rem | 14px / 0.875rem | Regular (400) |
| Caption | 12px / 0.75rem | 12px / 0.75rem | Regular (400) |

**Line Height:**
- Headings: 1.2
- Body: 1.6
- Small/Caption: 1.4

---

## 19.4 Spacing System

Menggunakan spacing scale berbasis 4px (Tailwind default):

| Class | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Small gap |
| `space-3` | 12px | Default gap |
| `space-4` | 16px | Medium gap |
| `space-6` | 24px | Large gap |
| `space-8` | 32px | Extra large gap |
| `space-12` | 48px | Section spacing |
| `space-16` | 64px | Hero spacing |

**Mobile:** Spacing dikurangi 25-50% untuk efisiensi ruang.

**Desktop:** Full spacing sesuai design system.

---

## 19.5 Grid System

### Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem; /* Mobile */
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem; /* Tablet */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 4rem; /* Desktop */
  }
}
```

### Grid Columns

**Mobile:** 1 column (default)
**Tablet (md):** 2-3 columns
**Desktop (lg+):** 3-4 columns

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

---

## 19.6 Navigation Patterns

### Mobile

**Header:**
- Logo (left)
- Hamburger menu (right)
- Search icon (optional)

**Menu Drawer:**
- Full-height overlay.
- Slide from left or right.
- Close button (X) di top-right.

**Bottom Nav (Customer App):**
```
┌─────────────────────────────────┐
│                                 │
│         Main Content            │
│                                 │
├─────┬─────┬─────┬─────┬─────────┤
│ 🏠  │ 🍔  │ 📦  │ 👤  │         │
│Home │Menu │Order│Profile│       │
└─────┴─────┴─────┴─────┴─────────┘
```

### Desktop

**Header:**
- Logo (left)
- Horizontal nav (center)
- User menu & cart (right)

**Admin Sidebar:**
- Logo (top)
- Navigation menu (scrollable)
- User profile (bottom)
- Collapse button

---

## 19.7 Component Adaptations

### Buttons

**Mobile:**
- Full-width buttons untuk primary actions.
- Minimum touch target: 44x44px.
- Stacked button group.

**Desktop:**
- Inline buttons.
- Auto-width dengan padding.
- Side-by-side button group.

### Forms

**Mobile:**
- Full-width input fields.
- Stacked labels.
- Large touch-friendly inputs.

**Desktop:**
- Max-width 600px untuk readability.
- Inline labels untuk short forms.
- Multi-column layout untuk long forms.

### Tables

**Mobile:**
- Card-based layout (1 card per row).
- Horizontal scroll untuk data table.
- Show/hide columns dropdown.

**Desktop:**
- Standard table layout.
- Fixed header (sticky).
- Sortable columns.

### Modals/Dialogs

**Mobile:**
- Full-screen modal.
- Slide up animation.
- Close button prominent.

**Desktop:**
- Centered modal (max-width 600px).
- Backdrop overlay.
- Escape to close.

---

## 19.8 Images & Media

### Responsive Images

```jsx
<Image
  src="/menu/latte.jpg"
  alt="Iced Latte"
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading="lazy"
/>
```

### Image Sizes

| Context | Mobile | Tablet | Desktop |
|---|---|---|---|
| Hero | 100vw | 100vw | 1920x1080 |
| Menu Item Card | 100vw | 50vw | 400x300 |
| Thumbnail | 80px | 120px | 150px |
| Gallery | 100vw | 50vw | 33vw |

### Video

- Autoplay disabled di mobile (save bandwidth).
- Poster image required.
- Play button overlay.

---

## 19.9 Touch & Interaction

### Touch Targets

- Minimum size: 44x44px (WCAG guideline).
- Spacing between targets: minimum 8px.
- Buttons, links, dan interactive elements harus cukup besar.

### Gestures

**Supported:**
- Tap (click)
- Long press (context menu)
- Swipe (carousel, dismiss)
- Pinch to zoom (images, maps)

**Avoid:**
- Double tap (ambiguous)
- Complex multi-finger gestures

### Hover States

- Hover states hanya di desktop (`:hover`).
- Active states untuk touch (`:active`).
- Focus states untuk keyboard (`:focus-visible`).

---

## 19.10 Performance Optimization

### Mobile

- Lazy load images below the fold.
- Defer non-critical JavaScript.
- Minimize bundle size (code splitting).
- Compress images (WebP format).
- Use system fonts untuk faster load.

### Desktop

- Preload critical assets.
- HTTP/2 server push (optional).
- Service worker caching (PWA).

---

## 19.11 Testing Checklist

**Devices:**
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] MacBook Air (1280px)
- [ ] Desktop 1920px

**Browsers:**
- [ ] Chrome (mobile & desktop)
- [ ] Safari (iOS & macOS)
- [ ] Firefox
- [ ] Edge

**Orientations:**
- [ ] Portrait
- [ ] Landscape

**Scenarios:**
- [ ] Browse menu
- [ ] Add to cart & checkout
- [ ] View order history
- [ ] Admin create menu item
- [ ] Admin view reports

---

## 19.12 Common Patterns

### Card Component

```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <img className="w-full h-48 object-cover" src="..." alt="..." />
  <div className="p-4">
    <h3 className="text-lg font-semibold">Item Name</h3>
    <p className="text-sm text-gray-600 mt-1">Description</p>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xl font-bold">IDR 38,000</span>
      <button className="btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

### Responsive Container

```jsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {items.map(item => <Card key={item.id} {...item} />)}
  </div>
</div>
```

### Adaptive Navigation

```jsx
{/* Mobile */}
<nav className="lg:hidden">
  <button onClick={toggleMenu}>☰</button>
  <MobileDrawer isOpen={isMenuOpen} />
</nav>

{/* Desktop */}
<nav className="hidden lg:flex space-x-6">
  <a href="/">Home</a>
  <a href="/menu">Menu</a>
  <a href="/about">About</a>
</nav>
```

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
