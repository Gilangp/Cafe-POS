# 07. ROADMAP PENGEMBANGAN & STRATEGI TESTING

## 38. DEVELOPMENT ROADMAP

| Fase | Durasi Estimasi | Cakupan |
|---|---|---|
| **Fase 1 — Foundation** | 2 Minggu | Setup arsitektur Frontend & Backend, Database schema, Autentikasi & RBAC, Design System dasar |
| **Fase 2 — Landing Page & CMS** | 3 Minggu | Landing Page dinamis seluruh section, CMS untuk seluruh konten publik, Upload media |
| **Fase 3 — Menu & Reservasi** | 2 Minggu | Modul Menu, Kategori, Digital Menu publik, Modul Reservasi (form & manajemen status) |
| **Fase 4 — POS, Transaksi & Kitchen Display** | 3 Minggu | Modul POS lengkap, cetak struk, riwayat transaksi, dashboard kasir, Kitchen Display System (KDS) untuk Dapur/Barista |
| **Fase 5 — Inventory** | 2 Minggu | Modul inventory, mutasi stok otomatis dari POS, notifikasi stok menipis |
| **Fase 6 — Artikel, Galeri, Promo** | 2 Minggu | CMS Artikel dengan WYSIWYG & SEO, Galeri, Promo |
| **Fase 7 — Dashboard & Laporan** | 2 Minggu | Dashboard Admin & Owner, Grafik penjualan, Ekspor laporan PDF/Excel |
| **Fase 8 — Pengaturan, Backup, Manajemen User** | 1 Minggu | Pengaturan website, Backup/Restore, Manajemen User & Audit Log |
| **Fase 9 — PWA & Optimasi** | 1 Minggu | Implementasi PWA (offline mode, cache), optimasi performa & SEO |
| **Fase 10 — QA & UAT** | 2 Minggu | Pengujian menyeluruh (fungsional, non-fungsional), User Acceptance Test bersama Owner |

**Total Estimasi Waktu Pengembangan: ± 20 Minggu (5 Bulan)**

```mermaid
gantt
    title Roadmap Pengembangan NEMU Space
    dateFormat  YYYY-MM-DD
    section Fase 1-3
    Foundation           :f1, 2026-08-03, 14d
    Landing Page & CMS   :f2, after f1, 21d
    Menu & Reservasi     :f3, after f2, 14d
    section Fase 4-6
    POS & Transaksi      :f4, after f3, 21d
    Inventory            :f5, after f4, 14d
    Artikel Galeri Promo :f6, after f5, 14d
    section Fase 7-10
    Dashboard & Laporan  :f7, after f6, 14d
    Pengaturan & Backup  :f8, after f7, 7d
    PWA & Optimasi       :f9, after f8, 7d
    QA & UAT             :f10, after f9, 14d
```

---

## 39. TESTING STRATEGY

> **Dokumen lengkap:** [`08_testing_specification.md`](./08_testing_specification.md) — ketentuan testing, matriks modul, critical paths (CP-01…CP-20), automated vs manual, backlog, dan cara menjalankan.  
> **Docs vs kode:** arsitektur path & API diselaraskan di `02`, `05`; gap RBAC (void/KDS) tercatat di `03` §25.1 dan `05` §28.9 — diperbaiki di kode lalu ditutup tes §12.1 di `08`.

### 39.1 Jenis Pengujian

| Jenis Pengujian | Otomatis? | Cakupan | Tools |
|---|---|---|---|
| Unit Testing | **Ya** | Logic bisnis BE + store/util FE (cart, total, stok, queue) | PHPUnit, Vitest |
| Integration / Feature API | **Ya** | Alur antar modul + endpoint (POS→stok, auth, RBAC) | PHPUnit + DB Testing |
| API Collection (opsional) | **Ya** | Smoke staging request/response | Postman/Newman |
| Component Testing | **Ya** | Komponen UI React kritis (POS, form, KDS) | Vitest + React Testing Library |
| End-to-End Testing | **Ya (P0)** | Skenario penuh (login, reservasi, POS, KDS) | Playwright |
| Responsive Testing | Semi | Breakpoint & perangkat | Chrome DevTools, BrowserStack |
| Accessibility Testing | Semi | Kontras, keyboard, screen reader | Lighthouse, axe |
| Performance Testing | Semi | Core Web Vitals, latency POS | Lighthouse, WebPageTest |
| Security Testing | Semi | Validasi input, RBAC, XSS/SQLi | OWASP ZAP, manual |
| User Acceptance Testing (UAT) | Manual | Validasi Owner & ops coffee shop | Checklist Bab 40 + `08` §7 |

