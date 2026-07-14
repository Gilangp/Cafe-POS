# 22. Bukti Eksekusi dan Audit Verifikasi — Fase 2 (Sprint 2: Core Catalog, Recipe Costing Engine & Supply Chain Foundation)

**Dokumen:** Formal Execution Evidence, Test Verification Logs & System Audit Trail for Phase 2 (Sprint 2)  
**Versi:** 1.0.0 (Verified Final)  
**Status Audit:** ✅ 100% Lulus Verifikasi (32 Tests Passed, 119 Assertions)  
**Tanggal Verifikasi:** 2026-07-14  
**Referensi Roadmap:** `docs/20-panduan-eksekusi-dan-audit.md` (Bagian Phase 2) & `prd.md` (Bab 11 Modul `MNU`, `RCP`, `INV`, `PUR`)

---

## 22.1 Ringkasan Eksekutif & Status Penyelesaian

Pengerjaan **Phase 2 (Sprint 2: Core Catalog, Recipe Costing Engine & Supply Chain Foundation)** untuk platform Velvra telah diselesaikan 100%. Fase ini mengubah struktur katalog dasar menjadi **Mesin Operasional Multi-Cabang** dengan kemampuan penghitungan Harga Pokok Penjualan (COGS) secara dinamis menggunakan metode rata-rata tertimbang (*weighted-average*) dan pemotongan stok berakurasi tinggi berbasis **FEFO (*First-Expired-First-Out*)**.

Seluruh implementasi telah diuji secara menyeluruh melalui suite pengujian otomatis (`php artisan test`) tanpa ada regresi pada Fase 0 dan Fase 1 yang telah dibangun sebelumnya.

| Pillar / Komponen Kunci | Deskripsi Fitur & Spesifikasi PRD | Status Verifikasi | File Implementation Utama |
| :--- | :--- | :--- | :--- |
| **1. Menu & Modifiers (`MNU`)** | **Branch Price Overriding & 86'd Availability Status:** Kemampuan override harga produk per cabang serta mematikan ketersediaan item secara live tanpa mengubah harga dasar master. | ✅ **Verified 100%** | `BranchProduct.php`, `ProductController.php` |
| **2. Recipe & COGS Engine (`RCP-003`)** | **Bill-of-Materials & Weighted-Average COGS Engine:** Penghitungan total biaya resep berdasarkan porsi (*yield*) dan integrasi pembaruan otomatis ke atribut `cost_cents` pada model `Product`. | ✅ **Verified 100%** | `RecipeController.php`, `Recipe.php`, `RecipeIngredient.php` |
| **3. Batch Tracking & FEFO Engine (`INV-006`)** | **First-Expired-First-Out Deduction Engine:** Perekaman batch masuk lengkap dengan tanggal kedaluwarsa (`expiration_date`) serta pemotongan otomatis batch terawal saat transaksi. | ✅ **Verified 100%** | `StockBatch.php`, `InventoryController.php`, Migrasi `000018` |
| **4. Procurement & PO Receiving (`PUR`)** | **Automated PO Receiving & Cost Calculation:** Penerimaan pesanan pembelian otomatis memicu perhitungan ulang *weighted-average unit cost* pada master inventaris dan pembuatan *stock batch*. | ✅ **Verified 100%** | `PurchaseOrderController.php`, `PurchaseOrder.php` |

---

## 22.2 Detail Arsitektur & Implementasi Teknis (3 Pilar Fase 2)

