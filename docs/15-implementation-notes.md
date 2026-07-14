# 15. Implementation Notes

**Dokumen:** Engineering Handoff & Implementation Notes
**Versi:** 1.0.0
**Status:** Baseline

---

## 15.1 Repository Structure

```
coffee_shop/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Policies/
│   │   └── Events/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── tests/
│   └── routes/
│       └── api.php
├── frontend/             # Next.js
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── docs/                 # Documentation
└── docker-compose.yml
```

---

## 15.2 Development Workflow

1. **Setup:** Clone repo, run `docker-compose up`, run migrations & seeders.
2. **Branch:** Create feature branch dari `develop`.
3. **Develop:** Write code + tests.
4. **Test:** Run `php artisan test` dan `npm test`.
5. **Commit:** Conventional commits (feat, fix, docs, refactor).
6. **PR:** Create pull request, CI runs automatically.
7. **Review:** Code review oleh minimal 1 developer.
8. **Merge:** Merge ke `develop`, auto deploy ke staging.

---

## 15.3 Coding Standards

### Backend (PHP/Laravel)

- **PSR-12** coding style.
- **PHPStan** level 5 minimum.
- **Service Layer:** Semua business logic di Service class, bukan Controller.
- **Repository Pattern:** Optional, pakai jika query logic kompleks.
- **Events:** Gunakan event untuk cross-module communication.

### Frontend (TypeScript/React)

- **ESLint** + Prettier enforced.
- **Component Structure:** Atomic design (atoms, molecules, organisms).
- **State Management:** React Query untuk server state, Context API untuk global UI state.
- **Naming:** PascalCase untuk component, camelCase untuk function/variable.

---

## 15.4 Database Conventions

- **Migrations:** Timestamp-based, reversible.
- **Naming:** `create_orders_table.php`, `add_status_to_orders_table.php`.
- **Foreign Keys:** On delete action harus explicit (`CASCADE`, `SET NULL`, `RESTRICT`).
- **Indexes:** Tambahkan index untuk foreign key dan kolom yang sering di-filter/sort.

---

## 15.5 API Conventions

- **Endpoint Naming:** Plural noun (`/orders`, `/menu/items`).
- **HTTP Method:** GET (read), POST (create), PATCH (update), DELETE (soft delete).
- **Versioning:** `/api/v1/...`.
- **Response:** Consistent envelope (`data`, `meta`, `links`, `error`).
- **Validation:** Laravel FormRequest untuk semua POST/PATCH.

---

## 15.6 Git Conventions

**Branch Naming:**
- `feature/menu-management`
- `bugfix/order-calculation`
- `hotfix/payment-gateway`

**Commit Messages:**
```
feat(orders): add order cancellation endpoint
fix(inventory): prevent negative stock
docs(api): update authentication section
refactor(pos): extract payment logic to service
test(membership): add loyalty point calculation tests
```

---

## 15.7 Environment Variables

**Required:**
```env
APP_NAME=Velvra
APP_ENV=local|production
APP_KEY=base64:...
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=velvra
DB_USERNAME=velvra
DB_PASSWORD=secret

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

JWT_SECRET=...
JWT_TTL=60

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525

PAYMENT_GATEWAY=midtrans
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
```

---

## 15.8 Common Pitfalls

- **N+1 Query:** Selalu gunakan `with()` untuk eager load relations.
- **Missing Index:** Tambahkan index untuk kolom `branch_id`, `created_at`, foreign keys.
- **No Transaction:** Operasi kritikal (order, payment) harus dalam `DB::transaction()`.
- **Hardcoded Values:** Pakai config atau enum, jangan hardcode string/number.
- **No Validation:** Semua input dari client harus divalidasi.
- **Exposing Secrets:** Jangan commit `.env`, API keys, atau credentials.

---

## 15.9 Testing Checklist

**Before Push:**
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Linter pass.
- [ ] No debug code (dd, console.log).
- [ ] Migration reversible.

**Before Deploy:**
- [ ] All tests pass on CI.
- [ ] Staging tested manually.
- [ ] Database migration reviewed.
- [ ] Rollback plan documented.
- [ ] Monitoring alert configured.

---

## 15.10 Onboarding Checklist

**New Developer:**
- [ ] Clone repository.
- [ ] Setup Docker environment.
- [ ] Run migrations & seeders.
- [ ] Access local app di browser.
- [ ] Run test suite successfully.
- [ ] Read PRD dan architecture docs.
- [ ] Get added to Slack/team channels.
- [ ] Complete first small task (fix typo, add test).

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
