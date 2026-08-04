# CI/CD Pipeline Documentation

> **Sesuai dokumentasi `08_testing_specification.md` §6.4**

## Overview

Pipeline CI/CD otomatis berjalan pada setiap push/PR ke branch `main` atau `develop`. Pipeline menggunakan GitHub Actions dan MySQL 8.0 untuk konsistensi dengan environment production.

## Pipeline Jobs

### 1. Backend Tests (PHPUnit)
- **Runtime:** Ubuntu Latest + PHP 8.3 + MySQL 8.0
- **Database:** `coffee_shop_testing`
- **Steps:**
  1. Checkout code
  2. Setup PHP 8.3 dengan extensions (mbstring, pdo_mysql, bcmath, gd, zip)
  3. Install Composer dependencies
  4. Generate Laravel app key
  5. Run migrations (`php artisan migrate --force`)
  6. Run PHPUnit tests (76 tests, 200 assertions)

### 2. Frontend Tests (Vitest)
- **Runtime:** Ubuntu Latest + Node.js 20
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20 dengan npm cache
  3. Install dependencies (`npm ci`)
  4. Run Vitest (25+ tests)

### 3. Code Linting
- **Backend:** Laravel Pint (PSR-12)
- **Frontend:** ESLint + TypeScript check
- **Steps:**
  1. Backend: `./vendor/bin/pint --test`
  2. Frontend: `npm run lint` + `npm run type-check`

## Status Badge

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/coffee_shop/actions/workflows/ci.yml/badge.svg)
```

## Local Testing (Docker)

### Prerequisites
- Docker & Docker Compose installed
- Git repository cloned

### Run CI Tests Locally

```bash
# Dari root project
docker-compose -f docker-compose.ci.yml up --build

# Atau per service:
docker-compose -f docker-compose.ci.yml up mysql app    # Backend only
docker-compose -f docker-compose.ci.yml up node         # Frontend only

# Cleanup setelah selesai
docker-compose -f docker-compose.ci.yml down -v
```

### Manual Testing

```bash
# Backend
cd backend
composer install
php artisan migrate --env=testing
php vendor/bin/phpunit --testdox

# Frontend
cd frontend
npm ci
npm test
npm run lint
```

## Environment Variables

### Backend (CI)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coffee_shop_testing
DB_USERNAME=root
DB_PASSWORD=root
APP_ENV=testing
```

### Frontend (CI)
```env
NODE_ENV=test
```

## Critical Path Coverage

Pipeline memastikan semua **Critical Path P0 (CP-01...CP-08)** hijau sebelum merge:

| CP | Test Suite | Status |
|---|---|---|
| CP-01 | AuthTest | ✅ |
| CP-02 | RbacTest | ✅ |
| CP-03 | PosTransactionTest | ✅ |
| CP-04 | KdsTest | ✅ |
| CP-05 | PosTransactionTest (stok) | ✅ |
| CP-06 | PosIdempotencyTest | ✅ |
| CP-07 | ReservationTest | ✅ |
| CP-08 | RbacTest (401) | ✅ |

## Troubleshooting

### MySQL Connection Failed
```bash
# Pastikan service MySQL healthy
docker-compose -f docker-compose.ci.yml ps

# Check logs
docker-compose -f docker-compose.ci.yml logs mysql
```

### Backend Tests Failed
```bash
# Masuk ke container
docker-compose -f docker-compose.ci.yml run app bash

# Debug manual
php artisan migrate:fresh --force
php vendor/bin/phpunit --filter TestName
```

### Frontend Tests Failed
```bash
# Masuk ke container
docker-compose -f docker-compose.ci.yml run node sh

# Debug manual
npm test -- --reporter=verbose
```

## Next Steps

- [ ] Setup E2E tests dengan Playwright (target future)
- [ ] Add code coverage reporting
- [ ] Setup staging deployment after CI pass
- [ ] Add performance testing (Lighthouse CI)

## References

- Dokumentasi: `docs/08_testing_specification.md` §6.4
- Docker Compose: `docker-compose.ci.yml`
- GitHub Actions: `.github/workflows/ci.yml`
