# 03. KEBUTUHAN SISTEM & PERMISSION MATRIX

## 12. FUNCTIONAL REQUIREMENTS

### 12.1 Modul Publik (Website)

| ID | Requirement | Prioritas |
|---|---|---|
| FR-01 | Sistem menampilkan Landing Page dengan section dinamis (dapat diaktifkan/nonaktifkan via CMS) | Must Have |
| FR-02 | Sistem menampilkan daftar menu lengkap beserta gambar, harga, kategori, dan status ketersediaan | Must Have |
| FR-03 | Sistem menyediakan fitur pencarian dan filter menu berdasarkan kategori | Must Have |
| FR-04 | Sistem menampilkan promo aktif berdasarkan periode berlaku secara otomatis | Must Have |
| FR-05 | Sistem menampilkan artikel dengan pagination dan kategori | Should Have |
| FR-06 | Sistem menampilkan galeri foto dengan kategori dan caption | Should Have |
| FR-07 | Sistem menyediakan form reservasi dengan validasi input | Must Have |
| FR-08 | Sistem menampilkan lokasi coffee shop melalui embed Google Maps | Must Have |
| FR-09 | Sistem menyediakan tombol akses langsung ke WhatsApp | Must Have |
| FR-10 | Sistem mendukung mode PWA (install, offline, cache) | Should Have |

### 12.2 Modul Kasir

| ID | Requirement | Prioritas |
|---|---|---|
| FR-11 | Sistem menyediakan autentikasi login untuk Kasir | Must Have |
| FR-12 | Sistem menampilkan menu bergambar pada layar POS | Must Have |
| FR-13 | Sistem memungkinkan penambahan/pengurangan jumlah pesanan dalam keranjang | Must Have |
| FR-14 | Sistem memungkinkan penerapan diskon per transaksi | Must Have |
| FR-15 | Sistem menghitung total pembayaran otomatis (subtotal, diskon, pajak, total) | Must Have |
| FR-16 | Sistem mencetak struk transaksi | Must Have |
| FR-17 | Sistem menyimpan seluruh transaksi ke riwayat transaksi | Must Have |
| FR-18 | Sistem menampilkan daftar reservasi hari ini pada dashboard kasir | Should Have |

### 12.3 Modul Dapur/Barista (Kitchen Display)

| ID | Requirement | Prioritas |
|---|---|---|
| FR-36 | Sistem menyediakan autentikasi login untuk Dapur/Barista | Must Have |
| FR-37 | Sistem menampilkan antrian pesanan secara real-time begitu transaksi dibuat di POS | Must Have |
| FR-38 | Sistem menampilkan detail item pesanan (nama menu, jumlah, catatan khusus) per tiket pesanan | Must Have |
| FR-39 | Sistem memungkinkan Dapur/Barista mengubah status tiket pesanan (Diterima → Diproses → Siap) | Must Have |
| FR-40 | Sistem memberikan notifikasi visual/suara ketika ada pesanan baru masuk ke antrian | Should Have |
| FR-41 | Sistem menampilkan pesanan berdasarkan urutan waktu masuk (FIFO), dengan penanda visual jika pesanan sudah melewati batas waktu wajar (contoh: > 10 menit) | Should Have |
| FR-42 | Status "Siap" pada Kitchen Display tersinkronisasi ke Dashboard Kasir agar kasir tahu pesanan mana yang bisa diserahkan ke pelanggan | Must Have |

### 12.4 Modul Admin

| ID | Requirement | Prioritas |
|---|---|---|
| FR-19 | Sistem menyediakan CRUD penuh untuk seluruh konten Landing Page | Must Have |
| FR-20 | Sistem menyediakan CRUD Menu dan Kategori Menu | Must Have |
| FR-21 | Sistem menyediakan CRUD Promo dengan validasi periode berlaku | Must Have |
| FR-22 | Sistem menyediakan CRUD Artikel dengan editor WYSIWYG dan SEO metadata | Must Have |
| FR-23 | Sistem menyediakan CRUD Galeri dengan upload gambar ke Supabase Storage | Must Have |
| FR-24 | Sistem menyediakan pengelolaan status reservasi (konfirmasi/tolak/selesai/batal) | Must Have |
| FR-25 | Sistem menyediakan CRUD Inventory (bahan, kategori, stok, supplier) | Must Have |
| FR-26 | Sistem mencatat mutasi stok (barang masuk/keluar) secara otomatis dari transaksi POS | Must Have |
| FR-27 | Sistem mengirimkan notifikasi ketika stok berada di bawah ambang batas minimum | Must Have |
| FR-28 | Sistem menyediakan laporan (penjualan, reservasi, inventory, kasir) dengan filter tanggal | Must Have |
| FR-29 | Sistem menyediakan ekspor laporan dalam format PDF dan Excel | Must Have |
| FR-30 | Sistem menyediakan halaman Pengaturan Website (identitas, kontak, SEO, tema) | Must Have |

### 12.5 Modul Owner

