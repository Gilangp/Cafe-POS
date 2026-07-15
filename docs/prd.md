# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Ekosistem Sistem & Manajemen Coffee Shop — **NEMU Space**

| Atribut | Keterangan |
|---|---|
| Nama Produk | NEMU Space |
| Jenis Sistem | Website Company Profile + CMS + POS + Manajemen Coffee Shop (Single Branch) |
| Versi Dokumen | 1.1 (Modular) |
| Bahasa Dokumen | Bahasa Indonesia |
| Target Pembaca | Product Manager, UI/UX Designer, Frontend Developer, Backend Developer, QA Engineer, Project Manager, Owner Coffee Shop |

---

## DAFTAR ISI & STRUKTUR MODULAR

Untuk kemudahan pemeliharaan dan kejelasan spesifikasi, dokumen PRD ini telah dipecah menjadi beberapa bagian modular:

### 1. [Pendahuluan, Ruang Lingkup & User Stories](./01_introduction.md)
*   **Pendahuluan & Latar Belakang**: Konteks bisnis dan tantangan operasional NEMU Space.
*   **Tujuan & Ruang Lingkup**: Batasan sistem yang dibangun (In-Scope & Out-of-Scope).
*   **Stakeholder & Target Pengguna**: Analisis pengguna sistem (Pelanggan, Kasir, Admin, Owner, Dapur/Barista).
*   **User Persona & Journeys**: Representasi profil pengguna dan skenario penggunaan sistem.
*   **User Stories**: Daftar kebutuhan user stories per peran pengguna.

### 2. [Arsitektur Sistem & Struktur Navigasi](./02_system_architecture.md)
*   **Sitemap**: Struktur halaman dan dashboard internal.
*   **Arsitektur Informasi**: Struktur navigasi publik dan internal.
*   **Struktur Folder**: Layout folder frontend (Next.js 15) dan backend (Laravel 12).
*   **Arsitektur Deployment**: Infrastruktur server (Vercel, Render, Supabase).

### 3. [Kebutuhan Sistem & Permission Matrix](./03_requirements.md)
*   **Functional Requirements**: Daftar detail kebutuhan fungsional (FR-01 s.d. FR-42).
*   **Non-Functional Requirements**: Standar performa, keamanan, skalabilitas, dan aksesibilitas.
*   **Role & Permission Matrix**: Matriks otorisasi akses fitur per peran pengguna.

### 4. [Spesifikasi Modul Operasional](./04_modules_specification.md)
*   **Spesifikasi Detail Konten & Bisnis**:
    *   Landing Page & CMS
    *   Dashboard (Kasir, Admin, Owner)
    *   Point of Sale (POS) & Transaksi
    *   Inventory & Reservasi Meja
    *   Manajemen Menu, Galeri, Promo, Artikel & Pengaturan Website
    *   Kitchen Display System (KDS) untuk Dapur/Barista

### 5. [Spesifikasi Database & API Internal](./05_database_and_api.md)
*   **Desain Database**: Detail struktur tabel PostgreSQL (users, menus, transactions, order_tickets, inventories, dll.).
*   **Entity Relationship Diagram (ERD)**: Visualisasi relasi data antar entitas.
*   **Spesifikasi REST API**: Endpoint publik, otentikasi, dapur, kasir, admin, dan owner beserta contoh request/response.

### 6. [Design System, Keamanan, SEO & Performa](./06_design_system.md)
*   **Design System**: Filosofi visual, palet warna, tipografi, spacing, border-radius, dan motion.
*   **Komponen UI & Responsivitas**: Pustaka komponen shadcn/ui dan pedoman mobile-first.
*   **Pedoman Keamanan (Security)**: Proteksi XSS, CSRF, SQL Injection, hashing password, dan audit logging.
*   **Optimasi SEO & Performa**: Lazy loading, caching, CDN, schema markup, dan Core Web Vitals.

### 7. [Roadmap Pengembangan & Strategi Testing](./07_roadmap_and_testing.md)
*   **Roadmap (Gantt Chart)**: Timeline estimasi waktu pengembangan selama 20 minggu (5 Bulan).
*   **Testing Strategy**: Unit testing, integration testing, E2E, accessibility, dan user acceptance testing (UAT).
*   **Acceptance Criteria & Definition of Done**: Kriteria serah terima fitur per modul.

### 8. [Rencana Implementasi Terperinci](./implementation_plan.md)
*   **Checklist Implementasi**: Panduan langkah-demi-langkah (Fase 1 s.d. Fase 10) untuk merombak backend (Laravel) dan frontend (Next.js).