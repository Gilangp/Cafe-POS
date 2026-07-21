# RENCANA IMPLEMENTASI (IMPLEMENTATION PLAN) OVERHAUL SISTEM
## Ekosistem Coffee Shop NEMU Space — Frontend & Backend

Dokumen ini disusun sebagai panduan langkah-demi-langkah (checklist) untuk merombak total folder `backend/` (Laravel) dan `frontend/` (Next.js) agar sepenuhnya selaras dengan spesifikasi modular di folder `docs/`.

---

## 📋 DAFTAR CHECKLIST IMPLEMENTASI

### FASE 1: STRUKTUR DATABASE & MODEL ORM (BACKEND)
> **Referensi Dokumen:** [05_database_and_api.md](./05_database_and_api.md) (Bab 26 & 27)

- [x] **1.1 Hapus / Bersihkan Migrasi Lama yang Tidak Relevan**
  - Membersihkan migrasi lama terkait multi-cabang (branches), membership level kompleks, dll., agar sistem berfokus pada *Single Branch* sesuai ruang lingkup.
- [x] **1.2 Buat / Sesuaikan File Migrasi Database Baru**
  - [x] `users` (id UUID, name, email, password, phone, avatar, is_active, timestamps)
  - [x] `roles` (id UUID, name: Kasir/Dapur_Barista/Admin/Owner)
  - [x] `user_roles` (pivot user_id ↔ role_id)
  - [x] `settings` (identitas, kontak, SEO default, jam operasional)
  - [x] `social_media` (instagram, facebook, tiktok, dll.)
  - [x] `hero_banners` (carousel Landing Page)
  - [x] `about_us` (section Tentang Kami)
  - [x] `categories` (kategori menu)
  - [x] `menus` (nama, slug, deskripsi, harga, status: tersedia/tidak_tersedia, is_best_seller, soft deletes)
  - [x] `promotions` & `menu_promotions` (pivot promo menu)
  - [x] `article_categories` & `articles` (WYSIWYG content, SEO slug)
  - [x] `galleries` (gambar, kategori, caption)
  - [x] `testimonials` & `faqs` (untuk Landing Page)
  - [x] `tables` (nomor meja, kapasitas)
  - [x] `reservations` (table_id, nama, phone, tanggal, jam, status: menunggu/dikonfirmasi/ditolak/selesai/batal)
  - [x] `transactions` (invoice_number, cashier_id, subtotal, diskon, total, payment_method, status: selesai/void)
  - [x] `transaction_items` (snapshot name & price, quantity, note)
  - [x] `order_tickets` & `order_ticket_items` (untuk Kitchen Display System, link ke transaksi)
  - [x] `inventory_categories` & `suppliers`
  - [x] `inventories` (stock_quantity, minimum_stock, unit)
  - [x] `inventory_logs` (tipe: masuk/keluar, referensi transaksi/manual)
  - [x] `menu_ingredients` (pivot komposisi resep)
  - [x] `audit_logs` (pencatatan aktivitas pengguna internal)
  - [x] `media` (metadata file media yang diupload ke Supabase Storage)
- [x] **1.3 Definisikan Model Eloquent & Relasinya**
  - Membuat model untuk masing-masing tabel dengan UUID trait, fillable fields, cast status enum, dan soft deletes pada Menu.
- [x] **1.4 Buat Seeder Data Awal (Database Seeder)**
  - Akun Default:
    - Owner (`owner@nemuspace.id` / password)
    - Admin (`admin@nemuspace.id` / password)
    - Kasir (`kasir@nemuspace.id` / password)
    - Dapur/Barista (`dapur@nemuspace.id` / password)
    - Staf Multi-Role (Kasir + Dapur) (`staf@nemuspace.id` / password)
  - Data Master: Kategori menu, 10 menu awal (makanan & minuman), 10 meja fisik, pengaturan default, FAQ, dan 3 hero banner.

---

### FASE 2: AUTENTIKASI, RBAC, & MIDDLEWARE (BACKEND)
> **Referensi Dokumen:** [03_requirements.md](./03_requirements.md) (Bab 25) & [05_database_and_api.md](./05_database_and_api.md) (Bab 28.3)

- [x] **2.1 Implementasi Autentikasi Sanctum**
  - Setup Laravel Sanctum untuk SPA/token-based auth.
  - Buat `AuthController` dengan endpoint `/auth/login`, `/auth/logout`, dan `/auth/me`.
- [x] **2.2 Buat RoleMiddleware & Validasi Akses**
  - Middleware untuk memeriksa role pengguna (`RoleMiddleware`).
  - Memastikan otorisasi multi-role (misal staf yang merangkap Kasir & Dapur bisa mengakses kedua area).
- [x] **2.3 Buat AuditLogMiddleware**
  - Middleware global untuk mencatat setiap tindakan perubahan data (POST, PUT, DELETE) oleh user login ke tabel `audit_logs`.

---

