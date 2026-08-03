# 📋 Dokumentasi Flow Lengkap — NEMU Coffee POS System

> Dokumen ini menjelaskan flow end-to-end dari setiap modul utama sistem. Disusun berdasarkan analisis langsung kode backend (Laravel) dan frontend (Next.js).

---

## 1. 🛒 FLOW PEMBELIAN OLEH PELANGGAN (POS Kasir)

### Alur Lengkap:

```
[Kasir memilih menu] 
  → [Klik menu item di grid]
  → [Jika ada varian → muncul VARIANT MODAL → pilih opsi (wajib/opsional)]
  → [Item masuk ke keranjang (cart)]
  → [Pilih Dine In / Takeaway]
    - Dine In → input Nomor Meja (wajib)
    - Takeaway → nomor meja kosong
  → [Input Nama Pelanggan (wajib)]
  → [Pilih Metode Bayar: Tunai / QRIS]
    - Tunai → input uang diterima → sistem hitung kembalian
    - QRIS → klik → muncul QRIS modal konfirmasi
  → [Klik "PROSES BAYAR"]
  → [Backend: createOrder() dipanggil]
```

### Yang Terjadi di Backend (Atomik / DB Transaction):

| Langkah | Aksi |
|---------|------|
| 1 | Hitung subtotal (harga menu × qty + harga varian × qty) |
| 2 | Baca setting PPN dari DB (`tax_enabled`, `tax_rate`) |
| 3 | Hitung tax & total akhir |
| 4 | Buat record `transactions` (invoice, kasir, meja, nama pelanggan, status: `selesai`) |
| 5 | Buat `order_tickets` (KDS ticket, status: `diterima`) — **otomatis kirim ke dapur** |
| 6 | Buat `transaction_items` + `transaction_item_variants` |
| 7 | Buat `order_ticket_items` untuk setiap item pesanan |
| 8 | **Auto deduct stok bahan baku** sesuai resep menu (BOM) |
| 9 | Log pengurangan stok ke `inventory_logs` |

### ✅ Stok Otomatis Berkurang?
**YA.** Setiap item terjual, sistem langsung mengurangi `stock_quantity` di tabel `inventories` sesuai `menu_ingredients.quantity_used` yang dikonfigurasi di resep BOM menu. Varian juga bisa mengubah jumlah bahan (add/subtract/multiply/swap).

### Struk Pelanggan (Customer Receipt):
- Format 80mm thermal printer
- Isi: Logo, Nama Toko, Alamat, No.Telp
- Invoice number, Tanggal, Jam, Nama Kasir, Nama Pelanggan
- Daftar item + qty + subtotal
- Subtotal, Diskon, PPN (jika aktif), **Total**
- Bayar & Kembalian (jika tunai)
- Metode Bayar, Footer terima kasih

### Struk Dapur (Kitchen Ticket / Barista Order):
- Format 80mm thermal printer
- Header: "BARISTA ORDER" + garis bintang
- Order # (4 digit akhir invoice)
- Jam pesanan masuk
- Jenis: Dine In (Meja X) atau Take Away
- Daftar item: **BESAR**, qty, catatan/varian
- Nama Pelanggan di bawah
- Footer garis bintang

---

## 2. 🍳 FLOW DAPUR / KDS (Kitchen Display System)

### URL: `/dashboard/admin/kds`
### Status yang dipakai di KDS:

| Status DB | Label KDS | Kolom |
|-----------|-----------|-------|
| `diterima` | Pesanan Baru | Kolom 1 |
| `diproses` | Sedang Diproses | Kolom 2 |
| `siap` | Pesanan Siap | Kolom 3 |
| `disajikan` | Selesai Diantar | (hilang dari board) |
| `dibatalkan` | Dibatalkan | (tidak muncul) |

### Alur KDS:

