# 8. Modul Fungsional (Core Modules Specification)

**Dokumen:** Functional Modules Specification  
**Versi:** 1.0.0 (Synchronized with Canonical Baseline PRD)  
**Status:** Baseline  
**Referensi:** PRD Section 9 - Core Modules Functional Specifications  

---

## 8.0 Overview Modul

Platform Velvra terdiri dari **32 Modul Fungsional (`8.1` s.d. `8.32`)** yang terintegrasi secara modular ke dalam arsitektur *Monolith-to-Services-Ready*. Setiap modul di bawah ini memuat spesifikasi **Tujuan (Purpose)**, **Fitur Utama (Key Features)**, **Daftar Requirement Formal (`MOD-###`)** beserta **Prioritas (Must/Should/Could)**, dan **Aturan Bisnis (Business Rules)**.

---

## 8.1 Premium Landing Website (`WEB`)

**Tujuan:** Permukaan digital publik utama brand; bertugas mengonversi pengunjung menjadi pesanan online, reservasi meja, atau pendaftaran member loyalty sekaligus menyampaikan identitas brand premium.  
**Fitur Utama:** Storytelling hero section, signature menu highlights, branch locator teaser, brand story/about, testimonials/press mentions, journal/blog teaser, newsletter capture, dan info membership — semua dikelola secara dinamis melalui CMS page builder.

| ID | Requirement Specification | Priority |
|---|---|---|
| WEB-001 | Landing page harus tersusun atas blok-blok konten yang dikelola secara CMS (*reorderable & toggleable*). | Must |
| WEB-002 | Semua aset gambar disajikan melalui Cloudflare R2 dengan *responsive `srcset`* dan format modern (AVIF/WebP). | Must |
| WEB-003 | Halaman dirender via SSR/ISR (Next.js) dengan *webhook-driven revalidation* pada saat publikasi CMS. | Must |
| WEB-004 | Branch locator teaser melakukan query ke cabang terdekat berdasarkan koordinat geolokasi pengguna. | Should |
| WEB-005 | Newsletter capture memvalidasi email di client dan server serta melakukan deduplikasi subscriber. | Must |
| WEB-006 | Tombol CTA (*Order Now, Reserve Table, Join Member*) mendukung *deep-linking* ke dalam alur transaksi dengan *context pre-fill*. | Should |
| WEB-007 | Metadata SEO (Title, Description, OG Image, Structured Data JSON-LD) dapat diedit penuh per halaman di CMS. | Must |

**Business Rules:** Tidak diperbolehkan ada *hardcoding* nama cabang, harga, atau promo di frontend. Web harus tetap fungsional dengan *Progressive Enhancement* jika JavaScript mengalami kendala pada konten statis kritis.

---

## 8.2 Customer Portal (`PORT`)

**Tujuan:** Ruang mandiri (*self-service space*) terautentikasi bagi member untuk mengelola riwayat pesanan, reservasi, poin loyalty, metode pembayaran, dan profil pribadi.  
**Fitur Utama:** Order history & reorder, reservation management, loyalty points & tier status, tokenized payment methods (PCI SAQ-A), saved addresses, profile & preferences (dietary flags, marketing consent), dan account security (2FA, active sessions).

| ID | Requirement Specification | Priority |
|---|---|---|
| PORT-001 | Member dapat melihat riwayat pesanan berhalaman dengan status, bukti bayar (*receipt*), dan tombol *Reorder*. | Must |
| PORT-002 | Member dapat melihat/membatalkan/menjadwalkan ulang reservasi dalam *cancellation policy window*. | Must |
| PORT-003 | Member dapat melihat tier loyalty aktif, saldo poin, masa berlaku poin, dan katalog *redeemable rewards*. | Must |
| PORT-004 | Member dapat mengelola metode pembayaran tersimpan melalui *payment-gateway-hosted fields* (tidak ada raw PAN di server). | Must |
| PORT-005 | Member dapat mengaktifkan 2FA (TOTP) serta meninjau dan mencabut sesi/perangkat yang aktif. | Should |
| PORT-006 | Member dapat mengatur persetujuan pemasaran (*marketing consent*) dan preferensi alergen/dietary yang memengaruhi rekomendasi menu. | Should |
| PORT-007 | Permintaan penghapusan akun memicu alur kerja *soft-delete + anonymization* yang patuh regulasi retensi data. | Must |

---

## 8.3 Content Management System (`CMS`)

**Tujuan:** Sistem authoring konten terpusat yang menggerakkan landing site, blog, event, karir, galeri, dan halaman statis/legal dengan alur kerja penerbitan berbasis role.  
**Fitur Utama:** Block-based page builder, draft/preview/publish workflow, versioning & rollback, scheduled publishing, media picker terintegrasi (`MED`), dan multi-locale structure.

