# 🔍 Gap Analysis — Velvra Platform vs PRD
**Tanggal:** 2026-07-14 | **Status:** MVP In Progress

---

## ✅ Sudah Selesai (Implemented)

| Area | Yang Sudah Ada |
|---|---|
| **Frontend** | Landing page single-page dengan 10 section (Hero, Featured, About, Journey, Testimonials, Menu, Locations, Contact, Footer) |
| **Frontend** | Sistem bilingual dinamis ID/EN dengan `LanguageContext` + `localStorage` persistence |
| **Frontend** | Header responsif dengan language switcher icon Globe |
| **Frontend** | Design system premium (Tailwind, Playfair Display, Inter, warna `#BA935D`) |
| **Backend - Auth** | `AuthController` (login, register, logout, refresh, me) |
| **Backend - Branch** | `BranchController` — CRUD cabang lengkap |
| **Backend - Category** | `CategoryController` — CRUD kategori menu |
| **Backend - Product** | `ProductController` — CRUD produk + filter |
| **Backend - Order** | `OrderController` — buat order, update status, cancel, history |
| **Backend - Inventory** | `InventoryController` — stok, transaksi, low-stock alert |
| **Backend - POS** | `PosController` — sesi kasir, transaksi, ringkasan shift |
| **Backend - KDS** | `KdsController` — antrian tiket dapur, update status |
| **Backend - Report** | `ReportController` — sales report, inventory report |
| **Backend - User** | `UserController` — CRUD user, ganti password |
| **Database** | 16 migrasi lengkap (branches, users, products, orders, inventory, recipes, memberships, reservations, POS, audit, CMS, dsb.) |
| **Database** | 11 seeder siap (admin, branch, categories, products, roles, membership tiers, CMS, dsb.) |
| **Models** | 26 Eloquent models lengkap dengan relasi |

---

## 🔴 Belum Ada / Hanya Stub (Gap Kritis)

### Backend — Controller Masih STUB (hanya return message string)

| Controller | Endpoint | Prioritas PRD |
|---|---|---|
| `EmployeeController` | CRUD karyawan (shift, jabatan, absensi) | Must — HR Module |
| `SupplierController` | CRUD supplier + purchase order | Must — Inventory |
| `PageController` | CRUD halaman CMS | Must — CMS |
| `PostController` | CRUD blog/artikel | Should — CMS |
| `MediaController` | Upload/kelola media library | Must — CMS |
| `SettingController` | Setting sistem (brand config, integrasi) | Must — Admin |

### Backend — Module Belum Ada Sama Sekali

| Module PRD | Status |
|---|---|
| `ReservationController` | ❌ Belum ada (ada modelnya, tidak ada controller) |
| `TableController` | ❌ Belum ada (manajemen meja per cabang) |
| `RecipeController` | ❌ Belum ada (CRUD resep & bahan baku HPP) |
| `PromotionController` | ❌ Belum ada (promo & diskon) |
| `MemberController` / CRM | ❌ Belum ada (ada model Member, tidak ada controller) |
| `LoyaltyController` | ❌ Belum ada (poin, tier, penukaran) |
| `PurchaseOrderController` | ❌ Belum ada (ada model PurchaseOrder, tidak ada controller) |
| `NotificationController` | ❌ Belum ada |
| `QrOrderController` | ❌ Belum ada (QR Ordering flow) |

### Frontend — Halaman/Module Belum Ada