### Pilar 1: Modul Menu & Modifiers (`MNU-003`, `MNU-004`)
Untuk mendukung harga yang berbeda di setiap cabang (misal: Cabang SCBD vs Cabang pinggiran kota) serta kehabisan bahan mendadak (*86'd status*), sistem menggunakan relasi `BranchProduct`:
1. **Model `BranchProduct` dengan Trait `BranchScoped`:**
   Dibuat model baru `App\Models\BranchProduct` yang mengimplementasikan Global Scope `BranchScoped`. Setiap record mengikat `branch_id`, `product_id`, `price` (override price), dan `is_available` (boolean status produk di cabang tersebut).
2. **Enrichment Data Dinamis pada `ProductController`:**
   Saat endpoint `GET /api/v1/menu/items` atau `GET /api/v1/menu/items/{product}` diakses, sistem secara otomatis membaca konteks cabang dari header `X-Branch-Id` atau profil user yang login.
   - Jika record `BranchProduct` ditemukan: properti `effective_price` diisi dengan harga cabang dan `is_available` diisi dengan status availability cabang.
   - Jika tidak ditemukan: `effective_price` jatuh ke `base_price` master dan `is_available` bernilai `true`.
   - Parameter query `available_only=1` akan menyaring produk yang sedang dalam status *86'd* (`is_available = false`).
3. **Endpoint Override Branch Product:**
   Tersedia route khusus `PATCH /api/v1/products/{product}/branch-override` untuk memperbarui atau membuat override baru di tingkat cabang secara atomik.

### Pilar 2: Modul Recipe & COGS Costing Engine (`RCP-003`)
Biaya produk makanan dan minuman sangat berfluktuasi tergantung harga bahan baku di gudang. Velvra mengeliminasi entri COGS manual melalui **Recipe Costing Engine**:
1. **Struktur Bill-of-Materials (BoM):**
   Model `Recipe` memiliki banyak `RecipeIngredient` yang secara langsung terhubung ke `InventoryItem` (misal: biji kopi, susu segar, sirup vanila).
2. **Algoritma Perhitungan Rata-Rata Tertimbang (*Weighted-Average Cost*):**
   Melalui endpoint `POST /api/v1/recipes/{recipe}/calculate-cogs?sync_products=1` (dan internal service di `RecipeController@calculateCosting`), sistem melakukan kalkulasi:
   $$\text{Total Ingredient Cost} = \sum_{i=1}^{n} (\text{Quantity}_i \times \text{Unit Cost Cents}_i)$$
   $$\text{Cost Per Portion Cents} = \text{round}\left( \frac{\text{Total Ingredient Cost}}{\text{Yield Quantity}} \right)$$
3. **Pembaruan Otomatis ke Katalog (`sync_products=1`):**
   Jika flag `sync_products` diaktifkan, sistem langsung melakukan pembaruan massal pada kolom `cost_cents` di seluruh tabel `products` yang mengacu pada `recipe_id` tersebut, memastikan laporan profitabilitas margin selalu relevan dan akurat.

### Pilar 3: Modul Inventory, Batch Tracking & FEFO Engine (`INV-006` / `PUR`)
Untuk mematuhi standar keamanan pangan dan pelacakan audit ketat, stok tidak sekadar dicatat sebagai satu angka tunggal, melainkan dipecah ke dalam batch masa kedaluwarsa:
1. **Migrasi dan Model `StockBatch`:**
   Migrasi `2024_01_01_000018_create_stock_batches_table.php` mendefinisikan tabel `stock_batches` dengan indeks di `(inventory_item_id, branch_id, quantity_remaining)` dan `expiration_date`.
2. **Mesin Pemotongan Stok FEFO (*First-Expired-First-Out*):**
   Di dalam `InventoryController@adjust` (untuk pemotongan minus/waste) dan `InventoryController@fefoDeduct` (untuk konsumsi dari transaksi POS), query pencarian batch diurutkan secara ketat:
   ```php
   $batches = \App\Models\StockBatch::withoutBranchScope()
       ->where('inventory_item_id', $item->id)
       ->where('branch_id', $item->branch_id)
       ->where('quantity_remaining', '>', 0)
       ->where('status', 'ACTIVE')
       ->orderByRaw('expiration_date ASC NULLS LAST, id ASC')
       ->get();
   ```
   Mesin akan memotong dari batch dengan tanggal kedaluwarsa paling awal hingga kuantitas terpenuhi. Apabila `quantity_remaining` mencapai `0`, status batch otomatis diubah menjadi `'DEPLETED'`.
3. **Alur Procurement (PO Receiving & Weighted-Average Unit Cost):**
   Pada endpoint `POST /api/v1/purchase-orders/{purchase_order}/receive` di `PurchaseOrderController@receive`, saat barang datang:
   - Sistem memperhitungkan ulang harga pokok rata-rata tertimbang pada `InventoryItem`:
     $$\text{New Unit Cost} = \frac{(\text{Current Qty} \times \text{Current Unit Cost}) + (\text{Received Qty} \times \text{Incoming Price})}{(\text{Current Qty} + \text{Received Qty})}$$
   - Sistem secara otomatis mencetak record `StockBatch` baru berisikan `batch_number` dan `expiration_date` yang diterima dari supplier.
   - Perekaman jejak audit di tabel `inventory_transactions` dengan referensi `PURCHASE_ORDER`.

---

## 22.3 Matriks Pemetaan Kode & File Terkena Dampak

| Path File | Jenis Perubahan | Deskripsi Perubahan Teknis |
| :--- | :--- | :--- |
| `backend/app/Models/BranchProduct.php` | **Baru** | Model Eloquent dengan trait `BranchScoped` untuk override harga dan status *86'd* per cabang (`MNU-003`). |
| `backend/app/Models/StockBatch.php` | **Baru** | Model Eloquent dengan trait `BranchScoped` untuk pelacakan batch inventaris dan masa kedaluwarsa (`INV-006`). |
| `backend/app/Models/Product.php` | Diperbarui | Penambahan kolom `recipe_id` dan `cost_cents` ke properti `$fillable` dan `$casts` integer. |
| `backend/app/Http/Controllers/Api/ProductController.php` | Diperbarui | Penyisipan logika pengecekan override `BranchProduct` pada `index()` & `show()`, serta penambahan metode `overrideBranch()`. |
| `backend/app/Http/Controllers/Api/RecipeController.php` | **Baru** | Controller lengkap dengan integrasi BoM CRUD dan mesin `calculateCosting()` (*weighted average COGS engine*). |
| `backend/app/Http/Controllers/Api/InventoryController.php` | Diperbarui | Integrasi pemotongan batch FEFO pada `adjust()` dan pembuatan endpoint khusus `fefoDeduct()`. |
| `backend/app/Http/Controllers/Api/PurchaseOrderController.php` | **Baru** | Controller untuk manajemen Purchase Order, alur penerimaan barang (`receive`), auto-cost calculation, dan batch creation. |
| `backend/routes/api.php` | Diperbarui | Pendaftaran route `products/{product}/branch-override`, `recipes`, `recipes/{recipe}/calculate-cogs`, `inventory/fefo-deduct`, `purchase-orders`, dan `purchase-orders/{po}/receive`. |
| `backend/database/migrations/2024_01_01_000018_create_stock_batches_table.php` | **Baru** | Skema tabel `stock_batches` dengan foreign key, kuantitas remaining, dan indeks tanggal kedaluwarsa. |
| `backend/database/migrations/2024_01_01_000019_add_recipe_and_cost_to_products_table.php` | **Baru** | Skema penambahan kolom `recipe_id` dan `cost_cents` ke tabel `products`. |
| `backend/tests/Feature/Phase2CatalogInventoryTest.php` | **Baru** | Suite pengujian otomatis komprehensif menguji seluruh spesifikasi 4 pilar bisnis Fase 2. |

---

## 22.4 Bukti Audit & Log Verifikasi Terminal (`Phase2CatalogInventoryTest`)

Berikut adalah bukti eksekusi dan otentikasi pengujian otomatis menggunakan PHPUnit / NunoMaduro Collision di dalam terminal lingkungan kerja backend:

```powershell
PS C:\laragon\www\coffee_shop\backend> php artisan test

   PASS  Tests\Feature\AuthTest
  ✓ user can login with valid credentials                                                                        0.42s  
  ✓ user cannot login with invalid credentials                                                                   0.02s  
  ✓ inactive user cannot login                                                                                   0.02s  
  ✓ user can register                                                                                            0.02s  
  ✓ authenticated user can get profile                                                                           0.02s  
  ✓ authenticated user can logout                                                                                0.02s  
  ✓ unauthenticated access is rejected                                                                           0.02s  
  ✓ authenticated user can refresh token                                                                         0.02s  

   PASS  Tests\Feature\HealthCheckTest
  ✓ health endpoint returns healthy                                                                              0.03s  

   PASS  Tests\Feature\OrderTest
  ✓ authenticated user can create order                                                                          0.04s  
  ✓ order requires at least one item                                                                             0.02s  
  ✓ order validates order type                                                                                   0.02s  
  ✓ order status can be updated                                                                                  0.03s  
  ✓ order can be cancelled                                                                                       0.03s  
  ✓ completed order cannot be cancelled                                                                          0.03s  

   PASS  Tests\Feature\Phase2CatalogInventoryTest
  ✓ branch price override and availability 86d status                                                            0.04s  
  ✓ recipe cogs calculation engine                                                                               0.03s  
  ✓ fefo batch tracking and stock deduction                                                                      0.03s  
  ✓ purchase order receiving updates stock and weighted average cost                                             0.03s  

   PASS  Tests\Feature\ProductTest
  ✓ public can list products                                                                                     0.03s  
  ✓ public can view single product                                                                               0.02s  
  ✓ admin can create product                                                                                     0.03s  
  ✓ admin can update product                                                                                     0.02s  
  ✓ admin can delete product                                                                                     0.03s  
  ✓ inactive products not shown in public list                                                                   0.04s  

   PASS  Tests\Feature\RBACBranchScopeTest
  ✓ super admin bypasses permission check                                                                        0.03s  
  ✓ user without permission is rejected with 403                                                                 0.03s  
  ✓ user can access own branch                                                                                   0.03s  
  ✓ user cannot access unauthorized branch via payload                                                           0.03s  
  ✓ user cannot access unauthorized branch via header                                                            0.03s  
  ✓ super admin can access any branch                                                                            0.02s  
  ✓ global branch scope filters eloquent queries                                                                 0.03s  

  Tests:    32 passed (119 assertions)
  Duration: 1.49s
```

### Penjelasan 4 Skenario Pengujian Kunci `Phase2CatalogInventoryTest`:
1. **`test_branch_price_override_and_availability_86d_status` (`MNU-003` / `MNU-004`):**
   - Menguji bahwa produk yang sama (`Signature Espresso`, base price 25.00) dapat di-override pada `Branch A` menjadi harga 30.00 dan dinonaktifkan (`is_available = false`).
   - Memastikan request dengan header `X-Branch-Id: Branch A` mengembalikan `effective_price = 30.00` dan tidak muncul jika dipanggil dengan `available_only=1`.
   - Memastikan request dengan header `X-Branch-Id: Branch B` tetap mengembalikan harga asli 25.00 dan `is_available = true`.
2. **`test_recipe_cogs_calculation_engine` (`RCP-003`):**
   - Menguji pembuatan resep `Iced Cafe Latte` (`yield = 2 portion`) yang terdiri dari `0.02 kg` kopi Arabica (Rp 15.00/kg -> 1500 cents/kg = 30 cents) dan `0.20 liter` susu segar (Rp 2.00/L -> 200 cents/L = 40 cents).
   - Memastikan total biaya bahan adalah `70 cents` dan biaya per porsi adalah `35 cents`.
   - Memverifikasi bahwa atribut `cost_cents` pada tabel `Product` untuk `Iced Cafe Latte` tersinkronisasi otomatis menjadi `35`.
3. **`test_fefo_batch_tracking_and_stock_deduction` (`INV-006`):**
   - Menguji item `Vanilla Syrup` dengan total stok `100 botol` terbagi dalam 2 batch: `Batch 1 (30 botol, expired 1 Agustus 2026)` dan `Batch 2 (70 botol, expired 1 Oktober 2026)`.
   - Melakukan pemotongan `40 botol` via endpoint `POST /api/v1/inventory/fefo-deduct`.
   - Memverifikasi secara presisi bahwa `Batch 1` habis total (`quantity_remaining = 0`, status `DEPLETED`), `Batch 2` berkurang tepat `10 botol` (`remaining = 60`), dan stok master item menjadi `60 botol`.
4. **`test_purchase_order_receiving_updates_stock_and_weighted_average_cost` (`PUR`):**
   - Mengatur kondisi awal `Robusta Beans` sebanyak `50 kg` dengan harga rata-rata awal `$10.00/kg`.
   - Menerima pesanan pembelian (`PO`) baru untuk `50 kg` dengan harga beli baru `$14.00/kg`.
   - Memverifikasi kalkulasi matematis rata-rata tertimbang: $\frac{(50 \times 10) + (50 \times 14)}{100} = \$12.00$.
   - Memastikan stok total menjadi `100 kg` dan record `StockBatch` ber-expired date baru berhasil diciptakan.

---

## 22.5 Verifikasi Frontend TypeScript & Linting

Untuk memastikan tidak ada ketidaksesuaian kontrak tipe data atau *error linting* pada aplikasi Next.js 15 setelah penambahan struktur API baru, telah dilakukan pemeriksaan menggunakan `tsc --noEmit` dan `npm run lint`:

```powershell
PS C:\laragon\www\coffee_shop\frontend> npx tsc --noEmit
# Status: Lulus tanpa error tipe (0 errors)

PS C:\laragon\www\coffee_shop\frontend> npm run lint
> velvra-frontend@1.0.0 lint
> next lint

✔ No ESLint warnings or errors
```

---

## 22.6 Checklist Audit Mandiri (Self-Audit Evidence Checklist)

- [x] **Audit 1: Fungsionalitas (*Functional Integrity*)** — Seluruh logika override harga, status *86'd*, kalkulasi COGS dari BoM, pemotongan stok FEFO, serta penerimaan PO berjalan 100% sesuai spesifikasi PRD v1.0.0.
- [x] **Audit 2: Keamanan & Isolasi Data (*Security & Scope Audit*)** — Model `BranchProduct` dan `StockBatch` menggunakan trait `BranchScoped` untuk menjaga isolasi data multi-cabang secara ketat di layer database Eloquent.
- [x] **Audit 3: Konsistensi Database & Migrasi (*Database Integrity*)** — Migrasi `000018` dan `000019` telah dirancang dan dieksekusi dengan *foreign key constraints*, *default values*, dan indexing yang optimal.
- [x] **Audit 4: Kualitas Kode & Regresi (*Quality & Regression*)** — Full test suite lulus 100% (`32 tests passed, 119 assertions`) tanpa ada kebocoran atau kerusakan pada fitur Auth dan RBAC Fase 1.
- [x] **Audit 5: Kerapihan Frontend/Linter (*Clean Code & Typing*)** — Frontend Next.js 15 lulus pengecekan TypeScript kompiler (`tsc`) dan Next ESLint tanpa peringatan (*zero warnings/errors*).

---

## 22.7 Kesiapan Transisi ke Fase Selanjutnya

Dengan rampungnya **Phase 2**, fondasi katalog produk yang memiliki harga dinamis dan inventaris yang melacak batch kedaluwarsa kini telah beroperasi penuh di backend. 

**Proyek kini siap 100% untuk memasuki Phase 3 (Sprint 3: POS Offline-First & KDS Real-Time Display):**
1. **Terminal POS (`POS`):** Pembangunan UI kasir interaktif dengan antrean IndexedDB lokal untuk ketahanan jaringan tanpa internet (*Offline-First Resilience*).
2. **Kitchen Display System (`KDS`):** Implementasi layar dapur *real-time* yang menerima pesanan secara instan via WebSockets serta memiliki *local buffering*.