### FASE 3: API PUBLIK & CMS SERVICES (BACKEND)
> **Referensi Dokumen:** [05_database_and_api.md](./05_database_and_api.md) (Bab 28.2 & 28.6)

- [x] **3.1 API Landing Page Dinamis (`GET /landing-page`)**
  - Mengembalikan seluruh data seksi aktif, hero banner, FAQ, testimoni, menu bestseller, dan pengaturan kontak dalam satu/beberapa respons efisien.
- [x] **3.2 API Menu Publik & Detail**
  - `/menus` (filter kategori, pencarian kata kunci)
  - `/menus/{slug}` (detail produk)
  - `/categories` (kategori aktif)
- [x] **3.3 API Reservasi Meja Publik**
  - `POST /reservations` (kirim form reservasi dengan validasi Zod/Laravel)
  - `GET /reservations/check` (cek status reservasi menggunakan Nomor HP & Tanggal)
- [x] **3.4 API Artikel & Galeri**
  - `/articles` & `/articles/{slug}` (dilengkapi kategori & pagination)
  - `/galleries` (daftar galeri foto)
- [x] **3.5 API Admin CMS & Media Upload**
  - Implementasi controller CRUD untuk Banner, Menu, Kategori, Promo, Artikel, Galeri, FAQ, dan Kontak.
  - Controller upload media ke storage (Supabase Storage/Local Storage).

---

### FASE 4: API POS, TRANSAKSI, & KITCHEN DISPLAY (BACKEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 17 & 41) & [05_database_and_api.md](./05_database_and_api.md) (Bab 28.4 & 28.5)

- [x] **4.1 API Kasir POS**
  - `POST /pos/transactions` (buat transaksi POS: rekam item, hitung otomatis, kurangi stok bahan baku lewat komposisi `menu_ingredients`, buat tiket dapur `order_tickets` dengan status `diterima`).
  - `GET /pos/transactions` (riwayat transaksi per shift kasir).
  - `PATCH /pos/transactions/{id}/void` (void transaksi, butuh alasan void, batalkan tiket dapur jika belum disajikan).
- [x] **4.2 API Kitchen Display System (KDS)**
  - `GET /kitchen/tickets` (ambil antrian tiket aktif berstatus `diterima`, `diproses`, atau `siap`, urutan FIFO).
  - `PATCH /kitchen/tickets/{id}/status` (transisi status: `diterima` → `diproses` → `siap`).
  - `PATCH /kitchen/tickets/{id}/serve` (transisi status: `siap` → `diserahkan` ke pelanggan).

---

### FASE 5: FRONTEND DESIGN SYSTEM & SHARED SETUP (FRONTEND)
> **Referensi Dokumen:** [06_design_system.md](./06_design_system.md) (Bab 30 & 31)

- [x] **5.1 Konfigurasi Tailwind CSS & Theme Variables**
  - Modifikasi `tailwind.config.ts` untuk memuat palette NEMU Space:
    - Primary: `#1E3D31` (Deep Forest Green)
    - Accent: `#C89B5C` (Warm Gold)
    - Secondary: `#6F4E37` (Roasted Brown)
    - Background Light: `#FAF3E7` (Ivory Cream)
    - Background Dark: `#14201A` (Deep Pine Black-Green)
  - Pasang font Poppins (Heading) & Inter (Body) via Google Fonts.
- [x] **5.2 Setup API Client & Interceptors**
  - Setup Axios/Fetch di `lib/api.ts` yang otomatis mengirimkan header token Sanctum Bearer.
- [x] **5.3 Setup Shared UI Components (shadcn/ui)**
  - Buat komponen fundamental: Button, Card, Dialog/Modal, Input, Select, Table, Badge, Toast Notification, dan Drawer.
  - Implementasikan sticky Navbar & Footer responsif.

---

### FASE 6: FRONTEND PUBLIC WEBSITE & PWA (FRONTEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 14) & [02_system_architecture.md](./02_system_architecture.md) (Bab 11.1)
> **Referensi Visual Landing Page:** File gambar [docs/Nemu Space.jfif](./Nemu Space.jfif)

- [x] **6.1 Halaman Utama (Landing Page `/`)**
  - Render banner slider utama (Bab 14.2) dengan layout visual mengacu pada referensi gambar [Nemu Space.jfif](./Nemu Space.jfif).
  - Section Tentang Kami.
  - Section Kategori Kopi ("Handcrafted Curations") dengan foto bulat/organik berlatar gelap tekstur biji kopi.
  - Section Menu Favorit ("Barista Recommends") grid menu berlatar terang dengan badge bestseller.
  - Section Promo, FAQ, Testimoni, dan footer solid hijau tua.
- [x] **6.2 Halaman Menu Publik (`/menu`)**
  - Filter kategori dinamis & pencarian menu.
- [x] **6.3 Halaman Reservasi Publik (`/reservasi` & `/reservasi/status`)**
  - Form reservasi (Nama, HP, Tanggal, Jam, Jumlah Tamu).
  - Halaman cek status reservasi tanpa login.