| Halaman / Module | Status |
|---|---|
| `/admin` — Admin Dashboard | ❌ Belum ada |
| `/admin/pos` — POS UI (kasir) | ❌ Belum ada |
| `/admin/kds` — KDS UI (dapur) | ❌ Belum ada |
| `/admin/inventory` | ❌ Belum ada |
| `/admin/orders` | ❌ Belum ada |
| `/admin/menu` & `/admin/recipes` | ❌ Belum ada |
| `/admin/reservations` & `/admin/tables` | ❌ Belum ada |
| `/admin/crm` & `/admin/memberships` | ❌ Belum ada |
| `/admin/employees` & `/admin/branches` | ❌ Belum ada |
| `/admin/reports` & `/admin/analytics` | ❌ Belum ada |
| `/admin/cms` (blog, pages, gallery, events) | ❌ Belum ada |
| `/admin/settings` (roles, branding) | ❌ Belum ada |
| `/account` — Customer Portal | ❌ Belum ada |
| `/order` — Online Ordering Flow | ❌ Belum ada |
| `/reserve` — Reservation Flow | ❌ Belum ada |
| `/menu/[category]/[slug]` — Menu Detail | ❌ Belum ada |
| `/qr/[tableCode]` — QR Ordering | ❌ Belum ada |

### Integrasi & Infrastruktur

| Komponen | Status |
|---|---|
| **Database Supabase** | 🟡 Terkoneksi tapi belum migrate (password perlu dikonfirmasi) |
| **JWT Auth** (akses + refresh token) | 🟡 Ada AuthController tapi belum menggunakan `tymon/jwt-auth` — masih Sanctum |
| **Queue/Worker** | ❌ Belum dikonfigurasi (`sync` driver, belum ada job/listener domain event) |
| **Email (Resend)** | ❌ Belum dikonfigurasi (MAIL masih ke mailhog lokal) |
| **Storage (Cloudflare R2)** | ❌ Belum ada (masih local disk) |
| **WebSocket / Real-time** | ❌ Belum ada (KDS & POS butuh real-time notif) |
| **RBAC Middleware di Routes** | 🟡 Ada role/permission table, tapi belum enforce di setiap endpoint |
| **OpenAPI / API Docs** | ❌ Belum ada dokumentasi endpoint |

---

## 📋 Prioritas Pengerjaan Selanjutnya

### 🔥 Fase 1 — Database & Backend Core (Selesaikan Dulu)
1. ✅ Fix koneksi Supabase (masukkan password benar → migrate → seed)
2. Implementasi `SupplierController` + `PurchaseOrderController` (Inventory lengkap)
3. Implementasi `ReservationController` + `TableController`
4. Implementasi `RecipeController` + `PromotionController`
5. Implementasi `MemberController` + `LoyaltyController`
6. Implementasi stub controllers (`Employee`, `Page`, `Post`, `Media`, `Setting`)

### 🚀 Fase 2 — Frontend Admin Dashboard
7. Layout Admin (`/admin`) dengan sidebar, branch switcher
8. Admin POS UI (`/admin/pos`)
9. Admin KDS UI (`/admin/kds`)
10. Admin Inventory, Orders, Menu, Reports

### 🌐 Fase 3 — Customer-Facing Pages
11. Online Ordering `/order`
12. Reservation `/reserve`
13. Customer Portal `/account`
14. QR Ordering `/qr/[tableCode]`

### ⚙️ Fase 4 — Integrasi & Infrastruktur
15. JWT Auth migration (ganti Sanctum → tymon/jwt-auth)
16. Email via Resend
17. File Storage via Cloudflare R2 / Supabase Storage
18. WebSocket real-time (KDS/POS)
19. Deploy: Vercel (frontend) + Render/Koyeb (backend)

---

## 📊 Progress Summary

| Layer | Progress |
|---|---|
| **Database (Schema)** | ✅ 100% — 16 migrasi lengkap |
| **Backend (Models)** | ✅ 95% — 26 model, relasi lengkap |
| **Backend (Controllers)** | 🟡 45% — 7 lengkap, 6 stub, 8 belum ada |
| **Backend (Auth/RBAC)** | 🟡 60% — struktur ada, enforcement belum penuh |
| **Frontend (Landing)** | ✅ 100% — 10 section, bilingual, responsif |
| **Frontend (Admin)** | ❌ 0% — belum ada |
| **Frontend (Customer Portal)** | ❌ 0% — belum ada |
| **Integrasi (DB Cloud)** | 🟡 80% — tinggal fix password Supabase |
| **Integrasi (Email/Storage)** | ❌ 0% — belum dikonfigurasi |
| **Overall MVP** | 🟡 ~40% |
