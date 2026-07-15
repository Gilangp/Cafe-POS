# 06. DESIGN SYSTEM, SECURITY, SEO & PERFORMANCE

## 30. DESIGN SYSTEM

### 30.1 Filosofi Desain

Identitas visual NEMU Space mengusung nuansa **modern, minimalis, elegan, premium, hangat, dan profesional**, dengan pendekatan desain orisinal — bukan replika Starbucks, namun terinspirasi dari kualitas storytelling visualnya.

### 30.2 Palet Warna

> Palet warna mengacu pada referensi visual konsep landing page yang diberikan (nuansa hijau tua elegan bergaya "handcrafted coffee premium" dengan latar krem hangat), namun tetap disusun sebagai identitas visual orisinal milik NEMU Space — bukan reproduksi identitas merek Starbucks.

| Token | Light Mode | Dark Mode | Penggunaan |
|---|---|---|---|
| `--color-primary` | #1E3D31 (Deep Forest Green) | #E8DCC8 (Warm Cream) | Warna utama merek: navbar/teks logo, judul besar, tombol utama (contoh: "Order Now"), footer |
| `--color-primary-hover` | #163026 (Darker Forest Green) | #F2E9DA (Lighter Cream) | State hover pada tombol/tautan utama |
| `--color-secondary` | #6F4E37 (Roasted Brown) | #A9825F (Muted Caramel) | Aksen sekunder, ikon kategori, garis pembatas dekoratif |
| `--color-accent` | #C89B5C (Warm Gold) | #D9B675 (Soft Gold) | Highlight, badge "Bestseller", harga, aksen CTA sekunder |
| `--color-background` | #FAF3E7 (Ivory Cream) | #14201A (Deep Pine Black-Green) | Latar belakang utama halaman |
| `--color-surface` | #FFFFFF | #1E2B24 | Kartu produk, modal, panel, search bar |
| `--color-surface-muted` | #F1E9DA (Beige Kertas) | #26332C | Latar section alternatif (contoh: section kategori dengan tekstur biji kopi) |
| `--color-text-primary` | #1E3D31 (Forest Green Dark) | #F5EFE6 | Teks judul & teks utama |
| `--color-text-secondary` | #5C5348 (Warm Grey Brown) | #B8A99A | Teks deskripsi, caption, label kecil |
| `--color-border` | #E4D9C4 | #33413A | Garis pembatas, input border, kartu outline |
| `--color-success` | #4C7A4C | #6FA96F | Status sukses/konfirmasi (reservasi dikonfirmasi) |
| `--color-warning` | #C79A3C | #E0B75C | Status peringatan (stok menipis, tiket melewati batas waktu) |
| `--color-danger` | #B23A34 | #D96A63 | Status error/tolak/void |

**Prinsip penerapan warna pada Landing Page** (mengacu referensi visual):
- **Hero Banner**: latar foto produk/suasana coffee shop dengan overlay tipis, judul besar menggunakan `--color-primary` (hijau tua) di atas latar krem/terang, tombol CTA solid hijau tua (`--color-primary`) dengan teks putih.
- **Section Kategori ("Handcrafted Curations")**: latar gelap bertekstur (foto biji kopi close-up dengan overlay hijau tua transparan) agar ikon kategori berbentuk bulat/organik dengan foto produk tetap kontras dan menonjol.
- **Section Menu Favorit ("Barista Recommends")**: latar krem/putih (`--color-background`), kartu produk `--color-surface` dengan bayangan lembut, harga ditonjolkan dengan `--color-primary` atau `--color-accent`, badge "Bestseller" menggunakan `--color-accent`.
- **Footer**: latar solid `--color-primary` (hijau tua) dengan teks krem/putih, mengikuti pola pada referensi visual.

### 30.3 Tipografi

| Elemen | Font | Ukuran (Desktop) | Ukuran (Mobile) | Bobot |
|---|---|---|---|---|
| Heading 1 | Poppins / Playfair Display (untuk judul hero) | 48px | 32px | 700 |
| Heading 2 | Poppins | 36px | 26px | 600 |
| Heading 3 | Poppins | 24px | 20px | 600 |
| Body Text | Inter | 16px | 14px | 400 |
| Caption | Inter | 13px | 12px | 400 |
| Button Text | Inter | 15px | 14px | 500 |

### 30.4 Sistem Spacing

Menggunakan skala kelipatan **8px**: `4px (0.5x), 8px (1x), 16px (2x), 24px (3x), 32px (4x), 48px (6x), 64px (8x), 96px (12x)`.

