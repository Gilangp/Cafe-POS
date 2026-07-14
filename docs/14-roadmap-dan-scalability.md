# 14. Roadmap & Scalability

**Dokumen:** Product Roadmap & Scalability Plan
**Versi:** 1.0.0
**Status:** Baseline

---

## 14.1 Phase 0: Foundation (Pre-MVP)

**Durasi:** 1-2 bulan

**Goals:**
- Setup repository, CI/CD, dan environment.
- Database schema dan migration.
- Authentication & RBAC.
- Seeder untuk test data.

**Deliverables:**
- Working local development environment.
- Base API structure dengan auth.
- Admin dapat login dan manage user.

---

## 14.2 Phase 1: MVP (Core Features)

**Durasi:** 3-4 bulan

**Goals:**
- Operasional satu cabang dapat berjalan end-to-end.
- Customer dapat order online.
- Cashier dapat input order di POS.
- Kitchen dapat lihat order di KDS.
- Inventory otomatis terdeduksi saat order.

**Modules:**
- Menu Management
- POS Basic
- KDS Basic
- Inventory Basic
- Order Management
- Member Basic (tanpa loyalty)
- CMS Basic (Landing page, About)

**Launch Criteria:**
- Semua core flow ter-test.
- 1 pilot branch live selama 2 minggu.
- Training untuk staff selesai.

---

## 14.3 Phase 2: Growth (Multi-Branch & Advanced Features)

**Durasi:** 3-6 bulan

**Goals:**
- Support 10+ cabang.
- Loyalty program aktif.
- Analytics dashboard lengkap.
- Reservation system.
- Mobile app (optional).

**Features:**
- Multi-branch management.
- Loyalty point system.
- Promo & discount engine.
- Reservation management.
- Advanced reporting (sales, inventory valuation).
- Email marketing automation.
- MFA untuk admin accounts.

---

## 14.4 Phase 3: Scale (National Expansion)

**Durasi:** 6-12 bulan

**Goals:**
- Support 50+ cabang.
- Multi-region deployment.
- Microservices extraction untuk module tertentu.

**Features:**
- Multi-currency support.
- Multi-language (English, Mandarin).
- Franchise management module.
- Advanced procurement (vendor comparison, RFQ).
- Payroll integration.
- Third-party delivery aggregator integration (GoFood, GrabFood).

**Infrastructure:**
- Horizontal scaling dengan load balancer.
- Read replicas untuk reporting.
- CDN untuk static assets.
- Separate database untuk analytics.

---

## 14.5 Scalability Triggers & Actions

| Trigger | Action |
|---|---|
| Response time p95 > 500ms | Add Redis caching, optimize queries |
| CPU usage > 70% sustained | Vertical scaling (upgrade server) |
| DB connections > 80% pool | Add read replicas, connection pooling |
| 50+ branches | Implement database sharding per region |
| 100K+ orders/month | Extract inventory service to separate app |
| 1M+ rows in orders table | Implement table partitioning by month |

---

## 14.6 Technical Debt Management

- **Quarterly Review:** Alokasikan 20% sprint capacity untuk refactoring.
- **Deprecation Policy:** API v1 didukung minimal 12 bulan setelah v2 launch.
- **Code Quality:** Wajib maintain test coverage > 80%.
- **Security Patches:** Dependency update monthly, critical patches immediate.

---

## 14.7 Future Considerations

- **Kiosk Mode:** Self-order kiosk untuk in-store.
- **Mobile App Native:** iOS & Android native app.
- **Voice Ordering:** Integrasi dengan voice assistant.
- **AI Recommendation:** Personalized menu recommendation.
- **Blockchain Loyalty:** Tokenized loyalty points (Phase 4+).

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
