# Spesifikasi Desain & Navigasi Dashboard NEMU Space

Dokumen ini berisi spesifikasi lengkap untuk sistem navigasi Dashboard **NEMU Space Management System** yang dirancang dengan pendekatan modern, premium, dan *enterprise-ready*.

---

## 1. Dashboard Layout

Layout dashboard dirancang dengan arsitektur **App Shell** yang solid dan memisahkan navigasi dari area konten utama.

- **Sidebar (Kiri)**: Navigasi utama sistem, dapat diperluas (expand) dan dilipat (collapse).
- **Header (Atas)**: Area persisten yang menempel (sticky) berisi utilitas global (Search, Notifikasi, User Menu).
- **Content Area (Kanan Bawah)**: Area utama untuk memuat halaman. Memiliki scroll independen.
- **Breadcrumb**: Berada di bagian atas Content Area, tepat di bawah Header.

---

## 2. Sidebar Specification

Sidebar berfungsi sebagai sistem navigasi hierarkis utama.

- **Visual**: Background solid (gelap pada Dark Mode, terang/putih pada Light Mode) dengan border tipis di sisi kanan memisahkan sidebar dari konten.
- **Branding**: Logo NEMU Space dan Nama Sistem di bagian teratas.
- **State Behavior**:
  - **Expand**: Menampilkan icon dan label teks.
  - **Collapse**: Hanya menampilkan icon. Label teks muncul sebagai **Tooltip** di sebelah kanan saat di-hover.
  - **Mobile Drawer**: Menyembunyikan sidebar, dapat dipanggil melalui tombol hamburger di Header (menggunakan komponen Sheet/Drawer).
- **Interaksi**:
  - **Hover**: Latar belakang menu berubah (soft highlight), warna teks/icon menjadi lebih kontras.
  - **Active**: Menu yang sedang dibuka memiliki *indicator* (garis vertikal tipis di sisi kiri atau highlight background menyeluruh) dengan teks yang di-bold.
- **Struktur Menu**: Mendukung *Nested Menu* (maksimal 2 level). Level kedua menggunakan akordion halus (menggunakan *Framer Motion* untuk animasi buka-tutup).

---

## 3. Header Specification

Header berfokus pada utilitas global tanpa mengganggu area kerja pengguna.

- **Posisi**: *Sticky top* dengan efek *glassmorphism* (blur) saat halaman di-scroll ke bawah.
- **Komponen Kiri**: Tombol hamburger (hanya muncul di Mobile/Tablet).
- **Komponen Tengah/Kiri**: Global Search Bar (didesain menyerupai tombol *Command/K* untuk memanggil dialog pencarian).
- **Komponen Kanan**:
  - **Dark / Light Mode Toggle**: Ikon Sun / Moon.
  - **Notification**: Ikon Bell (Lonceng) dengan *Badge* merah berisi angka notifikasi yang belum dibaca.
  - **User Menu**: Avatar pengguna (inisial atau foto), Nama User, Role (disembunyikan di mobile), dan Dropdown.

---

## 4. Breadcrumb Specification

Navigasi remah roti (breadcrumb) untuk orientasi ruang pengguna.

- **Posisi**: Kiri atas pada area konten (sebelum judul halaman).
- **Format**: `Dashboard` / `Group Menu` / `Nama Halaman Aktif`.
- **Interaksi**: Setiap node sebelum node terakhir dapat diklik untuk kembali ke parent/halaman sebelumnya. Node terakhir menggunakan warna teks yang lebih solid (menandakan halaman aktif).

---

## 5. Navigation Structure & Interaksi

- Mengelompokkan menu berdasarkan domain bisnis (Operasional, Konten, Manajemen, dll).
- Dibatasi **maksimal 2 level** (Group > Item). Tidak ada menu di dalam menu.
- Menggunakan *Lucide React* secara konsisten dengan ukuran icon 20x20px untuk keseragaman.

---

## 6. Daftar Menu Sidebar & Icon (Lucide React)

Berikut adalah struktur menu beserta icon yang ditetapkan:

- **Dashboard** `(LayoutDashboard)`
- **Operasional**
  - POS `(Calculator)`
  - Reservasi `(CalendarCheck)`
  - Menu `(Utensils)`
  - Kategori Menu `(Tags)`
  - Inventory `(Package)`
  - Daftar Pesanan `(ClipboardList)` *(Khusus Dapur/Barista)*
  - Status Pesanan `(Clock)` *(Khusus Dapur/Barista)*