```
[Kasir submit order] 
  → KDS otomatis muncul tiket baru di kolom "Pesanan Baru"
  → [Notifikasi/alert & bunyi ping]
  
[Dapur klik "Mulai Proses"]
  → status: diterima → diproses
  → tiket pindah ke kolom "Sedang Diproses"
  → timestamp processed_at dicatat
  → semua item status: menunggu → diproses
  
[Dapur centang item satu per satu]
  → setiap item di-klik = ditandai selesai (visual coret)
  → tombol "Pesanan Siap" hanya bisa diklik jika SEMUA item sudah dicentang
  
[Dapur klik "Pesanan Siap"]
  → status: diproses → siap
  → tiket pindah ke kolom "Pesanan Siap"
  → timestamp ready_at dicatat
  → semua item status: selesai
  
[Kasir/Runner klik "Selesai Diantar"]
  → status: siap → disajikan
  → tiket hilang dari KDS board
  → timestamp served_at dicatat
```

### Real-time Sync:
- KDS polling via `useRealtimeOrders` hook
- Live indicator (hijau/merah) di header
- Timer per-tiket menghitung berapa lama pesanan belum diproses:
  - < 5 menit: normal (abu-abu)
  - 5-10 menit: warning (kuning)
  - > 10 menit: kritis (merah + pulse)

---

## 3. 🍽️ FLOW MENU (Master Menu)

### URL: `/dashboard/admin/menu`

### A. Kelola Menu Utama:

```
[Klik "Tambah Menu"]
  → Modal form:
    - Nama Menu (wajib)
    - Kategori (wajib, dari daftar kategori)
    - Harga (wajib)
    - Deskripsi (opsional)
    - Status: Tersedia / Tidak Tersedia
  → [Simpan] → API POST /admin/menus → menu ditambahkan

[Edit Menu]
  → Modal form pre-filled → ubah → Simpan → API PUT /admin/menus/{id}

[Toggle Status (klik badge Ready/Habis)]
  → Langsung toggle tersedia ↔ tidak_tersedia tanpa modal

[Toggle Best Seller (klik ★)]
  → Langsung toggle is_best_seller tanpa modal

[Hapus Menu]
  → Konfirmasi dialog → API DELETE → soft delete (masih bisa di-restore)
```

### B. Flow Resep & HPP (BOM — Bill of Materials):

```
[Klik tombol "Resep & HPP" di kartu menu]
  → Drawer kanan terbuka
  → Tampil: Daftar bahan baku yang sudah dikonfigurasi
  → Kalkulasi HPP otomatis (qty_used × unit_price bahan baku)
  
[Tambah Bahan Baku ke Resep]
  → Pilih inventory item dari dropdown
  → Input jumlah takaran (misal: 30 gram)
  → Klik + → bahan masuk daftar
  
[Tampil Summary HPP]
  → Harga Jual
  → Total HPP (modal)
  → Estimasi Profit Kotor + % Margin

[Simpan Komposisi]
  → API PUT /admin/menus/{id} dengan field ingredients[]
  → Relasi tersimpan di tabel menu_ingredients (pivot)
```

### C. Flow Varian Menu:

```
[Klik tombol "Atur Varian" di kartu menu]
  → Drawer kanan terbuka
  → Tampil semua Master Varian yang ada
  
[Pilih Varian Group]
  → Centang grup varian yang ingin dilampirkan ke menu
  → Set apakah varian ini WAJIB atau OPSIONAL
  
[Simpan]
  → API PUT /admin/menus/{id} dengan field variant_groups[]
  → Relasi tersimpan di tabel menu_variant_groups (pivot)
```

### D. Tabs Navigasi Menu Page:
| Tab | Fungsi |
|-----|--------|
| **Menus** | Daftar menu, kelola resep & varian |
| **Kategori** | CRUD kategori menu (Minuman, Makanan, dll) |
| **Varian** | Master varian & opsi (CRUD variant groups) |

---

## 4. 🏷️ FLOW KATEGORI & VARIAN

### A. Kategori Menu

**URL API:** `GET/POST/PUT/DELETE /admin/categories`

