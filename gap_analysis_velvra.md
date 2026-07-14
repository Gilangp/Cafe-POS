# 🚨 Master Gap Analysis & Registry Fitur Belum Terimplementasi
**Proyek:** Velvra Coffee Shop Platform | **Dokumen Acuan:** `@[docs]/01` s.d. `19` & `prd.md`  
**Tanggal Verifikasi Silang:** 14 Juli 2026 | **Status Keseluruhan:** Core Order-to-KDS Live (~75% MVP), Admin Pages Statis (~25% Gap)

---

## 🌟 Bagian 1: Yang Sudah Berhasil Selesai & Terhubung Cloud Supabase (Live 100%)

| Modul / Area | Lokasi File | Status & Kemampuan |
| :--- | :--- | :--- |
| **Landing Page & Bilingual** | `/app/page.tsx` | UI premium interaktif, 10 section lengkap, dukungan bilingual ID/EN dinamis dengan `localStorage`. |
| **Online Order Customer** | `/app/order/page.tsx` | Katalog produk dari cloud (`useProducts`), filter kategori & pencarian, kustomisasi pesanan (ice/sweetness/milk), keranjang belanja, & *trigger* ke KDS via `createLiveOrder()`. |
| **QR Table Ordering** | `/app/qr/[tableCode]/page.tsx` | Pesan langsung dari meja, deteksi nomor meja otomatis (`MEJA-04`), sinkronisasi katalog cloud, & *trigger* ke KDS via `createLiveOrder()`. |
| **POS Kasir Bar** | `/admin/pos/page.tsx` | Katalog produk dari cloud (`useProducts`), hitung subtotal/PPN 11%/total, pilihan bayar (CASH/CARD/QRIS), & *trigger* ke KDS via `createLiveOrder()`. |
| **KDS Dapur Real-Time** | `/admin/kds/page.tsx` | Sinkronisasi antrian seketika via Supabase Realtime (`postgres_changes`), alarm suara (`kds-alert.mp3`), update status (`NEW` → `READY` → `COMPLETED`). |
| **Cloud Database Seeder** | `/admin/settings/page.tsx` | Tab "Database Seeder" dengan fitur 1-klik untuk menyuntikkan data sampel `categories`, `products`, dan `orders` langsung ke cloud Supabase. |
| **Anti-Emoji Build Cleanup** | Semua file TSX | Semua karakter emoji literal telah dihapus dan disubstitusi murni menggunakan komponen `lucide-react` icons untuk build Vercel yang bersih dan cepat. |

---

## 🔴 Bagian 2: Daftar Lengkap Kesenjangan Fitur (Gaps Belum Diimplementasi)

Berikut adalah **seluruh item, modul, controller, model, halaman UI, dan infrastruktur** yang tercantum dalam spesifikasi resmi di `@[docs]` namun **BELUM TERIMPLEMENTASI ATAU MASIH BERSIFAT STATIS (MOCK)** di dalam kode sistem saat ini:

### 🖥️ A. Frontend Admin Portal — Halaman yang Masih STATIS (Hardcoded Data / Belum Live Cloud)