| ID | Requirement Specification | Priority |
|---|---|---|
| CMS-001 | Semua tipe konten mendukung status *Draft → In Review → Published → Archived*. | Must |
| CMS-002 | Content editor dapat melakukan pratinjau konten draf melalui *signed preview URL* sebelum dipublikasikan. | Must |
| CMS-003 | Setiap aksi publikasi membuat snapshot versi *immutable*; role berwenang dapat melihat *diff* dan *rollback*. | Should |
| CMS-004 | Mendukung *Scheduled Publishing* via queued job pada *datetime* yang ditentukan. | Should |
| CMS-005 | Rich text editor memvalidasi struktur blok terhadap skema yang diizinkan (*no arbitrary HTML/XSS injection*). | Must |
| CMS-006 | Daftar konten dapat difilter berdasarkan status, penulis, tipe konten, dan rentang tanggal. | Must |

---

## 8.4 Admin Dashboard (`ADM`)

**Tujuan:** Beranda operasional bagi seluruh role internal; shell application yang menyediakan navigasi, *branch context switcher*, pencarian global, dan dasbor ringkasan sesuai role.

| ID | Requirement Specification | Priority |
|---|---|---|
| ADM-001 | Beranda merender *summary widgets* yang relevan per role (contoh: Branch Mgr melihat sales hari ini & low stock; HR melihat pending shift). | Must |
| ADM-002 | Global Branch Switcher menyimpan pilihan di sesi/state dan membatasi (*scope*) seluruh tampilan modul operasional di bawahnya. | Must |
| ADM-003 | Pencarian global (*Global Search*) mencakup pesanan, pelanggan, produk, dan karyawan dengan hasil yang difilter permission. | Should |
| ADM-004 | Lonceng notifikasi (*Notification Bell*) menyajikan peringatan real-time (stok menipis, reservasi baru, payment gagal) via WebSocket/short-poll. | Should |
| ADM-005 | UI Admin Dashboard wajib responsif penuh hingga ukuran tablet untuk penggunaan manajer di lantai toko. | Must |

---

## 8.5 Analytics Dashboard (`ANL`)

**Tujuan:** Pendukung keputusan berbasis data (*data-driven decision support*) lintas domain penjualan, inventaris, CRM, dan SDM, baik di tingkat cabang maupun agregasi antar-cabang.  
**Fitur Utama:** Sales trends, inventory cost & shrinkage trends, customer cohort & retention, staff productivity, exportable charts, dan PostHog integration untuk analisis penggunaan internal tools.

| ID | Requirement Specification | Priority |
|---|---|---|
| ANL-001 | Role Executive/Analyst dapat melihat dasbor perbandingan dan agregasi lintas cabang (*cross-branch comparison*). | Must |
| ANL-002 | Branch Manager melihat metrik penjualan, inventaris, dan staf secara ketat hanya untuk cabang yang ditugaskan kepadanya. | Must |
| ANL-003 | Semua grafik mendukung filter rentang waktu dengan preset (*Today, WTD, MTD, QTD, YTD, Custom Date Range*). | Must |
| ANL-004 | Dasbor dimuat menggunakan *skeleton states* dan *progressive hydration* (tidak ada full-page blocking spinner). | Should |
| ANL-005 | Metrik dasar dihitung melalui scheduled aggregation jobs ke dalam tabel rekapitulasi ter-materialisasi demi efisiensi performa. | Must |

---

## 8.6 Reservation System (`RES`)

**Tujuan:** Memungkinkan pelanggan melakukan pemesanan meja di awal dan staf mengelola kalender reservasi serta kebijakan *no-show/cancellation*.

| ID | Requirement Specification | Priority |
|---|---|---|
| RES-001 | Pelanggan dapat mencari ketersediaan meja berdasarkan cabang, tanggal, waktu, dan jumlah tamu (*party size*). | Must |
| RES-002 | Sistem mencegah *double-booking* melalui mekanisme *table-hold* dengan durasi kedaluwarsa (e.g., 10 menit menunggu konfirmasi). | Must |
| RES-003 | Konfirmasi reservasi memicu pengiriman email (Resend) dan notifikasi in-app. | Must |
| RES-004 | Kebijakan pembatalan (*cancellation window* dan *no-show fee*) dapat dikonfigurasi via Admin/CMS per cabang. | Should |
| RES-005 | Staf dapat meninjau *reservation timeline / floor view* harian serta melakukan *seat/no-show/cancel* secara manual. | Must |
| RES-006 | Mendukung *Waitlist Mode* apabila seluruh slot penuh, dengan notifikasi otomatis saat ada meja kosong. | Could |

---

## 8.7 Table Management (`TBL`)

**Tujuan:** Merepresentasikan denah lantai fisik (*floor plan*) dan status meja secara real-time untuk alur kerja reservasi maupun walk-in / POS / QR Ordering.