```
[Buat Kategori Baru]
  → Input nama kategori
  → POST /admin/categories
  → Kategori tersedia sebagai filter di menu POS & admin

[Edit Kategori]
  → PUT /admin/categories/{id}
  → Semua menu yang memakai kategori ini otomatis terupdate

[Hapus Kategori]
  → DELETE /admin/categories/{id}
  → Gagal jika masih ada menu dalam kategori ini
```

### B. Master Varian (Variant Groups & Options)

**URL API:** `GET/POST/PUT/DELETE /admin/variants`

```
[Buat Grup Varian Baru]
  → Nama grup (misal: "Ukuran", "Tingkat Manis", "Susu")
  → Tipe: SINGLE (pilih 1) atau MULTIPLE (pilih banyak)
  → Tambahkan opsi-opsi:
    - Nama opsi (misal: "Regular", "Large", "Extra Large")
    - Harga tambahan (misal: +0, +3000, +5000)
    - Inventory item yang dikurangi (opsional)
    - Inventory action: none / add / subtract / multiply / swap
    - Nilai action (jumlah pengaruh ke stok)
  → POST /admin/variants

[Edit Grup Varian]
  → Ubah nama/tipe grup
  → Tambah/hapus/edit opsi
  → PUT /admin/variants/{id}
  → Opsi yang dihapus akan dihapus dari DB (cascade)

[Hapus Grup Varian]
  → DELETE /admin/variants/{id}
  → Opsi-opsi dalam grup ikut terhapus

[Lampirkan ke Menu]
  → Lewat Drawer "Atur Varian" di halaman menu
  → Set wajib/opsional per menu
```

### Bagaimana Varian Mempengaruhi Stok:
| Action | Efek |
|--------|------|
| `none` | Tidak ada perubahan stok |
| `add` | Tambahkan nilai ke pengurangan bahan resep |
| `subtract` | Kurangi nilai dari pengurangan bahan resep |
| `multiply` | Kalikan nilai pengurangan bahan resep |
| `swap` | Ganti total pengurangan dengan nilai ini |

---

## 5. 📦 FLOW INVENTORY (Manajemen Bahan Baku)

### URL: `/dashboard/admin/inventory`

### A. Tambah Item Bahan Baku:

```
[Klik "Tambah Item Bahan"]
  → Modal form:
    - Nama bahan baku
    - Kategori inventory
    - Supplier (opsional)
    - Stok awal (quantity)
    - Satuan (gram, ml, pcs, dll)
    - Stok minimum (threshold alert)
  → POST /admin/inventories
  → Stok awal tercatat sebagai log INITIAL_STOCK
```

### B. Stock In (Barang Masuk):

```
[Klik tombol "Stock In" di kartu item]
  → Modal: input jumlah + referensi (misal: no. faktur)
  → POST /admin/inventories/{id}/stock-in
  → stock_quantity += jumlah
  → Log tersimpan di inventory_logs (type: stock_in)
```

### C. Waste / Stock Out (Manual):

```
[Klik tombol "Waste/Out" di kartu item]
  → Modal: input jumlah + alasan
  → POST /admin/inventories/{id}/stock-out
  → Validasi: stok harus mencukupi
  → stock_quantity -= jumlah
  → Log tersimpan di inventory_logs (type: stock_out)
```

### D. Stock Opname / Cycle Count:

```
[Klik "Opname Fisik" di kartu item]
  → Modal: input hitungan fisik aktual
  → Sistem hitung varians (fisik - sistem)
  → Jika ada varians positif → input batch number & expiry date (opsional)
  → POST /admin/inventories/{id}/adjust (type: adjustment)
  → stock_quantity = nilai fisik aktual
  → Log varians tersimpan
```

### E. Auto Deduct saat POS:

```
[Setiap transaksi POS berhasil]
  → Backend iterasi setiap item yang terjual
  → Cari resep (menu_ingredients) setiap menu
  → Kurangi stock_quantity sesuai quantity_used × qty terjual
  → Catat di inventory_logs (type: keluar, reference: transaction ID)
  → Varian juga bisa mengubah jumlah deduction
```

