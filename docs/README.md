# Velvra PRD - Daftar Dokumen

Dokumen PRD Velvra telah dipecah menjadi beberapa file terpisah untuk memudahkan navigasi dan maintenance:

## 📋 Daftar File

### Konsep & Strategi
- **01-konsep-dan-visi.md** - Executive summary, problem statement, visi produk, goals & KPIs, scope, stakeholders & personas, glossary
  
### Arsitektur & Infrastruktur  
- **02-arsitektur-sistem.md** - System architecture, tech stack, deployment model
- **18-information-architecture.md** - Sitemap dan struktur informasi aplikasi
- **12-deployment-devops.md** - Deployment architecture, CI/CD pipeline, monitoring

### Desain & UI/UX
- **03-desain-sistem.md** - Design system, design tokens, typography, colors, components
- **19-responsive-design.md** - Responsive design rules dan breakpoints
- **17-accessibility.md** - WCAG 2.2 AA compliance requirements

### Data & API
- **04-database-design.md** - Database schema, entity relationships, data model
- **05-api-design.md** - REST API conventions, endpoints, request/response patterns

### Security & Access Control
- **06-security.md** - Security architecture, authentication, authorization
- **07-roles-dan-permissions.md** - RBAC model, roles, permissions, branch scoping

### Modul & Fitur
- **08-modul-fungsional.md** - Spesifikasi fungsional semua modul (30+ modul)
- **09-user-flows.md** - User flows dan system flows utama

### Quality & Performance
- **10-performance.md** - Performance engineering requirements
- **11-testing-strategy.md** - Testing strategy (unit, integration, E2E, accessibility)
- **13-non-functional-requirements.md** - NFR summary (availability, scalability, reliability)

### Planning & Implementation
- **14-roadmap-dan-scalability.md** - Future roadmap dan scalability planning
- **15-implementation-notes.md** - Engineering handoff, sprint sequencing, DoR/DoD
- **16-appendices.md** - Priority legend, requirement ID prefix, governance

## 🗂️ Cara Menggunakan

1. **Mulai dari konsep** - Baca `01-konsep-dan-visi.md` untuk memahami big picture
2. **Pahami arsitektur** - Review `02-arsitektur-sistem.md` untuk tech stack dan struktur
3. **Eksplorasi modul** - Lihat `08-modul-fungsional.md` untuk spesifikasi detail setiap fitur
4. **Referensi teknis** - Gunakan file database, API, dan security untuk implementasi

## 📌 Catatan

- File asli `prd.md` tetap ada sebagai referensi lengkap
- Setiap file independen dan dapat dibaca terpisah
- Gunakan file yang relevan sesuai role (Frontend → desain sistem, Backend → API & database, QA → testing strategy)

**Versi:** 1.0.0  
**Tanggal:** 13 Juli 2026
