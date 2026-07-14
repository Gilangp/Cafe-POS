# 10. Performance

**Dokumen:** Performance Engineering
**Versi:** 1.0.0
**Status:** Baseline

---

## 10.1 Tujuan Performa

- **Responsiveness:** Memberi feedback cepat ke user.
- **Scalability:** Mampu menangani lonjakan traffic.
- **Efficiency:** Menggunakan resource secara optimal.

---

## 10.2 Metrik Kunci (SLO)

| Metrik | Target | Prioritas |
|---|---|---|
| **API Response Time (p95)** | < 300 ms | High |
| **Page Load (LCP)** | < 1.8 detik | High |
| **KDS Update Latency** | < 1 detik | Critical |
| **Concurrent Users (MVP)** | 500 | Medium |
| **Server CPU Usage** | < 70% | High |
| **DB Connection Pool Usage**| < 80% | High |

---

## 10.3 Optimasi Backend

- **Query:** Gunakan eager loading (with), index, dan `select()`.
- **Caching:** Cache data yang jarang berubah (menu, config).
- **Async:** Gunakan queue untuk task > 500ms (email, report).
- **Code:** Hindari N+1 query. Gunakan `DB::transaction`.
- **Image:** Kompresi gambar saat upload.

---

## 10.4 Optimasi Frontend

- **Bundling:** Code splitting per halaman.
- **Images:** Gunakan `next/image` untuk optimasi, lazy loading.
- **Rendering:** Gunakan SSG/ISR untuk halaman marketing, SSR/CSR untuk dashboard.
- **State:** Hindari re-render tidak perlu, gunakan `React.memo`.
- **Network:** Kurangi jumlah request, gunakan API sparse fieldsets.

---

## 10.5 Load Testing

- **Skenario:** Order online, browse menu, POS checkout.
- **Tools:** k6, JMeter, atau sejenisnya.
- **Jadwal:** Sebelum rilis mayor dan saat ada perubahan arsitektur.
- **Target:** Sistem tetap stabil di 1.5x target concurrent user.

---

**Document Status:** ✅ Complete