### F. Alert Stok Kritis:

```
[stock_quantity <= minimum_stock]
  → Banner merah berkedip muncul di halaman inventory
  → Tampil berapa item yang kritis
  → Tombol "Buat PO Pembelian Cepat" → navigasi ke halaman PO
```

### G. Log Mutasi (Tab "Log Mutasi & Audit"):
- Tampil semua pergerakan stok (masuk/keluar/opname)
- Sumber: transaksi POS, stock in manual, stock out/waste, opname
- Kolom: Waktu, Nama Bahan, Tipe, Perubahan Qty, Referensi, Petugas

---

## 6. 🧾 FLOW PEMBELIAN / PURCHASE ORDER (PO)

### URL: `/dashboard/admin/procurement/purchase-orders`

### Status PO:

| Status | Keterangan |
|--------|------------|
| `DRAFT` | PO dibuat tapi belum dikirim |
| `ORDERED` | PO sudah dikirim ke supplier |
| `PARTIAL` | Sebagian barang sudah diterima |
| `RECEIVED` | Semua barang sudah diterima penuh |
| `CANCELLED` | PO dibatalkan |

### Alur PO:

```
[Buat PO Baru]
  → Pilih supplier
  → Input tanggal order & estimasi tanggal terima
  → Tambahkan item-item:
    - Pilih inventory item (bahan baku)
    - Input qty yang dipesan
    - Pilih unit pembelian
    - Input conversion multiplier (misal: 1 karton = 24 pcs)
    - Input harga satuan (dalam cents/rupiah)
  → Sistem auto-hitung total harga
  → POST /admin/purchase-orders
  → PO dibuat dengan status ORDERED (atau DRAFT)

[Terima Barang (Receive PO)]
  → Klik tombol "Terima Barang" pada PO yang ada
  → Input jumlah barang yang diterima per item
  → POST /admin/purchase-orders/{id}/receive
  → Backend:
    - received_quantity += qty_received
    - stock_quantity += qty_received × conversion_multiplier
    - Log inventory (type: masuk, reference: purchase_order ID)
    - Jika semua item received_qty >= order_qty → status: RECEIVED
    - Jika sebagian → status: PARTIAL

[Batalkan PO]
  → Hanya bisa jika status DRAFT atau ORDERED
  → POST /admin/purchase-orders/{id}/cancel
  → Status: CANCELLED
  → Stok TIDAK berubah (belum diterima)
```

### Fitur Filter PO:
- Filter by status (All, DRAFT, ORDERED, PARTIAL, RECEIVED, CANCELLED)
- Filter by supplier

---

## 7. 🏢 FLOW DAFTAR SUPPLIER

### URL: `/dashboard/admin/suppliers` (atau `/dashboard/admin/procurement/suppliers`)

### A. Tambah Supplier:

```
[Klik "Tambah Supplier"]
  → Modal form:
    - Nama supplier (wajib)
    - Nomor telepon (opsional)
    - Alamat (opsional)
  → POST /admin/suppliers
  → Supplier tersedia di dropdown saat buat PO & input inventory

[Edit Supplier]
  → PATCH/PUT /admin/suppliers/{id}
  → Update nama, telepon, alamat

[Lihat Detail Supplier]
  → GET /admin/suppliers/{id}
  → Tampil: info supplier + daftar item inventory yang dipasok
  → Tampil jumlah item inventory yang terhubung

[Hapus Supplier]
  → DELETE /admin/suppliers/{id}
  → Validasi: GAGAL jika masih ada inventory item yang menggunakan supplier ini
  → Harus unlink inventory dulu sebelum hapus supplier
```

### Relasi Supplier:
- Supplier 1:N Inventory Items
- Inventory Items digunakan di: PO Items, Menu Ingredients
- Supplier dipakai di PO header

---

## 🔄 Diagram Relasi Antar Modul

