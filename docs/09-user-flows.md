# 9. User Flows

**Dokumen:** Key User Flows
**Versi:** 1.0.0
**Status:** Baseline

---

## 9.1 Alur Order Online (Customer)

1. **Browse:** Buka website/app, pilih cabang.
2. **Select:** Lihat menu, klik "Add to Cart".
3. **Cart:** Review order, `special instructions`, klik "Checkout".
4. **Login/Guest:** Login, daftar, atau lanjut sebagai tamu.
5. **Details:** Pilih `PICKUP` atau `DELIVERY`. Isi alamat jika perlu.
6. **Payment:** Pilih metode bayar, selesaikan pembayaran.
7. **Confirmation:** Terima notifikasi order dikonfirmasi.
8. **Track:** Lihat status order (`PREPARING`, `READY`).
9. **Complete:** Ambil order/terima pengiriman.

---

## 9.2 Alur Order In-Store (Cashier)

1. **Start:** Buka sesi POS, masukkan PIN.
2. **Select:** Pilih item dari grid menu.
3. **Customize:** Tambah modifier jika diminta.
4. **Member:** Scan kartu member atau cari via no. HP.
5. **Confirm:** Konfirmasi order ke pelanggan.
6. **Payment:** Pilih metode bayar, terima pembayaran.
7. **Receipt:** Tawarkan struk cetak atau kirim via email.
8. **KDS:** Order otomatis masuk ke KDS.

---

## 9.3 Alur Pembuatan Menu Baru (Branch Manager)

1. **Login:** Masuk ke Admin Dashboard.
2. **Inventory:** Buat `Inventory Item` baru untuk bahan baku.
3. **Recipe:** Masuk ke modul Menu, buat `Recipe` baru, tambahkan bahan & kuantitas. HPP terhitung otomatis.
4. **Menu Item:** Buat `Menu Item` baru.
5. **Details:** Isi nama, deskripsi, harga jual, assign resep, upload gambar.
6. **Publish:** Set item sebagai `Available`.
7. **Verify:** Cek di POS & website, menu baru sudah tampil.

---

## 9.4 Alur Penerimaan Barang (Inventory Staff)

1. **PO:** Buat `Purchase Order` ke supplier.
2. **Receive:** Saat barang datang, buka menu `Procurement`.
3. **Match:** Cari PO terkait.
4. **Check:** Hitung barang fisik, bandingkan dengan PO.
5. **Input:** Masukkan jumlah diterima. Sistem otomatis update `current_quantity` di inventory.
6. **Label:** Cetak label barcode internal jika perlu.
7. **Done:** Selesaikan penerimaan.

---

**Document Status:** ✅ Complete
