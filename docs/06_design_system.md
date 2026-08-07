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

## 33. BORDER & SHADOW (Standar TailAdmin)

> Gaya border dan shadow telah disesuaikan untuk mengikuti standar default dari template TailAdmin, yang sekarang menjadi acuan utama.

### Border Radius

| Elemen | Kelas Tailwind (Contoh) | Nilai (Default TailAdmin) | Contoh |
|---|---|---|---|
| Kartu, Kotak Utama | `rounded-sm` | 0.125rem (2px) | Kartu statistik, container chart |
| Tombol, Input | `rounded-lg` | 0.5rem (8px) | Tombol utama, input form |
| Badge, Avatar | `rounded-full`| 9999px | Badge status, gambar profil |

### Shadow

| Elevasi | Kelas Tailwind | Penggunaan |
|---|---|---|
| Default | `shadow-default` | Kartu utama, container, modal |
| Hover (Opsional) | `hover:shadow-card-hover` (Custom) | Efek "mengangkat" pada kartu interaktif |
| Glow (Aksen) | `shadow-glow` (Custom) | Efek khusus pada tombol atau item penting |

## 34. PANDUAN KOMPONEN INTI (Arsitektur TailAdmin)

> Aturan ini berlaku untuk komponen dasar yang ada di `frontend/src/components/`. Komponen-komponen ini adalah fondasi dari semua halaman dasbor.

### Button

Varian tombol primer dan sekunder **wajib** mengikuti identitas merek. Varian lain dapat menggunakan gaya default TailAdmin.

| Varian | Kelas Kunci | Penggunaan |
|---|---|---|
| **Primer (Wajib)** | `bg-accent text-primary font-bold` | Aksi utama (Login, Simpan Perubahan) |
| **Sekunder (Wajib)**| `bg-primary text-accent` | Aksi sekunder penting (Lihat Detail) |
| **Danger/Destructive**| `bg-destructive text-white` | Aksi hapus, batal |
| **Default (TailAdmin)**| `bg-primary text-white` atau varian lain | Aksi umum, sesuai konteks |

**Aturan Umum Button:**
- **Padding & Ukuran**: Mengikuti standar TailAdmin, umumnya `inline-flex items-center justify-center rounded-md ... py-2 px-4 ...`.
- **State**: Harus memiliki style yang jelas untuk `hover`, `focus`, dan `disabled` (`opacity-50 cursor-not-allowed`).

### Input & Form

- **Input Teks**: Harus memiliki `rounded-lg`, `border-border`, dan `bg-transparent`. Saat `focus`, border harus berubah warna menjadi `border-primary` (sesuai gaya TailAdmin).
- **Label**: Menggunakan `font-medium` dan ditempatkan di atas inputnya.
- **Komponen Form**: Gunakan komponen dari `src/components/Forms` (misal: `SelectGroup`, `DatePicker`) untuk konsistensi.

### Kartu & Kontainer Data

Arsitektur lama `<Card />` telah usang. Gunakan komponen berikut:

| Komponen | Penggunaan | Aturan |
|---|---|---|
| **`CardDataStats`** | Menampilkan statistik tunggal (misal: Total Penjualan, Jumlah Pengguna). | Wajib berisi `title`, `total` (angka), dan `rate` (persentase). Ikon bersifat opsional. |
| **`Chart` (misal: `ChartOne`)**| Menampilkan grafik (garis, batang). | Dibungkus dalam kontainer dengan `rounded-sm border border-border bg-white p-4 shadow-default`. |
| **Kontainer Umum** | `div` dengan kelas `rounded-sm border border-border bg-white p-4 shadow-default` | Untuk membungkus tabel, form, atau konten custom lainnya agar terlihat seperti kartu. |

## 35. CONTOH PENERAPAN (DOs and DON'Ts - Gaya TailAdmin)

- **DO**: Gunakan `grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5` untuk layout statistik utama.
- **DON'T**: Jangan membuat layout grid manual dengan `flex` atau `margin`.

- **DO**: Gunakan `bg-accent text-primary` untuk tombol aksi utama.
- **DON'T**: Jangan biarkan tombol aksi utama menggunakan warna default template (`bg-primary text-white`).

- **DO**: Bungkus tabel atau form custom dengan `div` yang memiliki kelas `rounded-sm border border-stroke bg-white shadow-default`.
- **DON'T**: Jangan biarkan tabel atau form "mengambang" tanpa container yang konsisten.
