# 20. Panduan Eksekusi, Checklist Audit & Verifikasi Sistem (Master Implementation Plan)

**Dokumen:** Master Implementation Roadmap, Audit Checklist & System Verification Guide  
**Versi:** 1.0.0 (Baseline v1.0)  
**Status:** Approved for Implementation  
**Referensi Utama:** Master PRD (`prd.md`), Arsitektur Sistem (`02`), Database Design (`04`), RBAC (`07`), dan Modul Fungsional (`08`).

---

## 20.1 Pendahuluan & Tujuan Dokumen

Dokumen ini adalah **Panduan Kerja Operasional dan Teknikal dari Awal hingga Akhir (*End-to-End Execution Handbook*)** bagi tim teknis (Backend, Frontend, QA, dan DevOps) untuk membangun, mengaudit, dan memverifikasi platform **Velvra v1.0**. 

Dokumen ini membagi siklus implementasi menjadi **6 Fase / Sprint Kerja** yang terurut berdasarkan ketergantungan teknis (*technical dependencies*), menetapkan **5 Pilar Audit Wajib**, serta memberikan panduan praktis tentang **Metodologi Verifikasi & Pengecekan Sistem**.

---

## 20.2 Roadmap Eksekusi Awal–hingga–Akhir (Phase by Phase)

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 0 (Sprint 0): Foundation Setup, Schema Audit & RBAC Baseline     │
│ (Migrasi DB, 13 Role Seeder, Multi-Branch Scope, Environment Config)  │
└────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 (Sprint 1): Security, Auth Gateway & Core RBAC Engine          │
│ (JWT Auth, Permission Middleware, Branch Scope Isolation, Next.js Shell)│
└────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2 (Sprint 2): Core Catalog, Recipe Costing & Supply Chain        │
│ (Menu/Modifiers, Recipe COGS Engine, Inventory FEFO Batch, Warehouse/PO)│
└────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3 (Sprint 3): POS Offline-First & KDS Real-Time Display          │
│ (POS IndexedDB Queue, Sync-on-Reconnect, KDS WebSockets & Buffering)   │
└────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4 (Sprint 4): Customer Digital Channels & CRM 360                │
│ (Online Ordering, QR At-Table Ordering, Customer Portal, Loyalty/CRM)  │
└────────────────────────────────────────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 5 & 6 (Sprint 5-6): CMS, Analytics, Polish, Audit & Go-Live      │
│ (CMS Builder, Analytics, Audit Logs, Performance Engineering, DevOps)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 0 (Sprint 0): Foundation Setup, Schema Audit & RBAC Baseline
**Tujuan:** Mempersiapkan seluruh skema database, data awal (seeding), dan arsitektur dasar agar seluruh pengembang dapat bekerja pada fondasi yang sama.

1. **Audit & Sinkronisasi Migrasi Database (`backend/database/migrations`):**
   - Periksa 16 file migrasi yang ada di `backend/database/migrations`.
   - Pastikan migrasi mencakup seluruh entitas spesifikasi `04-database-design.md` & PRD Bab 11, termasuk:
     - `warehouses`, `stock_batches` (FEFO tracking), `stock_movements`.
     - `suppliers`, `supplier_items`, `purchase_orders`, `purchase_order_items`.
     - `user_branch_scope` (pemetaan scope cabang per user).
     - `modifier_groups`, `modifiers`, `order_item_modifiers`.
     - `promotions`, `tables`, `reservations`, `kds_tickets`.
     - `employees`, `shifts`.
   - Pastikan tipe data uang menggunakan `BIGINT price_cents` dan timestamp menggunakan `TIMESTAMPTZ` UTC.

2. **Penyelarasan Seeder RBAC (`RolePermissionSeeder.php`):**
   - Perbarui seeder untuk membuat tepat **13 System Roles resmi (`07-roles-dan-permissions.md`)**:
     `super_admin`, `regional_analyst`, `branch_manager`, `shift_supervisor`, `cashier`, `kitchen_staff`, `inventory_officer`, `hr_manager`, `marketing_manager`, `crm_officer`, `customer`, `guest`, `api_partner`.
   - Seed matriks permission lengkap untuk 18 resource (`menu.*`, `orders.*`, `inventory.*`, `purchasing.*`, `kds.*`, `reservations.*`, `promotions.*`, `loyalty.*`, `crm.*`, `hr.*`, `branches.*`, `cms.*`, `media.*`, `analytics.*`, `audit.*`, `settings.*`, `notifications.*`).

