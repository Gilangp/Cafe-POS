# 16. Appendices

**Dokumen:** Appendices & References
**Versi:** 1.0.0
**Status:** Baseline

---

## 16.1 Glossary

| Term | Definition |
|---|---|
| **RBAC** | Role-Based Access Control - sistem otorisasi berbasis role |
| **JWT** | JSON Web Token - format token untuk autentikasi stateless |
| **POS** | Point of Sale - sistem kasir |
| **KDS** | Kitchen Display System - tampilan order untuk dapur |
| **SKU** | Stock Keeping Unit - kode unik untuk item inventory |
| **HPP** | Harga Pokok Penjualan (COGS - Cost of Goods Sold) |
| **SLO** | Service Level Objective - target metrik performa |
| **RTO** | Recovery Time Objective - target waktu recovery |
| **RPO** | Recovery Point Objective - target data loss maksimal |
| **WCAG** | Web Content Accessibility Guidelines |

---

## 16.2 Technology References

### Backend
- [Laravel 12 Documentation](https://laravel.com/docs/12.x)
- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [PHP 8.3 Documentation](https://www.php.net/manual/en/)
- [Redis Documentation](https://redis.io/docs/)

### Frontend
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### DevOps
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 16.3 External Services

| Service | Purpose | Plan |
|---|---|---|
| Sentry | Error tracking | Free tier (10K events/month) |
| Cloudflare | CDN & DDoS protection | Free tier |
| Midtrans | Payment gateway | Transaction-based pricing |
| AWS S3 / Cloudflare R2 | File storage | Pay as you go |
| SendGrid / Mailgun | Email delivery | Free tier (100 emails/day) |
| Twilio | SMS notifications | Pay as you go |

---

## 16.4 Compliance & Standards

- **WCAG 2.2 Level AA:** Web accessibility standard
- **PSR-12:** PHP coding style standard
- **OpenAPI 3.1:** API documentation standard
- **Conventional Commits:** Git commit message standard
- **Semantic Versioning:** Version numbering (MAJOR.MINOR.PATCH)

---

## 16.5 Recommended Reading

### System Design
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Building Microservices" by Sam Newman

### Laravel
- "Laravel: Up & Running" by Matt Stauffer
- Official Laravel documentation

### React/Next.js
- "React - The Complete Guide" (Udemy)
- Official Next.js documentation

---

## 16.6 Contact & Support

| Role | Contact |
|---|---|
| Product Manager | pm@velvra.internal |
| Lead Backend Engineer | backend-lead@velvra.internal |
| Lead Frontend Engineer | frontend-lead@velvra.internal |
| DevOps Engineer | devops@velvra.internal |
| QA Lead | qa@velvra.internal |

---

## 16.7 Document Change Log

| Date | Version | Author | Changes |
|---|---|---|---|
| 2026-07-13 | 1.0.0 | System | Initial baseline documentation |

---

## 16.8 Related Documents

- [01-konsep-dan-visi.md](./01-konsep-dan-visi.md)
- [02-arsitektur-sistem.md](./02-arsitektur-sistem.md)
- [03-desain-sistem.md](./03-desain-sistem.md)
- [04-database-design.md](./04-database-design.md)
- [05-api-design.md](./05-api-design.md)
- [06-security.md](./06-security.md)
- [07-roles-dan-permissions.md](./07-roles-dan-permissions.md)
- [08-modul-fungsional.md](./08-modul-fungsional.md)
- [09-user-flows.md](./09-user-flows.md)
- [10-performance.md](./10-performance.md)
- [11-testing-strategy.md](./11-testing-strategy.md)
- [12-deployment-devops.md](./12-deployment-devops.md)
- [13-non-functional-requirements.md](./13-non-functional-requirements.md)
- [14-roadmap-dan-scalability.md](./14-roadmap-dan-scalability.md)
- [15-implementation-notes.md](./15-implementation-notes.md)
- [17-accessibility.md](./17-accessibility.md)
- [18-information-architecture.md](./18-information-architecture.md)
- [19-responsive-design.md](./19-responsive-design.md)
- [prd.md](./prd.md)
- [README.md](./README.md)

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