### 30.5 Border Radius & Elevation

| Token | Nilai | Penggunaan |
|---|---|---|
| `--radius-sm` | 6px | Input, badge kecil |
| `--radius-md` | 12px | Card, tombol |
| `--radius-lg` | 20px | Modal, section besar |
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Kartu ringan |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,0.08) | Kartu utama, dropdown |
| `--shadow-lg` | 0 12px 32px rgba(0,0,0,0.12) | Modal, hero overlay |

### 30.6 Iconography

Seluruh ikon menggunakan **Lucide React** secara konsisten di seluruh halaman (publik maupun dashboard). Tidak diperkenankan menggunakan emoji dalam antarmuka maupun konten teks sistem.

### 30.7 Motion & Animasi (Framer Motion)

| Interaksi | Durasi | Easing |
|---|---|---|
| Fade in section saat scroll | 400ms | ease-out |
| Hover pada kartu menu | 200ms | ease-in-out |
| Transisi buka/tutup modal | 250ms | ease-in-out |
| Slider Hero Banner | 600ms | ease-in-out (auto-slide 5 detik) |
| Toggle Dark/Light Mode | 300ms | linear (crossfade warna) |

---

## 31. UI COMPONENTS

Komponen dibangun di atas **shadcn/ui** dengan kustomisasi token warna sesuai Design System.

| Komponen | Varian | Penggunaan |
|---|---|---|
| Button | Primary, Secondary, Outline, Ghost, Destructive | CTA, aksi form, aksi tabel |
| Card | Default, Elevated, Interactive (hover) | Menu, artikel, galeri, dashboard widget |
| Modal/Dialog | Standard, Confirmation, Fullscreen (mobile) | Tambah/edit data, konfirmasi hapus |
| Input, Textarea, Select | Default, Error State, Disabled | Seluruh form |
| Data Table | Sortable, Filterable, Paginated | Daftar menu, transaksi, reservasi, inventory |
| Badge | Status (Aktif/Nonaktif, Tersedia/Habis, Menunggu/Dikonfirmasi/Ditolak) | Indikator status |
| Toast/Notification | Success, Error, Warning, Info | Feedback aksi pengguna |
| Sidebar Navigation | Collapsible, Grouped Menu | Dashboard internal |
| Navbar | Sticky, Transparent-to-Solid on scroll | Halaman publik |
| Tabs | Underline style | Filter kategori menu/laporan |
| Accordion | FAQ style | Section FAQ |
| Carousel/Slider | Auto-play, Swipeable | Hero Banner, Testimoni |
| Chart | Line, Bar, Donut (menggunakan Recharts) | Dashboard Owner |
| Skeleton Loader | Shimmer effect | Loading state seluruh halaman |
| Empty State | Ilustrasi + teks | Data kosong (contoh: belum ada reservasi) |

---

## 32. RESPONSIVE DESIGN GUIDELINES

### 32.1 Breakpoint

| Breakpoint | Lebar Layar | Target Perangkat |
|---|---|---|
| `xs` | < 480px | Mobile kecil |
| `sm` | 480px – 767px | Mobile |
| `md` | 768px – 1023px | Tablet |
| `lg` | 1024px – 1439px | Laptop |
| `xl` | ≥ 1440px | Desktop besar |

### 32.2 Prinsip Mobile First

1. Seluruh komponen dirancang untuk layar mobile terlebih dahulu, kemudian ditingkatkan (progressive enhancement) untuk layar lebih besar.
2. Grid menu: 1 kolom (mobile), 2 kolom (tablet), 3–4 kolom (laptop/desktop).
3. Sidebar dashboard otomatis menjadi **bottom navigation/drawer** pada mobile.
4. Tabel data (Data Table) beralih menjadi tampilan **card list** pada layar mobile untuk mencegah horizontal scroll.
5. Font size dan spacing menyesuaikan skala fluida agar tetap nyaman dibaca di seluruh ukuran layar.
6. Tidak diperbolehkan adanya elemen yang menyebabkan horizontal scroll pada breakpoint manapun.

---

## 33. ACCESSIBILITY GUIDELINES