```
SUPPLIER ──────── terhubung ke ────── INVENTORY ITEM
                                            │
                              ┌─────────────┴──────────────┐
                              │                             │
                        dipakai sbg                  dipakai sbg
                        RESEP MENU                   PO ITEM
                              │                             │
                           MENU ←──── BOM ────→ stok berkurang
                              │                   saat POS
                              │
                   dilampirkan ke
                        VARIAN GRUP
                              │
                           MENU
                              │
                          [POS KASIR]
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        TRANSACTION      ORDER TICKET    INVENTORY LOG
              │               │          (stok keluar)
         (struk)         [KDS DAPUR]
```

---

## ⚠️ Issues / Bugs yang Perlu Diperbaiki

### 1. POS — Struk Pelanggan (Minor)
- Nama toko masih hardcoded "NEMU COFFEE" di POS page → **seharusnya ambil dari settings DB**
- Alamat & telepon masih hardcoded

### 2. KDS — Status Mapping Tidak Konsisten
- Backend status: `diterima`, `diproses`, `siap`, `disajikan`
- Frontend hook `useRealtimeOrders` menggunakan: `pending`, `confirmed`, `preparing`, `ready`, `completed`
- **Gap ini menyebabkan KDS mungkin tidak update dengan benar dari backend!**

### 3. Inventory — Kategori di Halaman Inventory
- Field `category` di frontend inventory item adalah string bebas, bukan relasi ke `inventory_categories`
- Saat tambah item, `formCategory` diset string hardcoded (misal 'Kopi'), padahal backend butuh UUID `category_id`
- **Bug: tambah item baru mungkin gagal atau pakai kategori salah**

### 4. Admin Menu — Tabs Kategori & Varian
- Tab 'categories' dan 'variants' di halaman menu sudah ada di frontend tapi belum tampil (state `activeTab` tidak digunakan untuk render konten tab tersebut di bagian bawah page)

### 5. Inventory Log — Tipe Tidak Konsisten
- Backend `stockIn` mengirim `type: 'stock_in'`, backend POS mengirim `type: 'keluar'`
- Frontend log table mengexpect type: `STOCK_IN`, `STOCK_OUT_WASTE`, `BOM_AUTO_DEDUCT`, `OPNAME`
- **Perlu normalisasi tipe log**

---

## ✅ Yang Sudah Berjalan Baik

| Modul | Status |
|-------|--------|
| POS — pilih menu, cart, checkout | ✅ Berjalan |
| POS — input meja & nama pelanggan (validasi) | ✅ Berjalan |
| POS — cetak struk pelanggan | ✅ Berjalan |
| POS — cetak struk dapur | ✅ Berjalan |
| POS — auto buat KDS ticket | ✅ Berjalan |
| POS — auto deduct stok bahan baku | ✅ Berjalan |
| POS — hitung PPN dari setting DB | ✅ Berjalan |
| KDS — tampil 3 kolom (Baru/Proses/Siap) | ✅ Berjalan |
| KDS — timer per tiket | ✅ Berjalan |
| KDS — centang per item | ✅ Berjalan |
| Menu — CRUD menu | ✅ Berjalan |
| Menu — toggle status & best seller | ✅ Berjalan |
| Menu — BOM/resep HPP | ✅ Berjalan |
| Menu — attach varian | ✅ Berjalan |
| Variant — CRUD group + options | ✅ Berjalan |
| Inventory — tambah item | ✅ (ada bug category_id) |
| Inventory — stock in/out manual | ✅ Berjalan |
| Inventory — stock opname | ✅ Berjalan |
| Inventory — alert stok kritis | ✅ Berjalan |
| PO — buat PO | ✅ Berjalan |
| PO — terima barang + auto stock in | ✅ Berjalan |
| PO — batalkan PO | ✅ Berjalan |
| Supplier — CRUD | ✅ Berjalan |
| Supplier — proteksi hapus jika dipakai | ✅ Berjalan |