| # | Halaman Admin (`/admin/*`) | Spesifikasi Modul `@[docs]` | Status Nyata di Kode Saat Ini | Apa yang Harus Diimplementasi untuk Jadi Dinamis? |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Menu Management**<br>`/admin/menu/page.tsx` | **Modul 8.4**<br>Menu & Recipe Management | 🔴 **Statis (Mock)**<br>Data `products` berupa array hardcoded di dalam file. Masih ada karakter emoji literal (`☕`, `🥛`, dll). | 1. Hubungkan dengan hook `useProducts()` dari Supabase.<br>2. Buat Modal Form CRUD untuk **Tambah Produk Baru**, **Edit Harga/HPP**, dan **Hapus Produk** langsung ke tabel `products` Supabase.<br>3. Hubungkan tombol *Toggle Aktif/Nonaktif* (`available`) ke database cloud.<br>4. Hapus seluruh sisa emoji dan ganti dengan `lucide-react`. |
| **2** | **Inventory Management**<br>`/admin/inventory/page.tsx` | **Modul 8.3**<br>Inventory Management | 🔴 **Statis (Mock)**<br>Data `inventoryItems` berupa array hardcoded. | 1. Buat tabel `inventory_items` & `inventory_transactions` di Supabase.<br>2. Hubungkan halaman agar membaca dan menambah bahan baku cloud.<br>3. **Deduksi Stok Otomatis:** Buat fungsi otomatis yang memotong stok susu/kopi/cup saat status pesanan di KDS diklik `completed`. |
| **3** | **Order History & List**<br>`/admin/orders/page.tsx` | **Modul 8.8**<br>Order Tracking | 🔴 **Statis (Mock)**<br>Data `orders` berupa array hardcoded (`#ORD-1042`, dll). | 1. Hubungkan dengan tabel `orders` Supabase untuk menampilkan riwayat lengkap semua pesanan yang masuk dari POS, QR, dan Online.<br>2. Fitur *Filter per Tanggal/Cabang* dan *Export to Excel/CSV*. |
| **4** | **Analytics & Dashboard**<br>`/admin/analytics/page.tsx` | **Modul 8.8**<br>Analytics & Reporting | 🔴 **Statis (Mock)**<br>Angka total sales, grafik harian, dan item populer hardcoded. | 1. Tarik agregasi sum/count nyata dari tabel `orders` dan `order_items` di Supabase.<br>2. Buat grafik penjualan real-time berdasarkan transaksi sebenarnya. |
| **5** | **CRM & Membership**<br>`/admin/crm/page.tsx` | **Modul 8.5**<br>Membership & Loyalty | 🔴 **Statis (Mock)**<br>Data `customers` berupa array hardcoded. | 1. Hubungkan dengan tabel `members` & `loyalty_transactions` di Supabase.<br>2. Buat otomatisasi penambahan poin (misal: belanja Rp 10.000 = 10 poin).<br>3. Fitur *Customer Portal (`/account`)* agar pelanggan bisa login & cek poin. |
| **6** | **Reservation Management**<br>`/admin/reservations/page.tsx` | **Modul 8.6**<br>Table Reservation | 🔴 **Statis (Mock)**<br>Data `reservations` berupa array hardcoded. | 1. Hubungkan ke tabel `reservations` & `tables` Supabase.<br>2. Buat *Booking Engine Online (`/reserve`)* bagi pelanggan untuk pesan meja interaktif. |
| **7** | **Promotions & Vouchers**<br>`/admin/promotions/page.tsx` | **Modul 8.1 / 8.5**<br>Discount Engine | 🔴 **Statis (Mock)**<br>Daftar kupon (`DISCOUNT20`) hardcoded. | 1. Hubungkan dengan tabel `promotions` di Supabase.<br>2. Implementasikan *Discount Engine* di halaman POS (`/admin/pos`) dan Online Order (`/order`) agar kupon bisa benar-benar mengurangi total bayar. |
| **8** | **Suppliers & PO**<br>`/admin/suppliers/page.tsx` | **Modul 8.3**<br>Supplier & Purchase Order | 🔴 **Statis (Mock)**<br>Data supplier dan purchase order hardcoded. | 1. Hubungkan ke tabel `suppliers` & `purchase_orders` Supabase untuk mencatat pembelian stok bahan baku ke supplier. |
| **9** | **CMS Dynamic Page Builder**<br>`/admin/cms/page.tsx` | **Modul 8.7**<br>Content Management | 🔴 **Statis (Mock)**<br>Teks landing page dan artikel blog hardcoded. | 1. Hubungkan ke tabel `pages`, `posts`, dan `cms_blocks` agar perubahan teks di admin merubah tampilan pelanggan di `/` secara live. |

---

### 🔐 B. Keamanan & Autentikasi (Security Gaps — Phase 0 Foundation)

| # | Item Keamanan | Spesifikasi Dokumen `06-security.md` & `07-roles.md` | Status Nyata Saat Ini | Action Required |
| :---: | :--- | :--- | :---: | :--- |
| **10** | **Admin Login Gate (`/admin/login`)** | Semua rute `/admin/*` wajib dilindungi oleh autentikasi dan otorisasi. | ❌ **Belum Ada Guard**<br>Saat ini siapapun yang membuka URL `/admin/kds` atau `/admin/pos` bisa langsung masuk tanpa login. | 1. Buat halaman login `/admin/login` menggunakan **Supabase Auth / PIN Kasir**.<br>2. Pasang *Next.js Middleware (`middleware.ts`)* untuk mengalihkan (*redirect*) pengguna yang belum login kembali ke `/admin/login`. |
| **11** | **Role-Based Access Control (RBAC)** | Pembagian hak akses: `Kasir` (hanya POS & KDS), `Barista` (hanya KDS), `Manajer` (akses penuh). | ❌ **Belum Enforced**<br>Belum ada pembatasan tampilan menu sidebar admin berdasarkan role akun pengguna. | 1. Sembunyikan item menu Settings, Inventory, Analytics dari pengguna dengan role `Kasir` / `Barista`. |

