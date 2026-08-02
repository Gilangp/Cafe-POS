# 06. DESIGN SYSTEM & PANDUAN UI

Dokumen ini adalah **sumber kebenaran tunggal (Single Source of Truth)** untuk semua aspek visual dan interaksi antarmuka. Tujuannya adalah untuk memastikan konsistensi, aksesibilitas, dan efisiensi dalam pengembangan UI, berdasarkan referensi visual `Nemu Space.jfif`.

## 30. PALET WARNA

Warna-warna ini didefinisikan dalam `tailwind.config.ts` dan `globals.css`. Gunakan kelas utilitas Tailwind (`bg-primary`, `text-accent`, dll.) alih-alih hardcoding nilai hex.

| Peran | Nama Token | Kelas Tailwind | Nilai Hex | Contoh Penggunaan |
|---|---|---|---|---|
| **Primer** | `primary` | `bg/text-primary` | `#1E3D31` | Latar belakang gelap, teks utama |
| **Aksen** | `accent` | `bg/text-accent` | `#C89B5C` | Tombol utama, link, highlight harga |
| **Latar Belakang** | `background` | `bg-background` | `#F8F6F2` | Latar belakang utama (mode terang) |
| **Netral (Teks)** | `foreground` | `text-foreground` | `#1A2620` | Teks default di latar terang |
| **Kartu** | `card` | `bg-card` | `#FFFFFF` | Latar belakang kartu, input |
| **Batas** | `border` | `border-border` | `#E4D9C4` | Garis pemisah, border input |
| **Fungsional: Error** | `destructive` | `bg/text-destructive` | `#ef4444` | Pesan error, tombol hapus |
| **Fungsional: Sukses** | `success` | `bg/text-success` | `#22c55e` | Notifikasi sukses |

## 31. TIPOGRAFI

Sistem menggunakan dua jenis font utama yang didefinisikan di `globals.css` atau layout.

| Peran | Font Family | Kelas Tailwind | Penggunaan |
|---|---|---|---|
| **Heading** | `font-heading` (misal: "Playfair Display") | `font-heading` | Judul besar, harga, nama menu yang menonjol |
| **Body** | `font-body` (misal: "Inter", "Lato") | `font-sans` | Paragraf, label, teks UI, input |

### Skala Tipografi

| Elemen | Kelas Tailwind | Ukuran (px) | Berat Font | Catatan |
|---|---|---|---|---|
| Display (Hero) | `text-5xl font-bold font-heading` | 60 | 700 | Hanya untuk headline utama |
| Judul Halaman (h1) | `text-3xl font-bold font-heading` | 36 | 700 | Judul utama setiap halaman |
| Judul Section (h2) | `text-2xl font-bold font-heading` | 24 | 700 | Judul section (misal: "Barista Recommends") |
| Judul Kartu (h3) | `text-lg font-semibold font-body` | 18 | 600 | Judul di dalam kartu |
| Teks Body | `text-base font-normal font-body` | 16 | 400 | Paragraf, deskripsi |
| Label / Teks Kecil | `text-sm font-medium font-body` | 14 | 500 | Label form, teks sekunder |
| Teks Super Kecil | `text-xs font-semibold font-body` | 12 | 600 | Badge, tag, info meta |

## 32. SPACING & LAYOUT

Gunakan skala spacing berbasis kelipatan 4px untuk konsistensi. Ini sesuai dengan skala default Tailwind.

| Penggunaan | Kelas Tailwind | Nilai (px) |
|---|---|---|
| Jarak antar elemen kecil | `gap-2`, `p-2` | 8px |
| Padding di dalam input/tombol | `px-4 py-3` | 16px (horz), 12px (vert) |
| Jarak antar item di grid | `gap-4`, `gap-6` | 16px, 24px |
| Padding di dalam kartu | `p-6` | 24px |
| Padding section utama | `py-16`, `py-20` | 64px, 80px |

**Aturan Layout:**
- **Lebar Konten Maksimal**: Gunakan `max-w-7xl mx-auto` untuk membungkus konten utama halaman agar tidak terlalu lebar di layar besar.
- **Padding Halaman**: Beri padding horizontal `px-4` atau `px-6` pada kontainer utama.

## 33. BORDER & SHADOW

### Border Radius

| Elemen | Kelas Tailwind | Nilai | Contoh |
|---|---|---|---|
| Kartu Utama, Modal | `rounded-2xl` | 16px | Kartu menu, modal pembayaran |
| Tombol, Input | `rounded-lg` | 8px | Tombol "Proses Bayar", input pencarian |
| Badge, Tag | `rounded-full` | 9999px | Badge "Best Seller" |

### Shadow

| Elevasi | Kelas Tailwind | Penggunaan |
|---|---|---|
| Rendah | `shadow-sm` | Elemen UI di dalam kartu |
| Default | `shadow-md` | Kartu utama dalam keadaan normal |
| Tinggi (Hover) | `shadow-lg`, `shadow-xl` | Kartu saat di-hover untuk memberi efek "mengangkat" |
| Glow (Aksen) | `shadow-glow` (custom) | Efek khusus saat hover pada item penting |

## 34. PANDUAN KOMPONEN INTI

Ini adalah aturan untuk komponen dasar yang paling sering digunakan, yang ada di `frontend/src/shared/components/ui/`.

### Button

| Varian | Kelas Kunci | Penggunaan |
|---|---|---|
| **Primer** | `bg-accent text-primary font-bold` | Aksi utama (Proses Bayar, Simpan) |
| **Sekunder** | `bg-primary text-accent` | Aksi sekunder penting |
| **Destruktif** | `bg-destructive text-destructive-foreground` | Aksi hapus, batal |
| **Outline** | `border border-input bg-transparent` | Aksi tersier (Ekspor) |
| **Ghost** | `hover:bg-accent/10` | Tombol ikon tanpa background |

**Aturan Umum Button:**
- **Padding**: `h-10 px-4 py-2` untuk ukuran standar.
- **State**: Harus memiliki style yang jelas untuk `hover`, `focus`, dan `disabled` (`opacity-50 cursor-not-allowed`).

### Input & Form

- **Input Teks**: Harus memiliki `height` yang konsisten (misal: `h-10`), `padding` horizontal (`px-3`), dan `border` (`border-input`). Saat `focus`, border harus berubah warna menjadi `border-accent` (atau `ring-accent`).
- **Label**: Harus menggunakan `text-sm font-medium` dan ditempatkan di atas inputnya.

### Kartu (`<Card />`)

- **Padding Internal**: `p-6` secara default.
- **Border & Shadow**: `border border-border rounded-2xl shadow-md`.
- **Struktur**: Komponen harus terdiri dari `<CardHeader>`, `<CardContent>`, dan `<CardFooter>` untuk konsistensi struktur.

## 35. CONTOH PENERAPAN (DOs and DON'Ts)

- **DO**: Gunakan `gap-4` untuk membuat jarak antar kartu di grid.
- **DON'T**: Jangan gunakan `margin-left: 15px` secara manual.

- **DO**: Gunakan `bg-primary` untuk latar belakang gelap dan `text-background` untuk teks di atasnya.
- **DON'T**: Jangan hardcode `#1E3D31` di dalam komponen.

- **DO**: Buat komponen `SectionTitle` yang menggunakan `text-2xl font-bold font-heading`.
- **DON'T**: Jangan styling judul section secara manual di setiap halaman.