1. Kontras warna teks terhadap latar belakang minimal memenuhi rasio **4.5:1** (WCAG 2.1 AA) baik pada Light Mode maupun Dark Mode.
2. Seluruh elemen interaktif (tombol, tautan, input) dapat diakses menggunakan navigasi keyboard (`Tab`, `Enter`, `Esc`).
3. Seluruh gambar wajib memiliki atribut `alt` deskriptif, diisi melalui CMS saat upload media.
4. Formulir (form) wajib memiliki label yang terasosiasi dengan input (`label for`) dan pesan error yang jelas.
5. Menggunakan elemen HTML semantik (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`) untuk mendukung pembaca layar (screen reader).
6. Ukuran target sentuh (tap target) minimal 44x44px pada tampilan mobile.
7. Animasi/transisi menghormati preferensi pengguna `prefers-reduced-motion`.

---

## 34. SECURITY GUIDELINES

| Aspek | Implementasi |
|---|---|
| Authentication | Laravel Sanctum dengan token berbasis session/personal access token, masa berlaku token dikonfigurasi sesuai kebutuhan (auto-expire setelah tidak aktif) |
| RBAC | Middleware role-based di setiap route API sesuai matriks pada Bab 25 |
| Validasi Input | Form Request Validation di Laravel (backend) dan Zod schema (frontend) untuk seluruh input pengguna |
| CSRF Protection | Token CSRF untuk seluruh request yang berasal dari sesi berbasis cookie (khusus SPA authentication Sanctum) |
| XSS Protection | Sanitasi output HTML pada konten WYSIWYG (Artikel, Tentang Kami) menggunakan library sanitizer sebelum disimpan/ditampilkan |
| SQL Injection Protection | Penggunaan Eloquent ORM/Query Builder dengan parameter binding, tidak ada raw query tanpa binding |
| Audit Log | Mencatat seluruh aksi create/update/delete yang dilakukan pengguna internal, termasuk timestamp dan IP address |
| Password Policy | Minimal 8 karakter, kombinasi huruf & angka, disimpan dengan hashing (bcrypt) |
| Rate Limiting | Pembatasan jumlah percobaan login (contoh: maksimal 5x percobaan per 15 menit) untuk mencegah brute force |
| File Upload Security | Validasi tipe MIME file, pembatasan ukuran, penamaan ulang file secara acak untuk mencegah path traversal |
| HTTPS | Seluruh komunikasi Frontend ↔ Backend ↔ Database wajib menggunakan TLS/HTTPS |

---

## 35. SEO GUIDELINES

| Aspek | Implementasi |
|---|---|
| Meta Title | Dinamis per halaman (Landing Page, Menu, Artikel), dapat diatur melalui CMS, maksimal 60 karakter |
| Meta Description | Dinamis per halaman, maksimal 160 karakter |
| Open Graph | Tag `og:title`, `og:description`, `og:image`, `og:url` untuk seluruh halaman publik agar tampil optimal saat dibagikan di media sosial |
| Twitter Card | Tag `twitter:card`, `twitter:title`, `twitter:image` |
| Schema.org | Markup `LocalBusiness`/`Restaurant` (nama, alamat, jam operasional, rating) dan `Article` untuk halaman blog |
| XML Sitemap | `sitemap.xml` digenerate otomatis mencakup seluruh halaman publik dan artikel yang dipublikasikan |
| Robots.txt | Mengizinkan crawling halaman publik, melarang crawling halaman dashboard internal (`/admin`, `/kasir`, `/owner`) |
| URL Slug | Slug otomatis dari judul (artikel, menu) namun dapat diedit manual oleh Admin |
| Canonical URL | Diterapkan pada seluruh halaman untuk mencegah duplikasi konten |

---

## 36. PERFORMANCE GUIDELINES

| Aspek | Implementasi |
|---|---|
| Lazy Loading | Gambar dan komponen di luar viewport dimuat menggunakan lazy loading (`next/image` dengan `loading="lazy"`) |
| Optimasi Gambar | Kompresi otomatis dan konversi ke format WebP saat upload ke Supabase Storage, penyediaan multiple resolusi (responsive image) |
| Code Splitting | Pemisahan bundle JavaScript per route menggunakan fitur bawaan Next.js App Router |
| Responsive Image | Penggunaan `srcset`/`sizes` melalui komponen `next/image` agar ukuran gambar sesuai perangkat |
| Caching | Cache API response pada endpoint publik (contoh: `/menus`, `/landing-page`) menggunakan HTTP cache header & revalidasi ISR pada Next.js |
| Database Indexing | Index pada kolom yang sering difilter/diurutkan (lihat Bab 26) |
| CDN | Aset statis dan gambar dilayani melalui CDN Supabase Storage & Vercel Edge Network |
| Monitoring | Pengukuran Core Web Vitals (LCP, FID/INP, CLS) secara berkala menggunakan Lighthouse/Vercel Analytics |