| ID | Requirement Specification | Priority |
|---|---|---|
| TBL-001 | Admin dapat mendefinisikan denah lantai visual per cabang (meja dengan posisi, kapasitas, dan zona/ruangan). | Must |
| TBL-002 | Setiap meja memiliki status real-time: *Available, Reserved, Occupied, Needs Cleaning, Out of Service*. | Must |
| TBL-003 | Sistem menghasilkan kode QR unik per meja yang mengodekan *signed table-code URL* untuk pemesanan di meja (`QRO`). | Must |
| TBL-004 | Perubahan status meja disebarkan secara live ke POS dan Admin floor view via WebSocket. | Should |

---

## 8.8 Online Ordering (`ORD`)

**Tujuan:** Pemesanan berbasis web untuk *pickup / dine-in ahead*, terpisah dari ketergantungan pada satu terminal POS fisik di cabang.

| ID | Requirement Specification | Priority |
|---|---|---|
| ORD-001 | Pelanggan wajib memilih cabang di awal (atau dideteksi via geolokasi/riwayat) sebelum menambah item ke keranjang. | Must |
| ORD-002 | Keranjang belanja (*Cart*) disimpan secara persisten di server untuk member dan di local storage untuk guest. | Must |
| ORD-003 | Mendukung alur *Guest Checkout* maupun *Authenticated Checkout* dengan pre-fill data tersimpan. | Must |
| ORD-004 | Pengiriman pesanan bersifat **idempoten** menggunakan *client-generated idempotency key* untuk mencegah duplikasi tagihan. | Must |
| ORD-005 | Pada konfirmasi pembayaran, event pesanan memicu: pembuatan tiket KDS, pemotongan stok bahan, penambahan poin, dan email bukti bayar. | Must |
| ORD-006 | Pelanggan dapat melacak status pesanan secara real-time (*Received → Preparing → Ready → Completed*). | Must |
| ORD-007 | Kustomisasi item (ukuran, jenis susu, extra shot, catatan) dimodelkan sebagai *structured modifier groups*, bukan free text. | Must |

---

## 8.9 QR At-Table Ordering (`QRO`)

**Tujuan:** Pemesanan mandiri oleh pelanggan langsung di meja melalui pemindaian kode QR, terikat pada konteks cabang dan meja yang relevan.

| ID | Requirement Specification | Priority |
|---|---|---|
| QRO-001 | Memindai QR meja akan menyelesaikan (*resolve*) *signed table-code* menjadi konteks cabang + meja tanpa pemilihan manual. | Must |
| QRO-002 | Alur QR Ordering menggunakan ulang mesin keranjang & checkout `ORD` dengan parameter `order_channel = qr` dan `table_id`. | Must |
| QRO-003 | Metode bayar QR Ordering dapat dikonfigurasi per cabang: *Pay-Now (digital payment)* atau *Pay-at-Counter (buka tab)*. | Should |
| QRO-004 | Mendukung *split-cart* atau pesanan multi-tamu pada satu meja yang sama sesuai konfigurasi cabang. | Could |

---

## 8.10 Point of Sale — POS (`POS`)

**Tujuan:** Terminal transaksi yang dioperasikan oleh kasir di toko untuk pesanan walk-in dan counter, terintegrasi penuh dengan mesin inventaris, pesanan, dan loyalty yang sama dengan saluran digital.

| ID | Requirement Specification | Priority |
|---|---|---|
| POS-001 | UI POS dioptimalkan untuk entri cepat dengan target sentuh besar (*large-touch-target*), tab kategori, dan *modifier quick-select*. | Must |
| POS-002 | **Offline-First Resilience:** POS **wajib dapat berfungsi offline** dalam jendela waktu tertentu menggunakan *local IndexedDB queue* dan menyinkronkan transaksi saat koneksi kembali terhubung (*sync-on-reconnect*) dengan memvalidasi stok di server. | Must |
| POS-003 | POS mendukung pembayaran terpisah (*Split Payment* multi-tender dalam satu order) dan pemisahan tagihan (*Split Bill*). | Should |
| POS-004 | Kasir dapat mencari profil member berdasarkan nomor telepon atau scan QR untuk menerapkan poin loyalty/diskon tier di checkout. | Must |
| POS-005 | Transaksi POS diposting ke tabel `orders` yang sama dengan pesanan online/QR, ditandai dengan `order_channel = pos`. | Must |
| POS-006 | Mendukung laporan rekonsiliasi kasir akhir shift (*expected vs. counted cash drawer*). | Must |

---

## 8.11 Kitchen Display System — KDS (`KDS`)

**Tujuan:** Layar tiket digital real-time menggantikan kertas nota dapur (*docket*), mengoordinasikan urutan dan waktu penyiapan pesanan.