| ID | Requirement | Prioritas |
|---|---|---|
| FR-31 | Sistem menyediakan Dashboard Bisnis dengan grafik penjualan (harian/mingguan/bulanan) | Must Have |
| FR-32 | Sistem menampilkan statistik menu terlaris dan tren penjualan | Must Have |
| FR-33 | Sistem menyediakan fitur backup dan restore data | Must Have |
| FR-34 | Sistem menyediakan manajemen user (buat/edit/nonaktifkan akun Admin & Kasir) | Must Have |
| FR-35 | Sistem mencatat audit log terhadap seluruh aktivitas penting pengguna internal | Should Have |

---

## 13. NON FUNCTIONAL REQUIREMENTS

| ID | Kategori | Requirement |
|---|---|---|
| NFR-01 | Performance | Waktu muat halaman utama (Landing Page) maksimal 2.5 detik pada koneksi 4G |
| NFR-02 | Performance | POS harus merespons interaksi (klik menu/tambah keranjang) dalam waktu < 300ms |
| NFR-03 | Scalability | Backend harus mampu menangani hingga 500 concurrent user tanpa penurunan performa signifikan |
| NFR-04 | Availability | Target uptime sistem sebesar 99.5% |
| NFR-05 | Security | Seluruh komunikasi API menggunakan HTTPS/TLS |
| NFR-06 | Security | Password pengguna internal disimpan menggunakan hashing bcrypt/argon2 |
| NFR-07 | Usability | Antarmuka POS harus dapat digunakan oleh kasir baru tanpa pelatihan lebih dari 15 menit |
| NFR-08 | Maintainability | Kode backend & frontend mengikuti standar penulisan (ESLint, PSR-12) dan modular |
| NFR-09 | Portability | Website dapat diakses pada seluruh browser modern (Chrome, Firefox, Safari, Edge) |
| NFR-10 | Compatibility | Sistem mendukung Dark Mode dan Light Mode secara konsisten di seluruh halaman |
| NFR-11 | Offline Capability | PWA dapat menampilkan Landing Page, Menu, dan Gambar dalam kondisi offline (cached) |
| NFR-12 | Data Integrity | Seluruh transaksi POS bersifat atomik (tidak ada data transaksi yang hilang/duplikat) |
| NFR-13 | Localization | Seluruh konten menggunakan Bahasa Indonesia dan format Rupiah (Rp) |
| NFR-14 | Accessibility | Sistem memenuhi standar WCAG 2.1 level AA minimal pada halaman publik |

---

## 25. ROLE & PERMISSION MATRIX

| Modul / Fitur | Pelanggan | Kasir | Dapur/Barista | Admin | Owner |
|---|:---:|:---:|:---:|:---:|:---:|
| Lihat Landing Page & Menu Publik | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kirim Reservasi | ✓ | — | — | — | — |
| Login Sistem | — | ✓ | ✓ | ✓ | ✓ |
| Akses POS | — | ✓ | — | ✓ | ✓ |
| Cetak Struk | — | ✓ | — | ✓ | ✓ |
| Akses Kitchen Display | — | Lihat saja* | ✓ | ✓ | ✓ |
| Ubah Status Tiket Pesanan | — | — | ✓ | ✓ | ✓ |
| Lihat Riwayat Transaksi Sendiri | — | ✓ | — | ✓ | ✓ |
| Lihat Seluruh Riwayat Transaksi | — | — | — | ✓ | ✓ |
| Void/Batalkan Transaksi | — | — | — | ✓ | ✓ |
| Kelola Konten Landing Page (CMS) | — | — | — | ✓ | ✓ |
| Kelola Menu & Kategori | — | — | — | ✓ | ✓ |
| Kelola Promo | — | — | — | ✓ | ✓ |
| Kelola Artikel | — | — | — | ✓ | ✓ |
| Kelola Galeri | — | — | — | ✓ | ✓ |
| Kelola Reservasi (konfirmasi/tolak) | — | — | — | ✓ | ✓ |
| Kelola Inventory | — | — | — | ✓ | ✓ |
| Kelola Data Kasir & Dapur/Barista (tambah/edit shift) | — | — | — | ✓ | ✓ |
| Lihat Laporan | — | — | — | ✓ | ✓ |
| Ekspor Laporan (PDF/Excel) | — | — | — | ✓ | ✓ |
| Kelola Pengaturan Website | — | — | — | ✓ | ✓ |
| Dashboard Bisnis & Grafik | — | — | — | — | ✓ |
| Backup & Restore Data | — | — | — | — | ✓ |
| Pengaturan Sistem Lanjutan | — | — | — | — | ✓ |
| Manajemen User (buat/nonaktifkan akun) | — | — | — | — | ✓ |
| Lihat Audit Log | — | — | — | Sebagian** | ✓ |

\*Kasir dapat melihat status tiket pesanan (khususnya status "Siap") pada Dashboard Kasir untuk keperluan penyerahan pesanan ke pelanggan, namun tidak dapat mengubah status tiket.
\**Admin hanya dapat melihat audit log terkait aktivitasnya sendiri, sedangkan Owner dapat melihat seluruh audit log sistem.

> **Catatan Fleksibilitas Role:** Owner dapat menetapkan satu akun pengguna dengan **dua peran sekaligus** (Kasir + Dapur/Barista) melalui Manajemen User, sehingga staf yang merangkap tugas kasir dan barista tetap dapat login satu kali namun memiliki akses ke POS maupun Kitchen Display.