- **Konten Website**
  - Landing Page `(MonitorPlay)`
  - Banner `(Image)`
  - Artikel `(FileText)`
  - Galeri `(Images)`
  - Promo `(Ticket)`
  - FAQ `(HelpCircle)`
- **Laporan**
  - Penjualan `(TrendingUp)`
  - Reservasi `(CalendarClock)`
  - Inventory `(Archive)`
- **Manajemen**
  - User `(Users)`
  - Role `(Shield)`
  - Permission `(Key)`
- **Pengaturan**
  - Pengaturan Website `(Settings)`
  - Profil Coffee Shop `(Store)`
  - Backup `(Database)`
  - Aktivitas Sistem `(Activity)`

---

## 7. Hak Akses Setiap Role (RBAC)

- **Owner**: Memiliki akses ke **seluruh menu**.
- **Admin**: Dashboard, Reservasi, Menu, Kategori Menu, Inventory, Landing Page, Banner, Artikel, Galeri, Promo, FAQ, Laporan. *(Pengecualian: Backup, Role, Permission)*.
- **Kasir**: Dashboard, POS, Reservasi, Menu. *(Pengecualian: Tidak ada akses CMS Website, Manajemen User, Pengaturan)*.
- **Dapur / Barista**: Dashboard, Daftar Pesanan, Status Pesanan, Menu, Inventory (View Only). *(Pengecualian: Tidak ada akses CMS Website, POS)*.
- **Multi Role (Staf Multi Role)**: Otomatis menggabungkan *permission* dari Kasir dan Dapur/Barista. Pengguna tidak perlu memilih role saat login; UI secara dinamis menampilkan gabungan menu (Dashboard, POS, Reservasi, Menu, Daftar Pesanan, Status Pesanan, Inventory).

---

## 8. Role Permission Matrix

| Modul / Menu | Owner | Admin | Kasir | Dapur/Barista | Multi Role (Kasir+Dapur) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **POS** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Reservasi** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Menu & Kategori** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Inventory** | ✅ | ✅ | ❌ | ✅ (View) | ✅ (View) |
| **Daftar & Status Pesanan** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **CMS Website (Semua)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Laporan** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manajemen User** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manajemen Role & Perms** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Pengaturan & Backup** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 9. User Menu

Saat Avatar atau Nama pengguna pada Header diklik, sebuah Dropdown (Pop-over) akan muncul:

- **Header Dropdown**:
  - Nama Pengguna (Tebal)
  - Email (Abu-abu/Muted)
  - Role Badge (misal: "Admin", atau "Kasir, Dapur")
- **Pemisah (Separator)**
- **Item Menu**:
  - Lihat Profil `(User)`
  - Pengaturan Akun `(Settings)`
  - Ubah Password `(Lock)`
- **Pemisah (Separator)**
- **Logout Action**:
  - Logout `(LogOut)` (Warna Teks Merah/Destructive)

---

## 10. Notification System

Tersedia di Header (Ikon Lonceng).
- **Badge**: Menampilkan angka (misal "3") jika ada notifikasi baru. Hilang jika 0.
- **Pop-over Notifikasi**:
  - Header: "Notifikasi" dan tombol "Tandai semua dibaca".
  - List Notifikasi menampilkan icon berbeda:
    - Reservasi Baru `(CalendarPlus)` (Biru)
    - Stok Hampir Habis `(AlertTriangle)` (Kuning/Orange)
    - Pesanan Baru `(BellRing)` (Hijau)
    - Promo Akan Berakhir `(Timer)` (Kuning)
    - Artikel Belum Dipublish `(FileWarning)` (Abu-abu)
    - Menu Tidak Tersedia `(Ban)` (Merah)

---

## 11. Global Search

- Implementasi menggunakan `Command` component (seperti Spotlight di Mac/Raycast).
- Dipicu dengan klik di search bar header, atau shortcut keyboard `Ctrl + K` (atau `Cmd + K`).
- Menampilkan kategori hasil pencarian:
  - Menu (Mencari produk kopi/makanan)
  - Artikel (Mencari judul konten)
  - Promo (Mencari nama promo)
  - Reservasi (Mencari nama pemesan)
  - Inventory (Mencari nama barang/bahan)
  - User (Mencari nama staf)

---

## 12. Responsive Behavior