| ID | Requirement Specification | Priority |
|---|---|---|
| KDS-001 | Pesanan yang sudah dibayar (dari POS, Online, QR) menghasilkan tiket KDS secara real-time via WebSocket (dengan polling fallback). | Must |
| KDS-002 | Tiket menampilkan item, *modifier*, catatan khusus, saluran pesanan, dan durasi waktu sejak pemesanan dengan indikator warna penuaan (*aging threshold*). | Must |
| KDS-003 | Staf dapur dapat mengubah status item/tiket menjadi *In Progress, Ready*, atau *Recalled* (kembali ke antrean). | Must |
| KDS-004 | *Multi-station routing*: item dapat diarahkan ke pos persiapan tertentu (misalnya Bar Espresso vs. Dapur Pastry) sesuai konfigurasi menu. | Should |
| KDS-005 | **Local Network Buffering:** KDS **wajib dapat beroperasi pada jaringan lokal toko** dengan *graceful degradation (local buffering)* apabila koneksi internet luar terputus sementara. | Must |
| KDS-006 | Waktu penyelesaian tiket dicatat dan diumpankan ke dalam metrik analitik durasi pelayanan (`ANL`). | Should |

---

## 8.12 Menu Management (`MNU`)

**Tujuan:** Katalog sentral item yang dijual, kategori, *modifier*, harga, serta ketersediaan per saluran dan per cabang.

