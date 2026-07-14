# 12. Deployment & DevOps

**Dokumen:** Deployment Architecture & DevOps
**Versi:** 1.0.0
**Status:** Baseline

---

## 12.1 Environment Strategy

| Environment | Purpose | Trigger | Data |
|---|---|---|---|
| **Local** | Development | Manual | Seeder |
| **Dev/Staging** | Integration testing | Auto push to `develop` | Anonymized prod clone |
| **Production** | Live system | Manual via release tag | Real data |

---

## 12.2 Tech Stack Deployment

### Backend (Laravel)

- **Server:** VPS atau managed hosting (DigitalOcean, Hetzner, AWS).
- **Web Server:** Caddy (auto HTTPS) atau Nginx.
- **Process Manager:** Supervisor untuk queue worker.
- **Container:** Docker image dengan PHP 8.3-FPM.

### Frontend (Next.js)

- **Deployment:** Vercel (recommended) atau self-hosted Node.js.
- **Build:** Static untuk marketing pages, SSR untuk admin.
- **CDN:** Cloudflare untuk asset caching.

### Database

- **PostgreSQL:** Managed service (Supabase, Neon, AWS RDS) atau self-hosted.
- **Backup:** Automated daily backup ke S3 dengan retention 30 hari.

### Redis

- **Cache & Queue:** Managed Redis (Upstash, Redis Cloud) atau self-hosted.

---

## 12.3 Docker Compose (Development)

```yaml
version: '3.9'
services:
  app:
    build: .
    volumes:
      - .:/var/www
    environment:
      DB_HOST: postgres
      REDIS_HOST: redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - app

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: velvra
      POSTGRES_USER: velvra
      POSTGRES_PASSWORD: secret

  redis:
    image: redis:7-alpine
```

---

## 12.4 Production Deployment Flow

```
1. Developer push ke branch feature
2. Create Pull Request → CI runs (tests, linter)
3. Merge to `develop` → Auto deploy to staging
4. QA validates staging
5. Create release tag (v1.0.0)
6. Manual approval
7. Deploy to production
8. Run smoke tests
9. Monitor logs & metrics
```

---

## 12.5 CI/CD Pipeline (GitHub Actions)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.3
      - name: Install dependencies
        run: composer install
      - name: Run tests
        run: php artisan test
      - name: Run static analysis
        run: vendor/bin/phpstan analyse
```

---

## 12.6 Zero-Downtime Deployment

**Strategy:**
- Deploy aplikasi baru di folder terpisah.
- Run migration (safe migrations only).
- Symlink atomic swap dari `current` ke `new`.
- Reload PHP-FPM gracefully.
- Rollback via symlink jika gagal.

**Tools:** Deployer, Kamal, atau custom script.

---

## 12.7 Database Migration Strategy

**Safe Migration:**
- Tambah kolom baru (nullable).
- Tambah index (concurrent).
- Tambah tabel baru.

**Unsafe Migration (butuh downtime window):**
- Drop kolom.
- Rename kolom.
- Change data type.

**Rollback:** Setiap migration harus punya method `down()`.

---

## 12.8 Secret Management

- **Local:** `.env` file (not committed).
- **Production:** Environment variables atau secret manager (Vault, AWS Secrets Manager).

**Secrets:**
- `APP_KEY`
- `DB_PASSWORD`
- `JWT_SECRET`
- Payment gateway credentials
- SMTP credentials

**Rotation:** Rotate secrets every 90 days atau saat ada suspect leak.

---

## 12.9 Monitoring & Alerting

**Monitoring Stack:**
- **Errors:** Sentry
- **Logs:** Laravel daily logs → Papertrail/Logtail
- **Uptime:** UptimeRobot
- **APM:** Laravel Telescope (dev), New Relic/Datadog (prod optional)

**Alerting:**
- Error rate > 5% → Slack notification
- Response time p95 > 1s → Email alert
- DB connection pool > 90% → PagerDuty
- Disk usage > 85% → Alert

---

## 12.10 Backup & Recovery

**Database:**
- Automated backup daily via cron.
- Retention: 30 days.
- Storage: S3 Glacier.
- Test restore monthly.

**Files (uploads):**
- S3 versioning enabled.
- Lifecycle policy: move to Glacier after 90 days.

**Code:**
- Git repository (GitHub/GitLab).
- Tags untuk setiap release.

**RTO/RPO:**
- RTO: 4 hours
- RPO: 24 hours (last daily backup)

---

## 12.11 Scaling Strategy

**Vertical (Phase 1):**
- Upgrade server CPU & RAM.
- Optimize queries & caching.

**Horizontal (Phase 2):**
- Load balancer di depan multiple Laravel app servers.
- Redis cluster untuk cache.
- Read replicas untuk database.

**Microservices (Phase 3):**
- Extract Inventory Service.
- Extract Analytics Service.
- API Gateway tetap di monolith.

---

## 12.12 Disaster Recovery Plan

**Scenarios:**

1. **Server down:** Spin up new server, restore dari backup, redirect DNS.
2. **Database corruption:** Restore dari last backup, replay transaction logs jika ada.
3. **Ransomware:** Restore dari immutable S3 backup.
4. **Data center outage:** Failover ke secondary region (Phase 3).

**Runbook:** Documented step-by-step recovery procedure, tested quarterly.

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