3. **Seeding Data Operasional Dummy (`OperationalSeeder.php`):**
   - Seed data organisasi utama (`Velvra Coffee Group`) dan minimal 2 cabang (`Branch 01 - SCBD`, `Branch 02 - Senopati`) dengan zona waktu `Asia/Jakarta` dan mata uang `IDR`.
   - Seed akun admin per role, sampel menu dengan resep baku, dan saldo awal inventaris.

---

### Phase 1 (Sprint 1): Security, Auth Gateway & Core RBAC Engine
**Tujuan:** Membangun benteng keamanan API, isolasi multi-cabang, serta *shell application* di frontend Next.js.

1. **Backend Auth & RBAC Engine (Laravel):**
   - Implementasi autentikasi **JWT Stateless** (`POST /api/v1/auth/login`, `refresh`, `logout`).
   - Implementasi Custom Middleware `CheckUserPermission` (`middleware('permission:orders.create')`) untuk menolak akses (`403 Forbidden`) jika role user tidak memiliki permission yang diminta.
   - Implementasi Custom Middleware `CheckBranchScope` & **Global Eloquent Branch Scoping**:
     ```php
     // Otomatis membatasi query Eloquent pada cabang yang diizinkan untuk user aktif
     $builder->whereIn('branch_id', auth()->user()->getScopedBranchIds());
     ```
   - Standardisasi format respons JSON dan format error spesifik (`INSUFFICIENT_STOCK`, `SCOPE_VIOLATION`, `UNAUTHORIZED`).

2. **Frontend Architecture & Shell (Next.js 15):**
   - Konfigurasi HTTP Client (`lib/api.ts`) dengan JWT Interceptor dan mekanisme refresh token otomatis.
   - Implementasi React Context / Custom Hooks (`useAuth()`, `usePermission()`, `useBranchScope()`) untuk mengatur visibilitas menu dan tombol di UI Admin berdasarkan hak akses.
   - Pembangunan **Global Branch Switcher (`ADM-002`)** pada header Admin Dashboard yang menyisipkan header `X-Branch-Id` pada setiap request API ke backend.

---

### Phase 2 (Sprint 2): Core Catalog, Recipe Costing Engine & Supply Chain Foundation
**Tujuan:** Membangun tulang punggung produk, resep, dan inventaris sebelum transaksi penjualan diaktifkan.

