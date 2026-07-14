# 26. Panduan Eksekusi, Checklist Audit & Verifikasi Sistem UI/UX & Frontend Integration (Master Frontend Integration & Gap Analysis Handbook)

**Dokumen:** Master Frontend Integration Handbook, Site Gaps & UX Compliance Specification  
**Versi:** 1.1.0 (Fully Synchronized with Docs Baseline v1.0)  
**Status:** Approved for Implementation & Audit  
**Referensi Utama:** Master PRD (`prd.md`), Desain Sistem (`03`), Modul Fungsional (`08`), Key User Flows (`09`), Accessibility (`17`), Information Architecture (`18`), Responsive Design (`19`), dan Panduan Eksekusi Master (`20`).

---

## 26.1 Pendahuluan & Tujuan Dokumen

Setelah seluruh **42 skenario pengujian API Backend (`/api/v1/...`) terverifikasi 100%** (*Production-Ready Backend* pada Fase 0–6), fokus utama beralih ke **Frontend Integration**. 

Aplikasi frontend (Next.js 14) saat ini masih memiliki banyak bagian yang bergantung pada data statis (*mock data*). Selain itu, terdapat ketidaksesuaian antara struktur folder rute saat ini dengan sitemap resmi yang diamanatkan dalam **[18-information-architecture.md](./18-information-architecture.md)**.

Dokumen ini berfungsi sebagai **blueprint tunggal integrasi frontend** untuk:
1. Mengidentifikasi seluruh celah rute (*route gaps*) antara kode aktual dengan spesifikasi sitemap.
2. Menyinkronkan kebutuhan desain sistem, responsivitas, dan aksesibilitas (WCAG 2.2 Level AA).
3. Mendefinisikan arsitektur data flow (Autentikasi, Branch Scoping, Idempotensi, Offline POS).
4. Menyediakan checklist verifikasi ketat per modul fungsional (`WEB` s.d. `API`).

---

## 26.2 Analisis Celah Rute & Halaman Hilang (Route Gaps Audit)

Berdasarkan perbandingan antara struktur folder aktual di `frontend/app/` dengan **[18-information-architecture.md](./18-information-architecture.md)**, diidentifikasi celah-celah berikut yang **wajib dibangun** dari awal:

### 26.2.1 Marketing Website (Public-Facing)
Sebagian besar halaman publik belum diimplementasikan di folder root `app/`. Halaman-halaman berikut harus dibuat dengan Next.js SSR/ISR:
- `app/about/page.tsx`: Brand story, visi-misi premium Velvra.
- `app/menu/page.tsx` & `app/menu/[category]/[slug]/page.tsx`: Halaman pencarian menu publik dengan filter kategori/dietary, detail produk, visual *featured items*, dan panel samping keranjang belanja desktop.
- `app/branches/page.tsx` & `app/branches/[slug]/page.tsx`: Lokasi cabang fisik, jam operasional, terintegrasi deteksi geolokasi terdekat (`WEB-004`).
- `app/careers/page.tsx` & `app/careers/[slug]/page.tsx`: Portal lamaran kerja, upload resume ke Cloudflare R2 (`CAR-002`).
- `app/events/page.tsx` & `app/events/[slug]/page.tsx`: Publikasi agenda/acara brand, RSVP limit-checked form (`EVT-002`).
- `app/blog/page.tsx` & `app/blog/[slug]/page.tsx`: Artikel edukasi kopi dengan metadata SEO JSON-LD structured data (`BLG-004`).
- `app/gallery/page.tsx`: Etalase visual interior & menu menggunakan lightbox picker (`GAL-002`).
- `app/contact/page.tsx`: Formulir kontak terenkripsi.
- `app/accessibility/page.tsx`: Pernyataan kepatuhan WCAG 2.2 AA (`17.11`).

