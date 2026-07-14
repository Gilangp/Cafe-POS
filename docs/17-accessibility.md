# 17. Accessibility

**Dokumen:** WCAG 2.2 Level AA Accessibility Specification
**Versi:** 1.0.0
**Status:** Baseline

---

## 17.1 Accessibility Goals

Velvra harus dapat digunakan oleh semua orang, termasuk:
- Pengguna dengan disabilitas visual (screen reader, low vision)
- Pengguna dengan disabilitas motorik (keyboard-only navigation)
- Pengguna dengan disabilitas kognitif (clear language, simple navigation)
- Pengguna dengan disabilitas pendengaran (captions, visual alerts)

Target: **WCAG 2.2 Level AA** compliance.

---

## 17.2 Semantic HTML

- Gunakan elemen HTML semantik: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`.
- Hindari `<div>` soup. Gunakan elemen yang sesuai dengan kontennya.
- Form harus punya `<label>` untuk setiap `<input>`.
- Button harus pakai `<button>`, bukan `<div onclick>`.

**Contoh:**
```html
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/menu">Menu</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1>Welcome to Velvra</h1>
  <article>...</article>
</main>
```

---

## 17.3 Keyboard Navigation

- Semua interaksi harus accessible via keyboard (Tab, Enter, Space, Arrow keys).
- Focus indicator harus visible (outline, ring).
- Logical tab order (top to bottom, left to right).
- Skip navigation link untuk bypass header.
- Modal/dialog harus trap focus dan return focus saat close.

**Testing:** Navigate seluruh aplikasi hanya dengan keyboard.

---

## 17.4 Screen Reader Support

### ARIA Labels

```html
<button aria-label="Add to cart">
  <svg>...</svg>
</button>

<nav aria-label="Breadcrumb">...</nav>

<div role="alert" aria-live="polite">
  Item added to cart
</div>
```

### Alt Text

```html
<img src="latte.jpg" alt="Iced latte with latte art" />
<img src="logo.png" alt="Velvra Coffee logo" />
<img src="decorative-pattern.png" alt="" /> <!-- Decorative, empty alt -->
```

### ARIA States

```html
<button aria-expanded="false" aria-controls="menu-dropdown">
  Menu
</button>

<input type="checkbox" aria-checked="true" />
```

---

## 17.5 Color & Contrast

- **Contrast Ratio:** Minimum 4.5:1 untuk normal text, 3:1 untuk large text (18px+).
- Jangan hanya andalkan warna untuk informasi (gunakan icon, text, atau pattern tambahan).
- Support dark mode untuk low vision users.

**Tools:** WebAIM Contrast Checker, Chrome DevTools Lighthouse.

---

## 17.6 Forms Accessibility

```html
<form>
  <label for="email">Email address</label>
  <input 
    type="email" 
    id="email" 
    name="email" 
    required 
    aria-required="true"
    aria-describedby="email-help"
  />
  <span id="email-help">We'll never share your email.</span>
  
  <span role="alert" aria-live="assertive">
    <!-- Error message akan diumumkan screen reader -->
    Invalid email format
  </span>
</form>
```

**Validation:**
- Error message harus jelas dan spesifik.
- Focus otomatis ke field pertama yang error.
- Inline validation sebaiknya real-time (tidak harus submit dulu).

---

## 17.7 Interactive Components

### Modal/Dialog

```jsx
<Dialog 
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  role="dialog"
  aria-modal="true"
>
  <h2 id="modal-title">Confirm Order</h2>
  <p id="modal-description">Are you sure you want to place this order?</p>
  <button onClick={confirm}>Confirm</button>
  <button onClick={cancel}>Cancel</button>
</Dialog>
```

- Trap focus di dalam modal.
- Escape key untuk close.
- Return focus ke trigger element setelah close.

### Dropdown Menu

```jsx
<button 
  aria-haspopup="true" 
  aria-expanded={isOpen}
  onClick={toggleMenu}
>
  Account
</button>
<ul role="menu" aria-labelledby="account-button">
  <li role="menuitem"><a href="/profile">Profile</a></li>
  <li role="menuitem"><a href="/orders">Orders</a></li>
</ul>
```

---

## 17.8 Multimedia

- **Video:** Sediakan captions (subtitles) dan transcript.
- **Audio:** Sediakan transcript.
- **Autoplay:** Hindari autoplay dengan audio. Jika harus, sediakan pause/stop button yang jelas.

---

## 17.9 Responsive & Mobile Accessibility

- Touch target minimum 44x44px.
- Jangan gunakan hover-only interaction (pakai click/tap juga).
- Support pinch-to-zoom (jangan disable user-scalable).
- Orientation support (portrait & landscape).

---

## 17.10 Testing Checklist

**Automated:**
- [ ] Run Lighthouse accessibility audit (score > 90).
- [ ] Run axe DevTools.
- [ ] Run WAVE browser extension.

**Manual:**
- [ ] Keyboard-only navigation seluruh aplikasi.
- [ ] Test dengan screen reader (NVDA/JAWS di Windows, VoiceOver di Mac/iOS).
- [ ] Test contrast ratio semua text.
- [ ] Test focus indicator visible.
- [ ] Test form error handling.

**User Testing:**
- [ ] Test dengan user disabilitas visual.
- [ ] Test dengan user yang hanya pakai keyboard.

---

## 17.11 Accessibility Statement

Website harus punya halaman `/accessibility` yang menjelaskan:
- Target compliance (WCAG 2.2 Level AA).
- Known issues dan workaround.
- Contact untuk melaporkan masalah accessibility.
- Tanggal last review.

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