- [x] **6.4 Halaman Artikel (`/artikel` & `/artikel/[slug]`) & Galeri (`/galeri`)**
  - Blog artikel dengan detail dinamis dan Galeri foto lightbox.
- [x] **6.5 Konfigurasi PWA (Progressive Web App)**
  - Setup service worker, manifest JSON, icons, dan strategi offline caching untuk Landing Page & Menu.

---

### FASE 7: PORTAL KASIR & SCREEN POS (FRONTEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 17) & [02_system_architecture.md](./02_system_architecture.md) (Bab 11.2)

- [x] **7.1 Halaman Login (`/login`)**
  - Form login multi-role dengan redirect dinamis ke modul terkait.
- [x] **7.2 Layar POS Kasir (`/kasir/pos`)**
  - Layar split: Grid menu bersongsong gambar di kiri, keranjang & pembayaran di kanan.
  - Input catatan pesanan (misal: "less sugar", "no ice") per item.
  - Input diskon transaksi (nominal / persentase).
  - Pilihan pembayaran (Tunai, QRIS, Kartu).
  - Tombol bayar & print struk (thermal print template).
- [x] **7.3 Riwayat Transaksi & Reservasi Hari Ini**
  - Riwayat transaksi shift berjalan dengan detail item & status.
  - Widget list reservasi hari ini yang siap dicheck-in.

---

### FASE 8: KITCHEN DISPLAY SYSTEM (FRONTEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 41)

- [x] **8.1 Layar Antrian Dapur (`/dapur/kitchen-display`)**
  - Tiga kolom antrian: **Diterima**, **Diproses**, dan **Siap**.
  - Setiap kartu pesanan menampilkan detail item, jumlah, catatan, dan elapsed time.
- [x] **8.2 Real-time Sync & Sound Alert**
  - Polling interval 3-5 detik (atau websocket) untuk menarik pesanan baru.
  - Suara notifikasi (bell/alert) ketika pesanan baru masuk ke kolom "Diterima".
- [x] **8.3 Timer Keterlambatan**
  - Indikator warna kartu tiket berubah jika waktu berjalan melewati batas wajar (default > 10 menit: hijau → kuning → merah).
- [x] **8.4 Sinkronisasi POS**
  - Begitu KDS mengubah status tiket menjadi "Siap", notifikasi/penanda visual langsung muncul di dasbor Kasir.

---

### FASE 9: PORTAL ADMIN CMS & INVENTORY (FRONTEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 15, 18, 19, 20)

- [x] **9.1 Halaman CMS Landing Page & Settings**
  - Pengelolaan seksi aktif (toggle on/off), drag & drop urutan banner, pengelolaan kontak & jam buka.
- [x] **9.2 Halaman CRUD Menu, Kategori & Promo**
  - Pengelolaan resep/komposisi bahan baku per item menu.
  - CRUD Promo dengan masa berlaku tanggal & waktu.
- [x] **9.3 Halaman Manajemen Reservasi**
  - Daftar antrian reservasi masuk dengan pilihan aksi: Konfirmasi (dan pilih Nomor Meja) / Tolak / Selesai / Batal.
- [x] **9.4 Halaman Manajemen Inventory**
  - Daftar stok bahan baku saat ini.
  - Fitur pencatatan barang masuk (Stock In) dan barang keluar manual (Stock Out).
  - Notifikasi visual/peringatan apabila stok berada di bawah `minimum_stock`.
- [x] **9.5 Halaman Laporan & Ekspor**
  - Grafik & tabel ringkasan penjualan, mutasi barang, dan reservasi.
  - Fitur unduh laporan PDF & Excel.

---

### FASE 10: PORTAL OWNER, AUDIT LOG & BACKUP (FRONTEND)
> **Referensi Dokumen:** [04_modules_specification.md](./04_modules_specification.md) (Bab 16.3) & [07_roadmap_and_testing.md](./07_roadmap_and_testing.md)

- [x] **10.1 Dasbor Bisnis Owner**
  - Grafik tren penjualan mingguan/bulanan (Recharts).
  - Statistik top menu terlaris & profitabilitas.
- [x] **10.2 Manajemen User & Multi-Role**
  - Kelola user internal (buat/edit/nonaktifkan akun Kasir, Admin, Dapur/Barista).
  - Pengaturan peran ganda (misal: Kasir sekaligus Dapur).
- [x] **10.3 Halaman Audit Log & Keamanan**
  - Menampilkan riwayat log aktivitas user internal secara terperinci.
- [x] **10.4 Menu Backup & Restore**
  - Tombol ekspor database manual & restore database dengan prompt double-confirmation.

---

## 🚀 STRATEGI DEPLOYMENT & TESTING
> **Referensi Dokumen:** [07_roadmap_and_testing.md](./07_roadmap_and_testing.md)

- Pengujian fungsionalitas end-to-end POS ↔ KDS ↔ Inventory.
- Validasi responsivitas di smartphone, tablet, dan laptop.
- Pengujian performa Lighthouse untuk kecepatan PWA & SEO.