---

### ⚙️ C. Backend API Controllers (`backend/app/Http/Controllers/Api/*` vs `docs/05-api-design.md`)

Meskipun *Frontend Next.js* kita menggunakan langsung *Supabase Client* untuk operasi cloud, berikut adalah **kesenjangan pada arsitektur API Laravel (`backend/`)** apabila kelak API ini diaktifkan penuh sebagai *central server*:

1. **🟡 Controller Masih STUB (Hanya berupa kerangka `return message string` - Belum berisi logika database):**
   - `EmployeeController.php` *(Modul SDM / Shift Karyawan)*
   - `SupplierController.php` *(Modul Supplier)*
   - `PageController.php`, `PostController.php`, `MediaController.php` *(Modul CMS)*
   - `SettingController.php` *(Modul Pengaturan Sistem)*

2. **❌ Model Eloquent yang Belum Memiliki Controller Sama Sekali (Missing Endpoints):**
   - `Member.php`, `MembershipTier.php`, `LoyaltyTransaction.php` *(Belum ada `MemberController` & `LoyaltyController`)*
   - `Reservation.php` *(Belum ada `ReservationController`)*
   - `Recipe.php`, `RecipeIngredient.php` *(Belum ada `RecipeController` untuk HPP resep)*
   - `PurchaseOrder.php`, `PurchaseOrderItem.php` *(Belum ada `PurchaseOrderController`)*

---

### 🌐 D. Integrasi & Infrastruktur Lanjutan (`docs/12-deployment-devops.md` & `14-roadmap.md`)

| # | Komponen Infrastruktur | Spesifikasi Dokumen | Status Nyata Saat Ini | Keterangan & Rencana |
| :---: | :--- | :--- | :---: | :--- |
| **12** | **Payment Gateway Gateway** | Integrasi QRIS Dinamis & Virtual Account (Midtrans / Xendit). | 🟡 **Simulasi POS**<br>Kasir POS memilih QRIS/CASH/CARD secara manual. | Untuk Phase 2/3, sambungkan Webhook Midtrans agar pembayaran QRIS online terkonfirmasi otomatis di KDS. |
| **13** | **Email Notifications (Resend / SMTP)** | Email struk transaksi, reminder reservasi, dan low-stock alert. | ❌ **Belum Dikonfigurasi** | Sambungkan ke layanan *Resend API* atau *SendGrid*. |
| **14** | **Struk Thermal Printer API** | Cetak struk langsung ke printer kasir thermal Bluetooth/USB 58mm/80mm. | ❌ **Belum Dikonfigurasi** | Buat komponen `ReceiptPrinterModal.tsx` yang mendukung *WebUSB / Browser Print HTML* di `/admin/pos`. |
| **15** | **Queue Worker & Jobs** | Pemrosesan asinkron untuk rekap laporan bulanan dan notifikasi email massal. | ❌ **Belum Dikonfigurasi** | Setup Laravel Queue Worker / Vercel Cron Jobs. |

---

## 📋 Matriks Peta Jalan Penuntasan (Roadmap to 100% Dynamic MVP)

Untuk mentransformasi seluruh **25% kesenjangan (gap)** di atas menjadi **100% DINAMIS CLOUD SYSTEM**, berikut urutan prioritas eksekusi yang disarankan:

- [x] **Sprint 1 (Selesai - Menu & Resep):** Hubungkan `/admin/menu` ke Supabase CRUD Modal & bersihkan sisa emoji di halaman menu.
- [x] **Sprint 2 (Selesai - Inventaris & Otomasi):** Hubungkan `/admin/inventory` & aktifkan *Deduksi Stok Otomatis* saat pesanan KDS selesai (`completed`).
- [x] **Sprint 3 (Selesai - Riwayat & Analitik):** Hubungkan `/admin/orders` & `/admin/analytics` dengan tabel `orders` asli di Supabase + fitur *Export to Excel/CSV*.
- [x] **Sprint 4 (Selesai - Keamanan & RBAC):** Pasang `Admin Login Guard` di `/admin/login` dengan PIN/Kredensial + *Middleware Redirect*.
- [x] **Sprint 5 (Selesai - Pelanggan & Loyalty):** Hubungkan `/admin/crm` & `/admin/memberships` dengan akumulasi poin otomatis (`Rp 1.000 = 1 poin`) dan simulasi penukaran reward.