| ID | Requirement Specification | Priority |
|---|---|---|
| MNU-001 | Item menu diatur dalam hierarki: *Categories > Items > Modifier Groups > Modifiers*, semuanya dikelola di Admin. | Must |
| MNU-002 | Ketersediaan item dan harga dapat di-*override* per cabang dan per saluran (contoh: harga dine-in vs. harga aplikasi delivery). | Must |
| MNU-003 | Item dapat dinonaktifkan sementara (*86'd status*) secara real-time di satu cabang tertentu (misal bahan habis), langsung menyembunyikannya dari channel pesanan di cabang tersebut. | Must |
| MNU-004 | Item mendukung metadata kaya: alergen, tag diet (*vegan, dairy-free*), informasi nutrisi, dan galeri gambar. | Must |
| MNU-005 | Setiap item menu terhubung tepat pada satu Resep aktif (`RCP`) untuk keperluan pembiayaan (*costing*) dan deduksi stok otomatis. | Must |
| MNU-006 | Mendukung ketersediaan menu berdasarkan jadwal/jendela waktu (misalnya menu sarapan 06.00 – 11.00). | Should |
| MNU-007 | Alat pembaruan harga massal (*bulk price update*) dengan pratinjau perubahan dan pencatatan audit log. | Should |

---

## 8.13 Recipe Management & COGS Costing (`RCP`)

**Tujuan:** Mendefinisikan daftar bahan baku (*Bill-of-Materials*) untuk setiap item menu guna menggerakkan pemotongan stok otomatis dan perhitungan harga pokok penjualan (COGS) yang akurat.

| ID | Requirement Specification | Priority |
|---|---|---|
| RCP-001 | Sebuah Resep mendefinisikan baris bahan: item inventaris (SKU), kuantitas, satuan ukur, dan variasi kuantitas per *modifier*. | Must |
| RCP-002 | Perubahan resep memiliki sistem versi (*versioned*); pesanan historis merujuk pada versi resep yang aktif saat transaksi terjadi. | Must |
| RCP-003 | **Recipe Costing Engine:** Menghitung COGS per item secara otomatis berdasarkan akumulasi harga rata-rata bahan baku (`weighted-average cost`), diperbarui otomatis saat harga bahan berubah. | Must |
| RCP-004 | Laporan margin per item (`Price - COGS`) disajikan secara transparan di dalam modul Menu Management dan Analytics. | Should |
| RCP-005 | Resep mendukung *Sub-Recipes / Prep Components* (misalnya *House Cold Brew Concentrate* sebagai bahan setengah jadi yang digunakan pada beberapa menu akhir). | Should |

---

## 8.14 Inventory Management (`INV`)

**Tujuan:** Pelacakan stok multi-cabang dan multi-kategori secara real-time dengan pemotongan otomatis berbasis resep dan jejak audit penuh.  
**Kategori Item:** Raw Materials, Coffee Beans, Milk, Syrup, Tea, Kitchen Ingredients, Packaging, Equipment.

| ID | Requirement Specification | Priority |
|---|---|---|
| INV-001 | Setiap item inventaris adalah SKU dengan kategori, satuan ukur (*unit of measure*), *reorder point, reorder quantity*, dan supplier default. | Must |
| INV-002 | Saldo stok dilacak **secara ketat per lokasi cabang / gudang**, tidak pernah sebagai satu angka global tunggal. | Must |
| INV-003 | **Automatic Recipe Deduction:** Pesanan yang terbayar memicu pemotongan stok otomatis sesuai resep aktif (`RCP`), dieksekusi di dalam transaksi database yang sama dengan finalisasi pesanan untuk mencegah *stock drift*. | Must |
| INV-004 | Penyesuaian stok manual (*Stock Adjustment*) wajib menyertakan kode alasan (*waste, spillage, staff drink, correction*) dan dicatat bersama aktor serta timestamp. | Must |
| INV-005 | Alur kerja *Stock Opname (Cycle Count)*: generate count sheet → staf memasukkan hitungan fisik → sistem menghitung varians → varians disetujui memposting penyesuaian. | Must |
| INV-006 | **Batch Tracking:** Penerimaan barang dicatat sebagai *Batch* dengan tanggal terima, supplier, harga beli, dan tanggal kedaluwarsa; pemotongan stok mengikuti prinsip **FEFO (First-Expired-First-Out)**. | Must |
| INV-007 | **Expiration Tracking:** Dasbor dan notifikasi memunculkan peringatan untuk item inventaris yang mendekati tanggal kedaluwarsa sesuai ambang batas (e.g., 7 hari sebelum expired). | Must |
| INV-008 | Mendukung pemindaian barcode/QR pada item inventaris menggunakan kamera perangkat web untuk penerimaan dan hitung stok. | Should |
| INV-009 | Peringatan stok menipis (*Low-Stock Alert*) dikirimkan via Notification Center kepada Inventory Officer/Branch Mgr saat stok turun di bawah *reorder point*. | Must |
| INV-010 | **Stock Movement Ledger:** Buku besar mutasi stok yang *immutable append-only* (penerimaan, pemotongan, adjustment, transfer) menjadi sumber data pasti untuk seluruh laporan inventaris. | Must |
| INV-011 | Mendukung alur kerja transfer stok antar-cabang atau antar-gudang (*request → approve → dispatch → receive*). | Should |

---

## 8.15 Warehouse Management (`WHS`)

**Tujuan:** Mendukung gudang distribusi sentral/regional yang memasok beberapa cabang fisik.

| ID | Requirement Specification | Priority |
|---|---|---|
| WHS-001 | Gudang (*Warehouse*) adalah entitas lokasi terpisah dari cabang yang dapat menampung stok dan menjadi sumber *Stock Transfer*. | Must |
| WHS-002 | Pengisian ulang stok gudang-ke-cabang dapat dilakukan secara manual atau *rule-based* berdasarkan *low-stock alert* cabang. | Should |
| WHS-003 | Alur penerimaan barang di gudang direkonsiliasi terhadap dokumen Purchase Order terbuka (`PUR`). | Must |
| WHS-004 | Pelaporan stok gudang digabungkan ke dalam dasbor analitik inventaris dengan dimensi filter lokasi. | Must |

---

## 8.16 Supplier Management (`SUP`)

**Tujuan:** Memelihara direktori data pemasok, ketentuan kontrak, harga item, dan riwayat performa supplier.

| ID | Requirement Specification | Priority |
|---|---|---|
| SUP-001 | Rekord supplier memuat info kontak, syarat pembayaran (*terms*), waktu tunggu pengiriman (*lead time*), dan daftar SKU yang dipasok beserta harga kontrak. | Must |
| SUP-002 | Metrik performa supplier (*on-time delivery rate, quality rejection rate*) dihitung dari riwayat Purchase Order / penerimaan barang. | Should |
| SUP-003 | Satu SKU inventaris dapat dihubungkan ke beberapa supplier dengan peringkat prioritas (*preferred vs. backup supplier*). | Should |

---

## 8.17 Purchase Management (`PUR`)

**Tujuan:** Alur kerja pengadaan barang (*procurement*) dari pengajuan hingga penerimaan dan rekonsiliasi biaya.

| ID | Requirement Specification | Priority |
|---|---|---|
| PUR-001 | Alur status Purchase Order (PO): *Draft → Submitted → Approved → Sent to Supplier → Partially Received → Fully Received → Closed*. | Must |
| PUR-002 | Persetujuan PO memerlukan *role-based sign-off* (maker-checker) apabila total nilai melebihi ambang batas yang dikonfigurasi. | Must |
| PUR-003 | Penerimaan barang atas PO menghasilkan *Inventory Batches* (`INV-006`) dan merekonsiliasi varians jumlah serta harga beli terhadap PO. | Must |
| PUR-004 | Sistem dapat menghasilkan *Suggested PO* secara otomatis dari *low-stock alert*, terisi dengan supplier utama dan harga terakhir. | Should |
| PUR-005 | Riwayat PO dan tren perubahan harga beli per SKU/supplier diumpankan ke dalam modul Analytics. | Should |

---

## 8.18 Promotion Management (`PRO`)

**Tujuan:** Mengonfigurasi dan menjadwalkan diskon, paket bundle, dan kampanye pemasaran lintas saluran.

| ID | Requirement Specification | Priority |
|---|---|---|
| PRO-001 | Tipe promosi yang didukung: persentase diskon, potongan nominal tetap, BOGO (*Buy One Get One*), harga bundle, dan gratis item dengan minimal belanja. | Must |
| PRO-002 | Promosi dapat dibatasi per cabang, per saluran (*POS/Online/QR*), rentang tanggal/jam, dan segmen pelanggan (e.g., member-only). | Must |
| PRO-003 | Mendukung input kode promo di checkout digital serta diskon yang diterapkan kasir di POS dengan log alasan. | Must |
| PRO-004 | Promosi divalidasi secara ketat di sisi server saat finalisasi pesanan (sistem tidak mempercayai diskon yang dihitung client). | Must |
| PRO-005 | Analitik penggunaan promo (jumlah klaim & dampak terhadap pendapatan) disajikan pada dasbor Analytics. | Should |

---

## 8.19 Membership & Loyalty (`LOY`)

**Tujuan:** Memberikan penghargaan kepada pelanggan setia dan menyatukan identitas pelanggan lintas saluran.

| ID | Requirement Specification | Priority |
|---|---|---|
| LOY-001 | Member mendapatkan poin dari setiap nominal belanja yang memenuhi syarat (rasio dapat dikonfigurasi), seragam di saluran POS, Online, dan QR. | Must |
| LOY-002 | Keanggotaan berjenjang (*Silver, Gold, Platinum*) dengan ambang batas pencapaian dan keuntungan eksklusif per tier. | Should |
| LOY-003 | Penukaran poin (*redemption*) di checkout (POS dan digital) divalidasi di server berdasarkan saldo poin yang tersedia. | Must |
| LOY-004 | Kebijakan masa berlaku poin (e.g., 12 bulan bergulir) dapat dikonfigurasi dengan pengiriman email peringatan sebelum kedaluwarsa. | Should |
| LOY-005 | Program referral: kode referral member dilacak untuk memberikan hadiah kepada pengundang dan yang diundang pada pembelian pertama. | Could |

---

## 8.20 Customer Relationship Management — CRM (`CRM`)

**Tujuan:** Satu pandangan terpadu (*Unified Customer 360 View*) atas setiap pelanggan di seluruh pesanan, reservasi, poin loyalty, dan interaksi layanan pelanggan.

| ID | Requirement Specification | Priority |
|---|---|---|
| CRM-001 | Customer 360 Profile mengagregasikan riwayat pesanan, riwayat reservasi, tier loyalty, dan catatan tiket layanan pada satu layar. | Must |
| CRM-002 | Staf *Customer Support / CRM Officer* dapat mencatat *support notes / interaction logs* pada profil pelanggan. | Must |
| CRM-003 | Fitur *Customer Segmentation Builder* (berdasarkan total pembelanjaan, frekuensi, tier, lokasi cabang) untuk sasaran promo & notifikasi. | Should |
| CRM-004 | Alat deteksi dan penggabungan profil pelanggan ganda (*duplicate profile detection/merge* by email/phone). | Should |
| CRM-005 | Alur ekspor dan penghapusan data pelanggan mendukung kepatuhan regulasi privasi (*Data Subject Access / Erasure Request*). | Must |

---

## 8.21 Multi-Branch Management (`BRN`)

**Tujuan:** Mengelola jaringan lokasi fisik toko sebagai entitas utama yang mengatur pengelompokan dan pembatasan operasional.

| ID | Requirement Specification | Priority |
|---|---|---|
| BRN-001 | Rekord cabang memuat alamat/koordinat peta, jam operasional, zona waktu, mata uang, info kontak, dan status (*Active/Coming Soon/Closed*). | Must |
| BRN-002 | Mendukung *override* konfigurasi tingkat cabang untuk ketersediaan menu, harga, promosi, dan kebijakan reservasi (`MNU-002`). | Must |
| BRN-003 | Alur *Branch Onboarding Checklist* (buat cabang → assign staf → setup menu → setup meja → go live) demi mencapai KPI onboarding < 1 hari kerja. | Should |
| BRN-004 | Perubahan status cabang (misalnya penutupan sementara) langsung tercermin di locator web, pemilihan saluran pemesanan, dan reservasi. | Must |

---

## 8.22 Employee Management (`HR`)

**Tujuan:** Administrasi SDM inti: identitas karyawan, penugasan role, dan penjadwalan shift kerja antar-cabang.

| ID | Requirement Specification | Priority |
|---|---|---|
| HR-001 | Rekord karyawan memuat info pribadi, status kepegawaian, cabang yang ditugaskan, dan *system role(s)* RBAC yang dialokasikan (`07`). | Must |
| HR-002 | Kalender penjadwalan shift per cabang dengan assignment *drag-and-drop* dan deteksi konflik (jadwal shift bertumpuk). | Should |
| HR-003 | Pencatatan kehadiran / *clock-in clock-out* sederhana (timestamp dan lokasi cabang) yang menghasilkan data ekspor untuk integrasi payroll masa depan (`§21`). | Should |
| HR-004 | Alur *offboarding* karyawan menonaktifkan akses sistem dan mengarsipkan referensi audit trail tanpa menghapus riwayat historis. | Must |

---

## 8.23 Blog / Journal (`BLG`)

**Tujuan:** Permukaan konten editorial untuk penceritaan brand, edukasi kopi, dan optimasi SEO organic.

| ID | Requirement Specification | Priority |
|---|---|---|
| BLG-001 | Artikel blog mendukung taksonomi kategori/tag, gambar utama, atribusi penulis, dan rekomendasi artikel terkait. | Must |
| BLG-002 | Tunduk pada alur kerja CMS penuh (`CMS-001`): *Draft/Review/Publish/Archive* dengan penjadwalan. | Must |
| BLG-003 | Indeks blog publik mendukung paginasi, filter kategori, dan pencarian kata kunci. | Should |
| BLG-004 | JSON-LD Structured Data (*Article schema*) disisipkan secara otomatis untuk keperluan indeksasi SEO mesin pencari. | Should |

---

## 8.24 Events (`EVT`)

**Tujuan:** Mempromosikan dan mengelola acara brand (sesi *coffee cupping*, peluncuran produk, *in-store activation*).

| ID | Requirement Specification | Priority |
|---|---|---|
| EVT-001 | Rekord event memuat tanggal/waktu, lokasi/cabang, kapasitas maksimal, gambar cover, dan deskripsi acara. | Must |
| EVT-002 | Mendukung registrasi / RSVP online (nama, email, jumlah tamu) dengan penegakan batas kapasitas. | Should |
| EVT-003 | Acara yang telah lewat secara otomatis diarsipkan berdasarkan *end datetime*. | Should |

---

## 8.25 Career Portal (`CAR`)

**Tujuan:** Menerbitkan lowongan pekerjaan dan menampung lamaran kandidat secara terpusat.

| ID | Requirement Specification | Priority |
|---|---|---|
| CAR-001 | Lowongan kerja memuat judul, lokasi/cabang, tipe pekerjaan, deskripsi, dan persyaratan, dikelola via CMS. | Must |
| CAR-002 | Formulir lamaran kandidat menangkap unggahan resume (disimpan di Cloudflare R2), info kontak, dan surat lamaran. | Must |
| CAR-003 | Tampilan internal HR menampilkan daftar pelamar per lowongan dengan status pipeline (*New/Reviewed/Interview/Offer/Rejected*). | Should |

---

## 8.26 Gallery (`GAL`)

**Tujuan:** Etalase visual terkurasi untuk interior cabang, produk musiman, dan momen estetis brand.

| ID | Requirement Specification | Priority |
|---|---|---|
| GAL-001 | Item galeri diorganisasikan ke dalam album atau kategori visual (e.g., *Interiors, Seasonal Brews, Community*). | Must |
| GAL-002 | Mendukung tampilan *Lightbox* dengan navigasi keyboard di desktop dan *touch-swipe* di perangkat mobile. | Must |
| GAL-003 | Semua aset galeri dipilih dari Media Library (`MED`), tidak diunggah secara *ad-hoc* di luar pustaka resmi. | Must |

---

## 8.27 Media Library (`MED`)

**Tujuan:** Manajemen aset digital (*Digital Asset Management*) terpusat untuk semua gambar dan dokumen di seluruh modul CMS.

| ID | Requirement Specification | Priority |
|---|---|---|
| MED-001 | Semua unggahan disimpan di Cloudflare R2 dengan pembuatan varian ukuran otomatis (*thumbnail, medium, large, WebP/AVIF*). | Must |
| MED-002 | Aset ditandai dengan metadata: *alt text* (wajib diisi demi kepatuhan aksesibilitas WCAG), tag, dan riwayat lokasi penggunaan. | Must |
| MED-003 | Komponen *Asset Picker* digunakan ulang secara konsisten pada modul Menu, Blog, Event, Karir, dan Galeri. | Must |
| MED-004 | Dasbor penggunaan kapasitas penyimpanan dan deteksi aset yatim (*orphaned assets* yang tidak direferensikan oleh konten apa pun). | Could |

---

## 8.28 Notification Center (`NOT`)

**Tujuan:** Pusat dispatch dan kotak masuk in-app untuk notifikasi transaksional dan operasional via email dan in-app (siap push notification untuk mobile app masa depan).

| ID | Requirement Specification | Priority |
|---|---|---|
| NOT-001 | Template notifikasi (order confirmation, reservation alert, low-stock warning, PO approval request) dapat diedit di Admin beserta *merge-field variables*. | Must |
| NOT-002 | Setiap pengiriman notifikasi diproses melalui *queued job* (non-blocking) agar tidak menghambat respons API kepada pengguna. | Must |
| NOT-003 | Kotak masuk notifikasi in-app pada Admin & Portal dengan status *read/unread* per pengguna. | Should |
| NOT-004 | Pelacakan status pengiriman email (*sent/delivered/bounced/failed*) melalui Resend webhooks. | Should |
| NOT-005 | Kontrol preferensi notifikasi oleh pengguna dan admin untuk memilih kategori pesan yang ingin diterima per saluran. | Should |

---

## 8.29 Reports (`REP`)

**Tujuan:** Pelaporan operasional dan finansial terstruktur serta dapat diekspor, melengkapi dasbor interaktif `ANL`.

| ID | Requirement Specification | Priority |
|---|---|---|
| REP-001 | Pustaka laporan standar: *Sales Summary, Inventory Valuation, Stock Movements, PO History, Shift Summary, Loyalty Redemptions, Promo Performance*. | Must |
| REP-002 | Ekspor laporan ke dalam format CSV dan PDF, dihasilkan melalui *async queued job* untuk dataset besar dengan notifikasi unduhan saat siap. | Must |
| REP-003 | Parameter laporan (pilihan cabang, rentang tanggal, kategori) dapat disimpan sebagai preset yang dapat digunakan kembali per pengguna. | Could |
| REP-004 | Pengiriman laporan terjadwal otomatis via email (e.g., laporan rekapitulasi harian dikirim ke Branch Manager setiap pagi). | Should |

---

## 8.30 Audit Logs (`AUD`)

**Tujuan:** Catatan rekam jejak yang *immutable* atas seluruh tindakan kritis dan sensitif demi kepatuhan audit dan investigasi masalah.

| ID | Requirement Specification | Priority |
|---|---|---|
| AUD-001 | Setiap operasi *create/update/delete* pada resource sensitif (pesanan, penyesuaian stok, perubahan harga, RBAC, data karyawan) dicatat bersama aktor, timestamp, IP, dan *before/after JSON diff*. | Must |
| AUD-002 | Audit log bersifat **append-only** di application layer (tidak ada endpoint pengubahan atau penghapusan audit log). | Must |
| AUD-003 | Antarmuka penjelajah audit log mendukung filter berdasarkan aktor, tipe resource, rentang tanggal, dan cabang. | Must |
| AUD-004 | Rekord audit disimpan sesuai kebijakan retensi data (`§16.7`), diarsipkan dan tidak dihapus paksa bila diwajibkan regulasi. | Must |

---

## 8.31 Settings (`SET`)

**Tujuan:** Permukaan konfigurasi tingkat platform dan tingkat cabang untuk administrator sistem.

| ID | Requirement Specification | Priority |
|---|---|---|
| SET-001 | Antarmuka manajemen Roles & Permissions (`07`) dengan kemampuan membuat *custom roles* di luar role bawaan sistem. | Must |
| SET-002 | Pengaturan Integrasi: manajemen API keys dan kredo untuk Google Maps, Resend, Payment Gateway, GA4/PostHog, dan adapter masa depan. | Must |
| SET-003 | Pengaturan Branding: token tema warna (dalam batasan sistem desain), aset logo, dan metadata SEO default platform (`§7.4`). | Must |
| SET-004 | Manajemen API Keys untuk mitra integrasi pihak ketiga dengan alokasi scope dan fitur pencabutan (*revocation*). | Must |
| SET-005 | Konfigurasi sistem global: mata uang default, daftar bahasa yang diaktifkan (*supported locales*), dan aturan pajak/tax rate per cabang. | Must |

---

## 8.32 REST API & OpenAPI Contract (`API`)

**Tujuan:** Kontrak REST versi resmi yang mendasari seluruh modul di atas serta semua aplikasi klien saat ini maupun masa depan (`05` & PRD §12).

| ID | Requirement Specification | Priority |
|---|---|---|
| API-001 | Seluruh endpoint API didokumentasikan melalui spesifikasi **OpenAPI 3.x**, dan dijaga konsistensinya melalui *automated contract tests*. | Must |
| API-002 | API memiliki versioning pada tingkat URI (`/api/v1`); *breaking changes* wajib diterbitkan di bawah versi baru (`/api/v2`). | Must |
| API-003 | Penegakan *Rate Limiting* per klien/IP yang dapat dikonfigurasi per kelompok endpoint (e.g., read publik vs. write terautentikasi). | Must |
| API-004 | Mitra integrasi pihak ketiga berautentikasi menggunakan *scoped API keys* atau *OAuth2 client-credentials*, terpisah dari JWT user. | Must |
| API-005 | Kerangka kerja Webhook untuk event keluar (*order.paid, reservation.confirmed, stock.low*) guna mendukung integrasi eksternal. | Should |

---

**Document Status:** ✅ Synchronized & Complete  
**Next Document:** [09-user-flows.md](./09-user-flows.md)  
**Related:** [prd.md Section 9](./prd.md), [07-roles-dan-permissions.md](./07-roles-dan-permissions.md)