### 39.2 Strategi Regresi

Setiap penambahan fitur baru wajib disertai regression testing terhadap modul yang saling terintegrasi, khususnya alur **POS → Inventory → Laporan** dan **POS → KDS**. Critical path P0 (CP-01…CP-08) wajib hijau sebelum rilis — detail di `08_testing_specification.md` §5.

### 39.3 Automated Testing (ringkas)

| Layer | Perintah | Lokasi |
|---|---|---|
| Frontend unit/component | `cd frontend && npm test` | `frontend/tests/` |
| Backend feature/unit | `cd backend && php vendor/bin/phpunit` | `backend/tests/` |
| E2E (target) | `npx playwright test` | `e2e/` (belum dipasang) |

**Wajib otomatis:** Unit, Component kritis, Feature API, E2E alur P0.  
**Manual/semi:** UAT, printer struk, PWA visual, security dalam, pixel UI.

---

## 40. ACCEPTANCE CRITERIA

### 40.1 Kriteria Umum

1. Seluruh konten pada website (teks, gambar, harga, promo, dsb.) berhasil ditampilkan secara dinamis dari database — **tidak ditemukan satupun konten hardcoded** pada frontend.
2. Seluruh role (Pelanggan, Kasir, Admin, Owner) hanya dapat mengakses fitur sesuai matriks permission pada Bab 25 — pengujian mencoba akses lintas role harus menghasilkan `403 Forbidden`.
3. Website dapat diakses tanpa horizontal scrolling pada seluruh breakpoint (mobile, tablet, laptop, desktop).
4. Website berhasil diinstal sebagai PWA dan dapat menampilkan Landing Page, Menu, dan Gambar dalam kondisi offline.
5. Dark Mode dan Light Mode berfungsi konsisten di seluruh halaman tanpa elemen yang "pecah" secara visual.

### 40.2 Kriteria per Modul

| Modul | Kriteria Diterima |
|---|---|
| Landing Page | Seluruh section dapat diaktifkan/nonaktifkan dari CMS dan perubahan langsung tampil tanpa deploy ulang |
| Menu | Admin dapat menambah menu baru lengkap dengan gambar, dan menu langsung tampil di halaman publik dan POS dalam waktu < 5 detik setelah disimpan |
| Reservasi | Pelanggan dapat mengirim reservasi tanpa login, dan Admin dapat mengubah status reservasi dengan notifikasi status yang dapat dicek pelanggan |
| POS | Kasir dapat menyelesaikan satu transaksi penuh (pilih menu → keranjang → diskon → bayar → cetak struk) dalam waktu kurang dari 1 menit untuk transaksi sederhana |
| Kitchen Display | Tiket pesanan otomatis muncul di Kitchen Display maksimal 5 detik setelah transaksi POS selesai dibayar, dan status "Siap" tersinkron ke Dashboard Kasir tanpa refresh manual (lihat Bab 41.8) |
| Inventory | Stok otomatis berkurang setelah transaksi POS (jika data resep tersedia), dan notifikasi stok menipis muncul di Dashboard Admin/Owner ketika stok ≤ minimum |
| Dashboard Owner | Grafik penjualan menampilkan data akurat sesuai filter periode yang dipilih (harian/mingguan/bulanan) |
| Laporan | Laporan dapat diekspor dalam format PDF dan Excel dengan data yang sesuai dengan filter tanggal yang dipilih |
| Pengaturan | Perubahan pada Pengaturan Website (logo, kontak, jam operasional) langsung tercermin di Landing Page dan Footer |
| Backup/Restore | Owner dapat melakukan backup data dan memulihkan (restore) data dari file backup tanpa kehilangan integritas data |
| Keamanan | Seluruh endpoint privat menolak akses tanpa token valid (`401 Unauthorized`), dan seluruh input tervalidasi (`422` untuk data tidak valid) |

### 40.3 Definisi "Selesai" (Definition of Done)

Sebuah fitur dinyatakan **selesai** apabila memenuhi seluruh kriteria berikut:

- [ ] Kode telah melalui code review dan sesuai standar penulisan (ESLint/PSR-12)
- [ ] Unit test dan/atau integration test terkait telah dibuat dan lulus
- [ ] Fitur telah diuji pada seluruh breakpoint responsif
- [ ] Fitur telah diuji sesuai matriks Role & Permission
- [ ] Dokumentasi API (jika ada endpoint baru) telah diperbarui
- [ ] Fitur telah disetujui melalui User Acceptance Testing oleh Owner/perwakilan tim operasional