### 26.2.2 Customer Portal (Authenticated Space)
Saat ini hanya terdapat `/account` satu halaman. Untuk mematuhi sitemap **[18.3](./18-information-architecture.md#183-customer-portal-sitemap)**, rute-rute berikut harus distandardisasi di bawah sub-folder `/customer`:
- `app/customer/dashboard/page.tsx`: Beranda ringkasan poin, tier, dan order aktif.
- `app/customer/orders/page.tsx` & `app/customer/orders/[id]/page.tsx`: Riwayat pesanan, receipt PDF, dan tombol reorder cepat (`PORT-001`).
- `app/customer/reservations/page.tsx` & `app/customer/reservations/[id]/page.tsx`: Manajemen booking meja dan cancellation window (`PORT-002`).
- `app/customer/membership/points/page.tsx` & `app/customer/membership/rewards/page.tsx`: Saldo poin loyalty, masa berlaku, dan redeem rewards (`PORT-003`).
- `app/customer/profile/page.tsx` & `app/customer/settings/page.tsx`: Kelola address book, saved card tokenized PCI-DSS (`PORT-004`), opsi 2FA (`PORT-005`), dan dietary flags (`PORT-006`).

### 26.2.3 Admin Dashboard Subpages
Beberapa halaman operasional admin memiliki perbedaan path atau belum terbuat:
- `/admin/procurement/suppliers`, `/admin/procurement/purchase-orders`, `/admin/procurement/receive`: Saat ini rute berada langsung di `/admin/suppliers`. Rute ini harus disarangkan ke dalam `/admin/procurement/` untuk mendukung perluasan modul pengadaan barang.
- `/admin/reports/sales`, `/admin/reports/inventory`, `/admin/reports/payroll`, `/admin/reports/exports`: Halaman ekspor laporan tabel & PDF secara asinkron (`REP-002`), terpisah dari grafik visual `/admin/analytics`.
- `/admin/profile/page.tsx`: Setelan profil mandiri staf/barista.

---

## 26.3 Spesifikasi UI/UX, Responsive & Aksesibilitas (WCAG 2.2 AA)

Semua halaman baru maupun yang di-wire ulang wajib mematuhi standar desain berikut sesuai **[17-accessibility.md](./17-accessibility.md)** dan **[19-responsive-design.md](./19-responsive-design.md)**:

### 26.3.1 Breakpoint & Responsive Rules
- **Mobile First Approach:** Styling dasar harus ditujukan untuk Mobile Portrait (xs: 0px - 640px). Gunakan prefix `md:` (768px) untuk tablet, dan `lg:` (1024px) serta `xl:` (1280px) untuk desktop.
- **Touch Target:** Seluruh tombol interaktif, checkbox, dan link di perangkat mobile/tablet wajib berukuran minimal **44x44px** dengan margin aman minimal 8px di antaranya untuk mencegah salah tekan.
- **Scrollbar Masking:** Terapkan utility CSS `.scrollbar-none` pada panel navigasi samping, daftar menu kasir POS, tiket KDS, dan tabel data guna menjaga estetika premium tanpa gangguan scrollbar kasar.

### 26.3.2 WCAG 2.2 Level AA Accessibility Check
- **Color Contrast:** Teks wajib memiliki rasio kontras minimal **4.5:1** terhadap latar belakang (untuk teks berukuran besar 18px+, rasio minimal 3:1). Kombinasi warna emas premium `#BA935D` dan warna gelap `#12100E` wajib disesuaikan agar tetap terbaca.
- **Keyboard Navigation:** 
  - Pengguna harus dapat berpindah ke seluruh elemen interaktif menggunakan tombol `Tab`.
  - Fokus visual (`focus-visible`) wajib tampil dalam bentuk outline berwarna kontras (contoh: `ring-2 ring-gold-500`).
  - Modal dialog harus menerapkan *focus trap* (menjaga fokus tidak keluar dari modal sebelum ditutup) dan mengembalikan fokus ke tombol pemicu awal.
- **Aria Labels & Alt Text:** 
  - Semua tombol berbasis ikon (contoh: tombol tambah keranjang bersimbol `+` tanpa teks) wajib memiliki tag `aria-label="Add to cart"`.
  - Gambar produk wajib memiliki `alt text` deskriptif dinamis yang ditarik dari media library database.

### 26.3.3 Ketentuan Ketat Ikon Visual & Pelarangan Emoji (Zero Emoji Policy)
- **Zero Emoji Policy (100% Bebas Emoji):** Sama sekali tidak diperbolehkan menggunakan karakter emoji bawaan sistem (seperti ☕, 🍔, 📦, 👤, 🏠, ❌, ⚠️) di seluruh bagian antarmuka pengguna, baik di Marketing Website publik, Customer Portal, maupun Admin Dashboard. Penggunaan emoji dianggap sebagai pelanggaran standar estetika premium dan profesional.
- **Lucide Icons Only:** Seluruh representasi simbol, indikator, dan ikon visual wajib menggunakan pustaka **Lucide Icons** (`lucide-react`) secara konsisten.
- **Pengecekan Audit:** Setiap pembersihan data statis (*Mock Purge*) dan penulisan komponen baru wajib diaudit untuk memastikan tidak ada emoji yang disisipkan dalam file kode (`page.tsx`, `layout.tsx`, `components`, dll). Pembacaan metadata menu dari database juga harus disaring agar tidak menyajikan emoji ke client.

---

## 26.4 Arsitektur Data Flow & Integrasi API

Mekanisme pertukaran data antara Next.js dan Laravel diatur secara ketat sebagai berikut:

### 26.4.1 Otorisasi & Scope Cabang (JWT & Branch Scoping)
```
[ Next.js Client ]
  ├── Bearer Token Interceptor ──> [ Bearer jwt_token_value ]
  └── Global Branch Selector ─────> [ X-Branch-Id: branch_uuid ] ──> [ Laravel API Controller ]
                                                                       ├── Auth & Tenant Isolation
                                                                       └── Scoped Database Query
```
- **X-Branch-Id Header:** Dropdown kantor cabang global (`ADM-002`) menyimpan ID cabang aktif di local state. Header `X-Branch-Id` wajib dikirim pada setiap request API untuk menyaring data inventaris, harga produk, penjualan, dan reservasi secara otomatis di tingkat server.
- **Auth Token Refresher:** Interceptor HTTP mendeteksi status `401 Unauthorized` untuk mencoba pembaruan token menggunakan *refresh token* di cookie, atau mengalihkan sesi pengguna ke `/admin/login` jika token kedaluwarsa.

### 26.4.2 Ketahanan Transaksi & Offline-First POS
- **Idempotency Guarantee:** Request pembuatan order `POST /api/v1/orders` dan `POST /api/v1/orders/public` wajib menyertakan header `Idempotency-Key` (UUID v4) yang dihasilkan client sebelum pengiriman. Server akan memvalidasi key ini untuk mencegah duplikasi tagihan akibat *double-click* pengguna.
- **Offline POS Queue:** Modul kasir (`/admin/pos`) menggunakan hook `useOfflinePOS` terintegrasi IndexedDB. Jika koneksi terputus:
  1. Transaksi ditampung di antrean lokal IndexedDB.
  2. Tampilan menunjukkan status "Offline - Pending Sync".
  3. Ketika internet terdeteksi pulih, antrean dikirim secara batch ke endpoint `POST /api/v1/pos/orders/batch-sync`.
- **WebSocket KDS Event:** Layar dapur `/admin/kds` terhubung ke Supabase Realtime / WebSocket Channel `orders`. Saat transaksi POS/Online selesai, tiket dapur dirender secara instan tanpa memerlukan manual polling atau auto-reload halaman.

---

## 26.5 Matriks Kebutuhan & Langkah Eksekusi Rinci per Fase

Integrasi frontend diatur dalam 6 Fase Pengembangan. Setiap modul fungsional dari **[08-modul-fungsional.md](./08-modul-fungsional.md)** wajib dipetakan dengan kriteria kelulusan integrasi API yang jelas.

```mermaid
flowchart TD
    subgraph Phase F0: Foundation
    A[lib/api.ts Interceptor] --> B[AuthProvider & PermissionGuard]
    B --> C[Branch Switcher ADM-002]
    end

    subgraph Phase F1: Catalog & Inv
    C --> D[Menu Catalog GET/POST/PUT]
    D --> E[Price Override MNU-003]
    E --> F[Inventory Stock Count & POs]
    end

    subgraph Phase F2: POS & KDS Live
    F --> G[POS Sessions & Offline DB]
    G --> H[WebSocket KDS Sync]
    end

    subgraph Phase F3: Customer Channels
    H --> I[Online & QR Table Ordering]
    I --> J[Table Reservation & Member Portal]
    end

    subgraph Phase F4 & F5: Staff, CMS & Analytics
    J --> K[HR Shifts & Audit Logs AUD-001]
    K --> L[CMS Block Builder & Analytics Dashboard]
    end
```

### Phase F0: API Client Layer, Auth Gateway & RBAC Guard
- **API Client:** Standardisasi file `frontend/lib/api.ts`.
- **Auth Provider:** Implementasi `useAuth` hook untuk verifikasi user session.
- **RBAC Visual Guard:** Komponen `<PermissionGuard>` menyembunyikan tombol sensitif (seperti penyesuaian stok manual atau pembuatan menu baru) jika status user tidak memiliki permission yang sesuai.
- **Global Branch Selector:** Integrasi dropdown cabang dengan endpoint `GET /api/v1/branches`.

### Phase F1: Core Catalog, Menu & Inventory Admin Integration
- **Katalog Menu (`/admin/menu`):**
  - **Fetch & Mutation:** Hubungkan daftar kategori dan item menu ke API.
  - **Price Override (`MNU-002`/`MNU-003`):** UI untuk mengatur harga khusus cabang.
  - **Status 86'd (`MNU-004`):** Toggle penonaktifan produk cepat jika persediaan di cabang tersebut habis.
  - **Recipe Linking (`MNU-005`):** Menghubungkan item menu ke ID Resep (`RCP`) saat pembuatan.
- **Persediaan (`/admin/inventory`):**
  - **Cycle Count (`INV-005`):** Form stock opname varians hitungan fisik vs sistem.
  - **Batch FEFO (`INV-006`):** Menampilkan batch tanggal kedaluwarsa bahan baku saat penerimaan barang.
- **Pengadaan (`/admin/suppliers`):**
  - Pemindahan route ke `/admin/procurement/suppliers`.
  - Integrasi form Purchase Order (`POST /api/v1/purchase-orders`).

### Phase F2: POS Bar Cashier & KDS Kitchen Live Wiring
- **POS Kasir (`/admin/pos`):**
  - **Sesi POS (`POS-001`):** Modal input modal awal (cash float) saat buka shift, dan cash drawer reconciliation saat tutup shift.
  - **Loyalty Lookup (`POS-004`):** Input nomor telepon member untuk klaim poin loyalty.
  - **Promo Validation (`PRO-004`):** Server-side verification untuk kode voucher diskon.
- **Kitchen Display (`/admin/kds`):**
  - **Live Tickets (`KDS-001`/`KDS-002`):** Tiket terurut berdasarkan waktu order, dengan indikator warna status keterlambatan (aging).
  - **Status Transitions (`KDS-003`):** Tombol update status pesanan menjadi Preparing, Ready, atau Completed.

### Phase F3: Customer Digital Channels & Loyalty CRM Wiring
- **Pemesanan Online (`/order`):**
  - Keranjang belanja disimpan di server (untuk logged-in member) dan local storage (untuk guest).
  - Form alamat pengantaran/delivery (`ORD-005`).
- **QR Ordering (`/qr/[tableCode]`):**
  - Membaca deskripsi meja dan cabang secara otomatis tanpa pilihan manual.
- **Reservasi Meja (`/reserve`):**
  - Form pencarian slot kosong dengan durasi *temporary table-hold* 10 menit (`RES-002`) untuk mencegah double-booking.
- **Portal Pelanggan (`/customer/`):**
  - Halaman riwayat order (`PORT-001`), setelan alergen/preferensi diet (`PORT-006`), dan opsi penghapusan data memicu soft-delete GDPR (`PORT-007`).

### Phase F4 & F5: HR, Operations, CMS & Analytics
- **Operations & HR (`/admin/employees`):**
  - Penjadwalan shift drag-and-drop dengan deteksi konflik jadwal bertumpuk (`HR-002`).
  - **Audit Logs Explorer (`AUD-001`):** Halaman filter log CUD (Create-Update-Delete) sensitif dengan detail diff JSON sebelum/sesudah perubahan.
- **CMS Builder (`/admin/cms`):**
  - Pembuatan tata letak halaman web publik modular berbasis blok CMS (`WEB-001`/`CMS-005`).
- **Analytics Dashboard (`/admin/analytics`):**
  - Membaca summary sales harian/bulanan dengan filter custom date range (`ANL-003`) menggunakan loading skeleton state (`ANL-004`).

---

## 26.6 Matriks Pemetaan Halaman & Endpoint API

| Halaman Frontend (`app/`) | Status Halaman | Kunci Endpoint API Laravel | Validasi Sukses (E2E) |
| :--- | :---: | :--- | :---: |
| `/` (Homepage) | Ada | `GET /api/v1/pages/home` | [ ] |
| `/about` | **Belum Ada** | `GET /api/v1/pages/about` | [ ] |
| `/menu` | **Belum Ada** | `GET /api/v1/menu/items?branch_id=...` | [ ] |
| `/branches` | **Belum Ada** | `GET /api/v1/branches/public` | [ ] |
| `/careers` | **Belum Ada** | `GET /api/v1/careers` | [ ] |
| `/events` | **Belum Ada** | `GET /api/v1/events` | [ ] |
| `/blog` | **Belum Ada** | `GET /api/v1/posts` | [ ] |
| `/gallery` | **Belum Ada** | `GET /api/v1/media?category=gallery` | [ ] |
| `/accessibility` | **Belum Ada** | (Konten Statis WCAG) | [ ] |
| `/customer/dashboard` | **Belum Ada** | `GET /api/v1/members/profile` | [ ] |
| `/customer/orders` | **Belum Ada** | `GET /api/v1/members/orders` | [ ] |
| `/customer/reservations` | **Belum Ada** | `GET /api/v1/members/reservations` | [ ] |
| `/customer/profile` | **Belum Ada** | `PUT /api/v1/members/profile` | [ ] |
| `/order` | Ada | `POST /api/v1/orders/public` | [ ] |
| `/qr/[tableCode]` | Ada | `GET /api/v1/tables/decode` | [ ] |
| `/reserve` | Ada | `POST /api/v1/reservations` | [ ] |
| `/admin/login` | Ada | `POST /api/v1/auth/login` | [✓] |
| `/admin/pos` | Ada | `POST /api/v1/orders` | [✓] |
| `/admin/kds` | Ada | `GET /api/v1/kds/orders` | [✓] |
| `/admin/menu` | Ada | `GET/POST/PUT /api/v1/products` | [ ] |
| `/admin/inventory` | Ada | `GET/POST /api/v1/inventory` | [ ] |
| `/admin/procurement/suppliers`| **Belum Ada** | `GET /api/v1/suppliers` | [ ] |
| `/admin/employees` | Ada | `GET/POST /api/v1/employees` | [ ] |
| `/admin/promotions` | Ada | `GET/POST/PUT /api/v1/promotions` | [ ] |
| `/admin/analytics` | Ada | `GET /api/v1/reports/sales` | [ ] |
| `/admin/settings` | Ada | `GET /api/v1/audit/logs` | [ ] |

---

## 26.7 Protokol Verifikasi & Rencana Pengujian E2E

Untuk memastikan integritas sistem frontend dan backend berjalan selaras tanpa cacat, terapkan pengujian berikut sebelum proses publikasi (*go-live*):

### 1. Manual Keyboard Nav & Accessibility Audit
- Penguji menekan tombol `Tab` pada halaman `/order` and `/admin/pos`.
- Pastikan fokus berpindah secara logis dari atas ke bawah dan kiri ke kanan.
- Pengecekan kontras visual menggunakan Chrome DevTools Lighthouse (skor minimal wajib **> 90**).

### 2. Skenario Pengujian Playwright E2E
Setiap rilis integrasi harus menjalankan tes otomatis Playwright berikut:
- **`pos-checkout.spec.ts`**: Kasir login -> pilih menu produk -> tambahkan modifier -> lookup member loyalty -> terapkan voucher diskon -> checkout sukses -> verifikasi stok bahan berkurang di inventory database.
- **`customer-qr-checkout.spec.ts`**: Scan QR meja -> keranjang otomatis terisi kode cabang/meja -> isi order -> bayar digital -> antrean tiket langsung muncul di `/admin/kds` secara real-time via WebSocket.
- **`pos-offline-resilience.spec.ts`**: Simulasi putus internet -> buat 3 order kasir (tersimpan di IndexedDB) -> aktifkan internet -> sinkronisasi otomatis berjalan -> periksa kecocokan data di server.

### 3. Kompilasi Rilis Mandiri (`npm run build`)
Kompilasi wajib dijalankan secara lokal di folder `frontend` untuk memverifikasi kebersihan tipe TypeScript dan impor modul:
```powershell
cd c:\laragon\www\coffee_shop\frontend
npm run build
```
Rilis dianggap valid hanya jika terminal mengembalikan status **`Exit code: 0`** tanpa peringatan eror.

---

**Document Status:** ✅ Synchronized & Approved for Implementation  
**Previous Document:** [25-bukti-eksekusi-dan-audit-fase-5-6.md](./25-bukti-eksekusi-dan-audit-fase-5-6.md)  
**Next / Audit Report:** [27-bukti-eksekusi-dan-audit-frontend-f0.md](./27-bukti-eksekusi-dan-audit-frontend-f0.md) (*Completed Phase F0*) · [28-bukti-eksekusi-dan-audit-frontend-f1.md](./28-bukti-eksekusi-dan-audit-frontend-f1.md) (*Completed Phase F1*) · [29-bukti-eksekusi-dan-audit-frontend-f2.md](./29-bukti-eksekusi-dan-audit-frontend-f2.md) (*Will be created upon completing Phase F2*)  
**Related Documents:** [prd.md](./prd.md), [03-desain-sistem.md](./03-desain-sistem.md), [08-modul-fungsional.md](./08-modul-fungsional.md), [17-accessibility.md](./17-accessibility.md), [18-information-architecture.md](./18-information-architecture.md), [19-responsive-design.md](./19-responsive-design.md), [20-panduan-eksekusi-dan-audit.md](./20-panduan-eksekusi-dan-audit.md).
