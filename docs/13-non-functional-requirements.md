# 13. Non-Functional Requirements

**Dokumen:** Non-Functional Requirements (NFRs)
**Versi:** 1.0.0
**Status:** Baseline

---

## 13.1 Performance Requirements

| Requirement | Target | Priority |
|---|---|---|
| API response time (p95) | < 300ms | High |
| Page load time (LCP) | < 1.8s | High |
| KDS real-time update latency | < 1s | Critical |
| Concurrent users (MVP) | 500 | Medium |
| Concurrent users (Year 1) | 2,000 | Medium |
| Database queries per page | < 20 | Medium |

---

## 13.2 Availability & Reliability

| Requirement | Target |
|---|---|
| Uptime (production) | 99.5% (< 3.6 hours downtime/month) |
| Mean Time to Recovery (MTTR) | < 4 hours |
| Data backup frequency | Daily |
| Backup retention | 30 days |
| Recovery Point Objective (RPO) | 24 hours |
| Recovery Time Objective (RTO) | 4 hours |

---

## 13.3 Scalability

- **Branches:** Support minimum 20 branches di MVP, 100+ di Year 2.
- **Orders:** Handle 10,000+ orders per day across all branches.
- **Data Growth:** Database dapat tumbuh hingga 100GB tanpa degradasi performa signifikan.
- **Horizontal Scaling:** Arsitektur harus prepared untuk load balancer dan multiple app servers.

---

## 13.4 Security

- **Authentication:** JWT-based dengan expiry 1 jam.
- **Authorization:** RBAC enforced di setiap endpoint.
- **Transport:** HTTPS wajib di production.
- **Password:** Hashed dengan bcrypt cost 12.
- **Audit:** Semua mutasi data sensitif tercatat di audit log.
- **Compliance:** GDPR-ready (data export, deletion, consent).

---

## 13.5 Usability

- **Accessibility:** WCAG 2.2 Level AA compliance.
- **Mobile-First:** Semua halaman publik responsive.
- **Browser Support:** Chrome, Firefox, Safari, Edge (2 versi terakhir).
- **Language:** Bahasa Indonesia sebagai default, struktur i18n ready untuk multi-language.

---

## 13.6 Maintainability

- **Code Quality:** Minimal 80% test coverage untuk business logic.
- **Documentation:** Inline doc untuk semua public method.
- **Logging:** Structured JSON logs dengan request ID.
- **Monitoring:** Real-time error tracking via Sentry.
- **Deployment:** Zero-downtime deployment via symlink swap.

---

## 13.7 Portability

- **Database:** PostgreSQL (vendor lock-in minimal).
- **Cloud Agnostic:** Dapat di-deploy di VPS, AWS, DigitalOcean, atau on-premise.
- **Containerization:** Docker untuk development dan production.
- **Environment Parity:** Dev, staging, dan production memakai stack identik.

---

## 13.8 Legal & Compliance

- **Data Residency:** Data stored di Indonesia (jika mungkin).
- **Data Privacy:** PII protected, dapat dihapus atas permintaan user.
- **Tax Compliance:** Support invoice dengan NPWP.
- **License:** Open source libraries harus compatible dengan commercial use.

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
