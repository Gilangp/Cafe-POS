# 8. Modul Fungsional

**Dokumen:** Functional Modules Specification
**Versi:** 1.0.0
**Status:** Baseline

---

## 8.1 POS (Point of Sale)

- **Deskripsi:** Aplikasi untuk kasir membuat order di toko.
- **Fitur:**
  - Tampilan grid menu & kategori.
  - Pencarian item.
  - Tambah/hapus item.
  - Apply diskon/promo.
  - Integrasi payment gateway.
  - Split bill.
  - Cetak struk.
  - Manajemen shift & cash drawer.

---

## 8.2 KDS (Kitchen Display System)

- **Deskripsi:** Tampilan real-time order untuk dapur.
- **Fitur:**
  - Tampilan tiket order masuk.
  - Timer untuk setiap order.
  - Status order: `NEW`, `PREPARING`, `READY`.
  - Notifikasi suara untuk order baru.
  - Ringkasan item yang perlu disiapkan.

---

## 8.3 Inventory Management

- **Deskripsi:** Mengelola stok bahan baku dan barang jadi.
- **Fitur:**
  - Daftar item & kategori.
  - Pencatatan stok masuk & keluar.
  - Deduksi stok otomatis dari penjualan (recipe-based).
  - Laporan stok & valuasi.
  - Low stock alert.
  - Manajemen purchase order & supplier.

---

## 8.4 Menu Management

- **Deskripsi:** Mengelola menu yang tampil di semua channel.
- **Fitur:**
  - Manajemen kategori & item.
  - Manajemen resep & HPP.
  - Set harga, deskripsi, gambar.
  - Set ketersediaan item per cabang.
  - Manajemen modifier/pilihan tambahan.

---

## 8.5 Membership & Loyalty (CRM)

- **Deskripsi:** Mengelola data pelanggan dan program loyalty.
- **Fitur:**
  - Pendaftaran member.
  - Tier membership (Bronze, Silver, Gold).
  - Akumulasi & penukaran poin.
  - Histori transaksi member.
  - Broadcast promo ke member.

---

## 8.6 Reservation Management

- **Deskripsi:** Sistem booking meja.
- **Fitur:**
  - Cek ketersediaan slot waktu.
  - Booking online.
  - Konfirmasi & reminder via email/SMS.
  - Manajemen meja & kapasitas.
  - Deposit booking.

---

## 8.7 CMS (Content Management System)

- **Deskripsi:** Mengelola konten website.
- **Fitur:**
  - Page builder (landing page, about us).
  - Blog & articles.
  - Manajemen gallery.
  - Manajemen event.
  - Konfigurasi brand (logo, warna).

---

## 8.8 Analytics & Reporting

- **Deskripsi:** Dashboard dan laporan untuk manajemen.
- **Fitur:**
  - Dashboard sales harian.
  - Laporan penjualan (per item, per kategori).
  - Laporan inventory.
  - Laporan membership.
  - Export ke CSV/Excel.

---

**Document Status:** ✅ Complete