1. **Modul Menu & Modifiers (`MNU`):**
   - CRUD Kategori, Item Menu, Modifier Groups, dan Modifiers via API & UI Admin.
   - Implementasi fitur *override* harga dan status ketersediaan (*86'd status*) per cabang dan per saluran (POS vs Online).

2. **Modul Recipe & COGS Costing Engine (`RCP`):**
   - Pembuatan Bill-of-Materials (BoM) resep untuk setiap item menu.
   - Implementasi **Recipe Costing Engine (`RCP-003`)**: Sistem menghitung COGS per item secara dinamis menggunakan rata-rata tertimbang biaya bahan (`weighted-average cost`) dari batch stok yang masuk.

3. **Modul Inventory & Warehouse Management (`INV`, `WHS`, `SUP`, `PUR`):**
   - Manajemen SKU inventaris, batas reorder (*reorder point*), dan peringatan stok menipis.
   - Implementasi **Batch Tracking & FEFO Engine (`INV-006`)**: Penerimaan barang dicatat dalam batch (`stock_batches`) dengan tanggal kedaluwarsa. Logika pemotongan stok wajib memprioritaskan batch yang paling cepat expired (*First-Expired-First-Out*).
   - Alur kerja Purchase Order (PO): *Draft → Submitted → Approved (Branch Manager/Inventory Officer) → Received (Update stock & COGS)*.

---

### Phase 3 (Sprint 3): POS Offline-First & KDS Real-Time Display
**Tujuan:** Membangun antarmuka kasir fisik di toko dengan ketahanan jaringan tinggi dan layar dapur live.

1. **Terminal POS (`POS`) — Offline-First Resilience (`POS-002`):**
   - UI POS (*Large touch target*, tab kategori, *modifier quick select*, split bill, split payment multi-tender).
   - **Offline Engine via IndexedDB (`localforage` / TanStack Query Persist):**
     Jika koneksi internet putus, POS tetap dapat memproses pesanan secara offline dengan mengantre transaksi di dalam IndexedDB lokal.
   - **Sync-on-Reconnect Protocol:** Saat koneksi kembali terhubung, POS mengirim antrean pesanan (`POST /api/v1/orders/batch-sync`) dengan *idempotency keys* untuk dicatat di server dan memotong stok secara valid.

2. **Kitchen Display System (`KDS`) — Real-Time & Local Buffering (`KDS-005`):**
   - Integrasi **Laravel Broadcasting (WebSockets via Soketi / Pusher)** untuk meneruskan pesanan baru dari POS/Online langsung ke layar KDS (`branch.{id}.kitchen`).
   - Layar KDS dengan pengelompokan tiket, indikator warna durasi antrean (*aging alert*), dan perubahan status prep (*In Progress → Ready*).
   - **Local Network Buffering (`KDS-005`):** KDS dikonfigurasi untuk tetap menerima event dari server lokal toko apabila koneksi internet luar terputus sementara.

---

### Phase 4 (Sprint 4): Customer Digital Channels & CRM 360
**Tujuan:** Memperluas saluran penjualan ke web online, pemesanan di meja via QR, dan program kesetiaan pelanggan.

1. **Online Ordering (`ORD`) & QR At-Table Ordering (`QRO`):**
   - Landing Web & Catalog: Pemilihan cabang di awal, manajemen keranjang belanja (*cart*), dan checkout (Guest & Authenticated).
   - **Idempotent Order Execution (`ORD-004`):** Setiap pengiriman pesanan wajib menyertakan `Idempotency-Key` dari client untuk mencegah pemotongan saldo atau double order saat koneksi lambat.
   - QR At-Table Ordering: Scanning QR di meja (`TBL-003`) otomatis mengisi parameter `branch_id` dan `table_id`, memungkinkan bayar di meja (*Pay Now*) atau buka tab (*Pay at Counter*).

2. **Customer Portal (`PORT`), Membership & Loyalty (`LOY`), & CRM (`CRM`):**
   - Akun member (`/account`): Riwayat pesanan, reorder, reservasi, alamat, dan pengelolaan metode bayar tersinkronisasi (PCI SAQ-A tokenization).
   - Loyalty Engine: Perhitungan perolehan poin otomatis saat transaksi selesai, dan penukaran poin (*points redemption*) sebagai potongan diskon di POS/Checkout.
   - Customer 360 View: Dasbor admin/support untuk melihat riwayat interaksi, preferensi alergen, dan catatan layanan (*support notes*) per pelanggan.

---

### Phase 5 & 6 (Sprint 5-6): CMS, Analytics, Polish, Audit & Go-Live
**Tujuan:** Melengkapi fitur manajemen konten, dasbor analitik eksekutif, rekam jejak audit, dan optimasi performa menuju rilis produksi.

1. **CMS, Media Library & Promotions (`CMS`, `MED`, `PRO`, `BLG`, `EVT`, `CAR`):**
   - Page builder berbasis blok untuk halaman statis, artikel blog, event, dan lowongan karir dengan alur *Draft/Review/Publish*.
   - Integrasi penyimpanan gambar Cloudflare R2 dengan generasi *responsive image (`srcset` WebP/AVIF)*.
   - Manajemen promo (diskon %, potongan nominal, BOGO, bundle) dengan validasi ketat di server (`PRO-004`).

2. **Analytics (`ANL`), Reports (`REP`) & Audit Logs (`AUD`):**
   - Dasbor analitik perbandingan lintas cabang untuk Executive (`ANL-001`) dan dasbor khusus cabang untuk Branch Manager (`ANL-002`).
   - Export laporan CSV/PDF melalui *async queued job* (`REP-002`).
   - **Immutable Audit Logs (`AUD-001`):** Pencatatan otomatis setiap mutasi data sensitif (CUD) ke tabel `audit_logs` (*append-only* dengan snapshot `old_values` dan `new_values`).

3. **Performance Engineering, Testing & DevOps (`§10`, `§11`, `§12`):**
   - Optimasi index database, query caching Redis, dan pemisahan queue workers (High, Default, Low priority).
   - CI/CD automated test pipeline dan deployment via Kamal / Docker ke VPS produksi dengan Cloudflare CDN/WAF.

---

## 20.3 Daftar Audit Wajib (Checklist Audit & Quality Assurance)

Sebelum sistem dinyatakan siap untuk diuji coba (`Staging`) maupun diluncurkan (`Production Go-Live`), tim QA dan Tech Lead wajib menjalankan **5 Pilar Audit** berikut:

### 1. Audit Skema & Integritas Database (Schema Audit)
- [ ] **Foreign Key & Constraint Audit:** Pastikan setiap relasi (`branch_id`, `user_id`, `inventory_item_id`, `menu_item_id`) memiliki constraint yang tepat (`ON DELETE RESTRICT` untuk data operasional, `ON DELETE CASCADE` untuk pivot tables/items anak).
- [ ] **Financial Precision Audit:** Verifikasi bahwa seluruh nilai moneter tanpa terkecuali disimpan dalam integer minor unit (`price_cents`, `cost_cents`, `total_cents` tipe `BIGINT`), tidak pernah menggunakan `FLOAT` atau `DOUBLE` untuk mencegah *rounding error*.
- [ ] **UTC Timestamp & Soft Delete Audit:** Pastikan semua tabel transaksi memiliki `created_at` / `updated_at` dengan zona waktu UTC, serta tabel master operasional (`users`, `branches`, `menu_items`, `inventory_items`, `orders`) terpasang `deleted_at` (*soft deletes*).
- [ ] **Index Verification Audit:** Pastikan indeks gabungan kritis telah terpasang di database (`orders_branch_id_created_at_idx`, `inventory_transactions_item_created_idx`, `users_branch_id_idx`).

### 2. Audit Keamanan & Isolasi RBAC (Security & Scope Audit)
- [ ] **IDOR / Cross-Branch Data Leakage Audit:** Lakukan pengujian di mana *Branch Manager* atau *Cashier* dari Cabang A mencoba mengakses URI API milik Cabang B (misal `GET /api/v1/orders/999` di mana order 999 milik Cabang B). Sistem **wajib** menolak dengan `403 Forbidden` atau `404 Not Found`.
- [ ] **Permission Escalation Audit:** Verifikasi bahwa *token JWT* milik `cashier`, `kitchen_staff`, atau `customer` tidak dapat digunakan untuk menembus endpoint mutasi sensitif (seperti `POST /api/v1/menu/items`, `POST /api/v1/purchasing/orders`, atau `/api/v1/settings/roles`).
- [ ] **Server-Side Price & Discount Verification Audit:** Pastikan endpoint `POST /api/v1/orders` **selalu menghitung ulang** subtotal, pajak, diskon promo, dan total bayar di sisi server berdasarkan harga database saat itu. Abaikan total harga yang dikirim dari payload client.
- [ ] **Rate Limiting & JWT Expiry Audit:** Pastikan endpoint login `/api/v1/auth/login` memiliki proteksi *throttle* (maksimal 5x gagal sebelum lockout 15 menit) dan durasi *Access Token JWT* maksimal 60 menit.

### 3. Audit Integritas Finansial & Stok (Financial & Inventory Audit)
- [ ] **Atomic Order & Recipe Deduction Audit:** Verifikasi bahwa ketika pesanan POS/Online di-checkout, pembuatan record di `orders`, `order_items`, serta pemotongan stok bahan di `inventory_transactions` **dieksekusi dalam satu DB Transaction (`DB::transaction()`)**. Jika pemotongan stok gagal, seluruh order harus *roll-back*.
- [ ] **FEFO Batch Deduction Audit:** Lakukan tes pemotongan stok dengan kondisi terdapat 2 batch bahan baku (Batch A kedaluwarsa 10 hari lagi, Batch B kedaluwarsa 30 hari lagi). Verifikasi bahwa sistem memotong stok Batch A terlebih dahulu hingga habis, baru sisanya memotong Batch B.
- [ ] **COGS Accuracy Audit:** Verifikasi bahwa perubahan harga beli pada batch penerimaan PO terbaru langsung memutakhirkan `average_cost_cents` pada tabel `inventory_items` sesuai rumus *Weighted-Average Cost*, dan tercermin akurat pada laporan margin menu.
- [ ] **Idempotency Execution Audit:** Kirim 3 request `POST /api/v1/orders` yang identik secara serentak (*concurrent*) dengan `Idempotency-Key` header yang sama persis. Verifikasi bahwa server hanya memproses **1 order** dan menolak/mengembalikan respons cache untuk 2 request lainnya tanpa menggandakan tagihan atau memotong stok tiga kali.

### 4. Audit Ketahanan Offline & Real-Time (Resilience & KDS Audit)
- [ ] **POS Offline Queue & Sync Audit:**
  - Matikan koneksi internet pada perangkat POS fisik.
  - Buat 3 transaksi walk-in. Pastikan transaksi tercatat secara instan di dalam antrean lokal (`IndexedDB`).
  - Nyalakan kembali koneksi internet. Pastikan background worker POS mengirimkan antrean tersebut secara otomatis ke `POST /api/v1/orders/batch-sync`, mendapatkan status `200 OK`, dan menghapus antrean lokal yang sudah sukses tersinkronisasi.
- [ ] **KDS Latency & Local Buffering Audit:**
  - Ukur waktu jeda antara selesainya pembayaran di POS hingga tiket muncul di layar KDS. Waktu jeda (*latency*) **wajib < 500 milidetik** di jaringan lokal toko via WebSocket.
  - Simulasikan gangguan internet luar (*WAN drop*); pastikan router lokal toko tetap dapat menyalurkan event WebSocket antar perangkat di dalam cabang.

### 5. Audit Performa, Accessibility & NFR (NFR & UX Audit)
- [ ] **Core Web Vitals Audit (Next.js Frontend):** Gunakan Google Lighthouse untuk memastikan halaman publik (`WEB` & `ORD`) mencapai skor **Performance > 90**, **First Contentful Paint (FCP) < 1.5 detik**, dan **Largest Contentful Paint (LCP) < 2.5 detik**.
- [ ] **Accessibility WCAG 2.2 AA Audit:** Verifikasi rasio kontras teks minimal 4.5:1, dukungan penuh navigasi keyboard (*Focus Visible* pada setiap tombol/modal), serta seluruh gambar aset CMS/Menu memiliki atribut `alt text`.
- [ ] **Audit Trail Completeness Audit:** Periksa tabel `audit_logs` setelah melakukan perubahan harga menu, penyesuaian stok manual, atau ubah role karyawan. Pastikan aktor `user_id`, `ip_address`, `auditable_type`, `old_values`, dan `new_values` tercatat lengkap dan tidak dapat diedit/dihapus (`append-only`).

---

## 20.4 Metodologi & Alat Pengecekan Sistem (System Verification Guide)

Untuk memastikan kelima pilar audit di atas terpenuhi secara berkala dan konsisten, tim pengembang menerapkan **4 Lapis Pengujian Sistem**:

### 1. Automated Backend Testing Suite (PHPUnit / Pest di Laravel)
Dijalankan secara otomatis melalui terminal dengan perintah `php artisan test`.
- **Unit Tests (`tests/Unit/`)**:
  - `RecipeCostingTest.php`: Menguji rumus perhitungan COGS weighted-average saat terjadi perubahan harga bahan.
  - `PromotionCalculationTest.php`: Menguji akurasi potongan diskon promo (persentase, nominal tetap, max discount, dan BOGO).
  - `FEFOBatchTest.php`: Menguji algoritma pengurutan pemotongan stok berdasarkan `expiration_date` terdekat.
- **Feature / Integration Tests (`tests/Feature/`)**:
  - `OrderCheckoutFeatureTest.php`: Menguji alur end-to-end pembuatan pesanan, pembatalan transaksi jika stok tidak cukup, dan penambahan poin loyalty.
  - `RBACBranchScopeTest.php`: Menguji isolasi middleware `CheckBranchScope` dan menembak endpoint dengan token dari role berbeda untuk memastikan pengembalian HTTP `200 OK` vs `403 Forbidden`.
  - `IdempotencyTest.php`: Menguji pengiriman header `Idempotency-Key` berulang dan memverifikasi ketahanan terhadap duplikasi transaksi.

### 2. Automated Frontend E2E Testing (Playwright / Cypress)
Dijalankan secara otomatis untuk memvalidasi antarmuka dan alur interaksi pengguna dengan perintah `npx playwright test`.
- **Skenario E2E Kritis:**
  - `online-ordering.spec.ts`: Simulasi dari pilih cabang → tambah menu dengan extra shot modifier → input promo → checkout via payment gateway stub → verifikasi halaman tracking status.
  - `pos-offline-sync.spec.ts`: Menggunakan fitur *Network Throttling / Offline Context* Playwright:
    1. Buka halaman POS Kasir di browser tes.
    2. Set `context.setOffline(true)`.
    3. Input pesanan dan bayar dengan Cash.
    4. Verifikasi pesanan tersimpan di antrean IndexedDB lokal.
    5. Set `context.setOffline(false)`.
    6. Verifikasi alur *auto-sync* berhasil memicu request HTTP dan memperbarui saldo kasir.
  - `kds-live-ticket.spec.ts`: Membuka 2 browser context (1 POS, 1 KDS) secara berdampingan. Melakukan checkout di POS dan memverifikasi tiket secara otomatis muncul di browser KDS dalam < 1 detik tanpa *page reload*.

### 3. Continuous CI/CD Pipeline Verification (GitHub Actions)
Setiap kali pengembang membuat *Pull Request (PR)* ke *branch `develop` atau `main`*, pipeline CI/CD wajib menjalankan langkah pengecekan berikut sebelum kode diizinkan di-merge:
```yaml
name: System Verification Pipeline
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup PHP & Node.js
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: mbstring, intl, pdo_pgsql, redis

      - name: Install Backend & Frontend Dependencies
        run: |
          cd backend && composer install --no-interaction
          cd ../frontend && npm ci

      - name: Run Code Style & Linter Check
        run: |
          cd backend && ./vendor/bin/pint --test
          cd ../frontend && npm run lint && npx tsc --noEmit

      - name: Run Backend Automated Tests
        run: |
          cd backend && php artisan test --parallel

      - name: Run Playwright E2E Tests
        run: |
          cd frontend && npx playwright install --with-deps && npx playwright test
```

### 4. Manual QA Health Check & Observability
Untuk pemantauan sistem di staging dan produksi secara langsung:
- **Endpoint Health Check (`GET /api/health`):**
  Digunakan oleh *Load Balancer* dan *Monitoring tool* (UptimeRobot/Pingdom) setiap 60 detik untuk memeriksa responsibilitas database, Redis, queue workers, dan storage:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-07-14T07:15:00Z",
    "services": {
      "database": "ok",
      "redis": "ok",
      "queue": "ok",
      "storage": "ok"
    },
    "version": "1.0.0"
  }
  ```
- **Live Debugging & Error Tracking:**
  - Di lingkungan **Development/Staging:** Gunakan **Laravel Telescope** (`/telescope`) untuk mengaudit setiap query SQL yang berjalan, waktu eksekusi query, muatan antrean (*queue jobs*), serta *headers/payload* request API secara visual.
  - Di lingkungan **Production:** Gunakan **Sentry** untuk menangkap pengecualian (*exceptions*), melacak *stack trace* error, dan menganalisis regresi performa (*API bottleneck*) secara real-time.

---

## 20.5 Ringkasan Langkah Tindakan Hari Ini (Where to Start Right Now)

Untuk memulai eksekusi proyek hari ini juga, ikuti urutan tindakan konkret berikut pada terminal repositori:

1. **Buka direktori migrasi backend dan periksa kelengkapannya:**
   ```powershell
   cd c:\laragon\www\coffee_shop\backend
   php artisan migrate:status
   ```
2. **Perbarui file seeder `RolePermissionSeeder.php`** dengan 13 role resmi dan jalankan migrasi segar:
   ```powershell
   php artisan migrate:fresh --seed
   ```
3. **Jalankan test suite awal backend** untuk memverifikasi bahwa pondasi dasar Laravel bekerja normal:
   ```powershell
   php artisan test
   ```
4. **Mulai pembuatan middleware otorisasi awal** (`CheckUserPermission` dan `CheckBranchScope`) pada folder `backend/app/Http/Middleware/` sebagai tiket pertama Sprint 1!

---

**Document Status:** ✅ Master Plan Approved & Ready for Sprint 0/1 Execution  
**Previous Document:** [19-responsive-design.md](./19-responsive-design.md)  
**Related Documents:** [prd.md](./prd.md), [02-arsitektur-sistem.md](./02-arsitektur-sistem.md), [04-database-design.md](./04-database-design.md), [07-roles-dan-permissions.md](./07-roles-dan-permissions.md), [08-modul-fungsional.md](./08-modul-fungsional.md).