| Breakpoint | Sidebar Behavior | Header Behavior | Search |
| :--- | :--- | :--- | :--- |
| **Desktop (>1024px)** | Terbuka penuh (Expanded). Lebar tetap (~260px). | Full width dari sisi kanan sidebar. | Search bar utuh. |
| **Tablet (768px - 1024px)** | Dilipat otomatis (Collapsed). Ikon saja (~80px). | Full width dari sisi kanan sidebar. | Search bar menjadi ikon search saja. |
| **Mobile (<768px)** | Disembunyikan total. Akses via Drawer (Hamburger Menu). | Full width 100%. Sticky top. | Hanya ikon search. |

---

## 13. Accessibility (A11y)

- **Keyboard Support**: Semua menu sidebar, dropdown, dan notifikasi dapat dinavigasi menggunakan tombol `Tab`, `Arrow`, dan `Enter`.
- **Aria Labels**: Setiap tombol ikon (terutama pada sidebar collapsed) memiliki `aria-label`.
- **Focus Rings**: State `:focus-visible` menggunakan *Ring* yang sesuai standar warna brand untuk memperjelas elemen aktif.
- **Kontras**: Teks dan ikon memiliki *contrast ratio* minimal 4.5:1 terhadap latar belakang (mendukung WCAG AA).

---

## 14. Wireframe ASCII

```text
+-------------------------------------------------------------+
| [Logo] NEMU Space   | [Search / Cmd+K]       [Bell] [Avatar]| <- Header
|---------------------|---------------------------------------|
|                     |                                       |
| [*] Dashboard       |  Dashboard / Reservasi                | <- Breadcrumb
|                     |                                       |
| OPERASIONAL         |  +---------------------------------+  |
| [ ] POS             |  |                                 |  |
| [ ] Reservasi       |  |     C O N T E N T   A R E A     |  |
| [ ] Menu            |  |                                 |  |
| [ ] Inventory       |  |                                 |  |
|                     |  |                                 |  |
| KONTEN WEBSITE      |  |                                 |  |
| [ ] Landing Page    |  +---------------------------------+  |
| [ ] Artikel         |                                       |
+-------------------------------------------------------------+
```

---

## 15. Komponen UI (shadcn/ui & Radix) yang Digunakan

1. **Sidebar**: Dibangun menggunakan `aside` konvensional atau komponen *Sidebar* shadcn terbaru.
2. **Tooltip**: Digunakan untuk Sidebar Collapsed (`@radix-ui/react-tooltip`).
3. **Dropdown Menu**: Digunakan untuk User Menu (`@radix-ui/react-dropdown-menu`).
4. **Popover**: Digunakan untuk Notifikasi Pop-over.
5. **Command**: Digunakan untuk antarmuka Global Search Bar (`cmdk`).
6. **Sheet**: Digunakan untuk Sidebar Drawer di versi Mobile.
7. **Breadcrumb**: Komponen Breadcrumb shadcn.
8. **Avatar**: Menampilkan inisial/foto user (`@radix-ui/react-avatar`).
9. **Badge**: Indikator jumlah notifikasi.
10. **ScrollArea**: Untuk membuat menu sidebar dan konten bisa di-scroll terpisah (`@radix-ui/react-scroll-area`).

---

## 16. Acceptance Criteria (AC)

1. **AC-1**: Sidebar dapat di-expand dan collapse tanpa merusak layout konten. Animasi halus dengan Framer Motion.
2. **AC-2**: Saat sidebar di-collapse, tooltips nama menu muncul saat kursor berada di atas ikon.
3. **AC-3**: Halaman aktif otomatis di-highlight di Sidebar dan direfleksikan di Breadcrumb.
4. **AC-4**: Di perangkat mobile (<768px), sidebar disembunyikan dan hanya bisa diakses via hamburger menu (Drawer/Sheet).
5. **AC-5**: Global search (Cmd+K) bisa dipanggil dan merender dialog (Command component).
6. **AC-6**: User yang login dengan multi-role mendapatkan gabungan hak akses tanpa perlu melakukan ganti akun. Modul tidak berhak akses otomatis hilang dari sidebar.
7. **AC-7**: Tidak ada penggunaan emoji di seluruh antarmuka dashboard, semua icon wajib bersumber dari `lucide-react`.
8. **AC-8**: Header memiliki perilaku sticky dan tidak tertutup oleh area scroll dari halaman (z-index dijaga).
9. **AC-9**: Semua border radius mematuhi standar *Rounded XL* dan shadow memakai pola *Soft Shadow*.
10. **AC-10**: Tema mendukung transisi Light/Dark Mode dengan palet warna yang kohesif.
