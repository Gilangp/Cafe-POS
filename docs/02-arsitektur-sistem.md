# 2. Arsitektur Sistem

**Dokumen:** Arsitektur Sistem Velvra
**Versi:** 1.0.0
**Status:** Baseline
**Referensi:** PRD Section 6 - System Architecture

---

## 2.1 Overview Arsitektur

Velvra menggunakan arsitektur **API-First, Decoupled, Monolithic-to-Modular** yang dirancang untuk:
- Memisahkan frontend dan backend secara total melalui REST API
- Mendukung multi-channel consumption (web, mobile, kiosk, POS)
- Memungkinkan evolusi dari monolith ke microservices tanpa refactor total
- Menjamin single source of truth untuk semua data operasional

### 2.1.1 Prinsip Arsitektur

1. **API-First Development**: Semua fitur dirancang sebagai API endpoint sebelum UI
2. **Stateless Backend**: Autentikasi via JWT, tidak ada server session
3. **Event-Driven Modules**: Module berkomunikasi via domain events untuk loose coupling
4. **Database per Logical Domain**: Prepared untuk schema separation di masa depan
5. **Frontend Decoupling**: Multiple frontend apps consume same API contract

---

## 2.2 Technology Stack

### 2.2.1 Backend Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Runtime** | PHP | 8.3+ | LTS, high performance with JIT, enterprise support |
| **Framework** | Laravel | 12.x | Mature ecosystem, built-in auth, queue, cache abstraction |
| **Database** | PostgreSQL | 16.x | ACID compliance, JSON support, full-text search, mature replication |
| **Cache** | Redis | 7.x | Session storage, rate limiting, real-time leaderboards |
| **Queue** | Laravel Queue (Redis driver) | - | Async jobs untuk email, reports, inventory recalc |
| **File Storage** | Local + S3-compatible | - | Local dev, S3/MinIO/R2 production |
| **Search** | PostgreSQL Full-Text | - | MVP search; prepared for Meilisearch/Typesense later |

### 2.2.2 Frontend Stack

| Layer | Technology | Version | Justification |
|---|---|---|---|
| **Framework** | Next.js | 15.x | App Router, RSC, ISR for marketing pages |
| **UI Library** | React | 19.x | Latest concurrent features |
| **Language** | TypeScript | 5.x | Type safety across large codebase |
| **Styling** | Tailwind CSS | 4.x | Utility-first, design system tokens |
| **Component Library** | Radix UI / Headless UI | Latest | Accessible primitives |
| **State Management** | React Query (TanStack Query) | 5.x | Server state caching, optimistic updates |
| **Forms** | React Hook Form + Zod | Latest | Performance, validation schema |
| **Charts** | Recharts / Tremor | Latest | Analytics dashboards |

### 2.2.3 DevOps & Infrastructure

| Layer | Technology | Justification |
|---|---|---|
| **Containerization** | Docker + Docker Compose | Local dev parity, easy deployment |
| **Web Server** | Caddy / Nginx | Auto HTTPS, reverse proxy |
| **Process Manager** | Supervisor | Queue workers, scheduler |
| **CI/CD** | GitHub Actions / GitLab CI | Automated testing, deployment |
| **Monitoring** | Laravel Telescope + Sentry | Dev debugging + production error tracking |
| **Logging** | Laravel Log (daily files) | Structured JSON logs |

---

## 2.3 Arsitektur Lapisan (Layered Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Next.js Apps (Marketing, Customer Portal, Admin, CMS UI)   │
│           Konsumsi API via HTTP Client (Axios/Fetch)         │
└─────────────────────────────────────────────────────────────┘
                              ▼ HTTPS / JWT
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│   Laravel Router + Middleware (Auth, CORS, Rate Limit)      │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  Controllers → Service Classes → Repositories               │
│  (Business Logic, Validation, Authorization)                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│   Models, Policies, Events, Observers, DTOs                 │
│   (Core business entities dan rules)                        │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│   Database (PostgreSQL), Cache (Redis), Queue, Storage      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3.1 Presentation Layer (Frontend)

**Tanggung Jawab:**
- Rendering UI components
- User input validation (client-side)
- State management (local + server cache)
- Route handling dan navigation
- Asset optimization (images, fonts, bundles)

**Komunikasi:**
- REST API calls dengan JWT di Authorization header
- Tidak ada direct database access
- Semua business logic di backend

**Deployment:**
- Static generation untuk marketing pages (ISR/SSG)
- Server-side rendering untuk dynamic content (SSR)
- Client-side rendering untuk admin dashboards (SPA)

### 2.3.2 API Gateway Layer

**Tanggung Jawab:**
- Request routing
- Authentication (JWT validation)
- Authorization (Gate checks)
- Rate limiting
- CORS handling
- Request/response transformation
- API versioning (`/api/v1/...`)

**Laravel Middleware Stack:**
```
api.php routes:
├── ThrottleRequests (rate limit per user/IP)
├── HandleCors
├── AuthenticateWithJWT (custom)
├── EnsureEmailIsVerified (selective routes)
├── CheckUserRole (RBAC enforcement)
└── LogApiAccess (audit trail)
```

### 2.3.3 Application Layer

**Tanggung Jawab:**
- Business logic orchestration
- Transaction management
- Event dispatching
- Input validation (server-side)
- DTO transformation
- Error handling

**Pattern:**
```php
Controller (thin)
  → Request validation (FormRequest)
  → Service class (business logic)
    → Repository (data access)
    → Event dispatch
  → Resource transformation (API response)
```

**Contoh:**
```
OrderController::store()
  → StoreOrderRequest::validated()
  → OrderService::createOrder(OrderDTO)
    → InventoryService::checkStock()
    → OrderRepository::create()
    → PaymentService::processPayment()
    → event(OrderCreated)
  → OrderResource::make($order)
```

### 2.3.4 Domain Layer

**Tanggung Jawab:**
- Core business entities (Eloquent Models)
- Domain events dan listeners
- Policy classes (authorization rules)
- Value objects (Money, Address, etc.)
- Business rules enforcement

**Struktur:**
```
app/Models/           → Eloquent models
app/Events/           → Domain events
app/Listeners/        → Event handlers
app/Policies/         → Authorization policies
app/ValueObjects/     → Immutable value objects
app/Enums/            → PHP 8.3 enums
```

### 2.3.5 Infrastructure Layer

**Tanggung Jawab:**
- Database transactions
- Cache operations
- Queue job dispatch
- File storage operations
- External API calls (payment gateways, SMS)
- Logging dan monitoring

---

## 2.4 Modular Monolith Structure

Aplikasi diorganisir dalam **bounded contexts** yang bisa di-extract menjadi services terpisah di masa depan.

### 2.4.1 Core Modules

```
app/
├── Modules/
│   ├── Auth/              → Authentication, user management
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   └── routes.php
│   │
│   ├── POS/               → Point of Sale
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   └── Events/
│   │
│   ├── Inventory/         → Stock, recipes, procurement
│   │   ├── Services/
│   │   │   ├── StockService.php
│   │   │   ├── RecipeService.php
│   │   │   └── ProcurementService.php
│   │   └── Listeners/
│   │       └── DeductStockOnOrder.php
│   │
│   ├── Membership/        → CRM, loyalty, tiers
│   ├── Menu/              → Products, categories, modifiers
│   ├── KDS/               → Kitchen Display System
│   ├── Reservation/       → Table booking
│   ├── Event/             → Event management
│   ├── HR/                → Workforce, attendance, payroll
│   ├── CMS/               → Content management
│   ├── Analytics/         → Reports, dashboards
│   └── Notification/      → Email, SMS, push
```

### 2.4.2 Module Communication

**Prinsip:**
- Modules TIDAK boleh direct dependency antar service classes
- Komunikasi via **domain events** (Laravel Event system)
- Shared data via **repository interfaces** atau **API internal**

**Contoh Flow:**
```
POS Module → OrderCreated event dispatched
  ↓
Inventory Module → Listener: DeductStockOnOrder
  ↓
Notification Module → Listener: SendOrderConfirmation
  ↓
Analytics Module → Listener: RecordSaleMetric
```

**Keuntungan:**
- Loose coupling
- Easy testing (mock events)
- Prepared untuk message queue (RabbitMQ/SQS) di masa depan

---

## 2.5 Database Architecture

### 2.5.1 Single Database, Logical Separation

**Approach:** Monolithic database dengan naming convention untuk bounded contexts

```sql
-- Auth & User Management
users, roles, permissions, role_user, permission_role

-- POS & Orders
orders, order_items, payments, refunds

-- Inventory
inventory_items, inventory_transactions, recipes, recipe_ingredients

-- Menu
menu_categories, menu_items, menu_item_modifiers, modifier_groups

-- Membership
members, membership_tiers, loyalty_points, rewards

-- CMS
cms_pages, cms_blocks, cms_menus, media_library

-- Analytics (aggregated tables)
daily_sales_summary, monthly_inventory_reports
```

**Future Path:**
- Phase 2: Schema separation (`auth_schema`, `inventory_schema`, dll)
- Phase 3: Database per service (PostgreSQL multi-database)

### 2.5.2 Multi-Tenancy Strategy

**Approach:** Multi-branch via `branch_id` column (Shared Database, Shared Schema)

**Rationale:**
- Simpler untuk MVP (< 100 branches)
- Single deployment
- Cross-branch reporting tetap mudah

**Implementation:**
```php
// Global scope di base model
protected static function booted() {
    static::addGlobalScope('branch', function (Builder $builder) {
        if (auth()->user()?->branch_id) {
            $builder->where('branch_id', auth()->user()->branch_id);
        }
    });
}
```

**Future:**
- 100+ branches → Database per tenant
- International expansion → Region-based database sharding

---

## 2.6 API Architecture

### 2.6.1 RESTful API Design

**Versioning:**
```
/api/v1/...  → Current stable version
/api/v2/...  → Future breaking changes
```

**Structure:**
```
GET    /api/v1/menu/items           → List menu items
GET    /api/v1/menu/items/{id}      → Get single item
POST   /api/v1/menu/items           → Create item (admin)
PUT    /api/v1/menu/items/{id}      → Update item
DELETE /api/v1/menu/items/{id}      → Soft delete

GET    /api/v1/orders                → List orders (filtered by role)
POST   /api/v1/orders                → Create order
GET    /api/v1/orders/{id}/receipt  → Download receipt PDF
```

**Response Format:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-13T05:20:00Z",
    "version": "1.0.0"
  },
  "links": {
    "self": "/api/v1/orders/123",
    "related": "/api/v1/orders/123/items"
  }
}
```

**Error Format:**
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough stock for Espresso Shot",
    "details": {
      "item_id": 42,
      "requested": 5,
      "available": 3
    }
  }
}
```

### 2.6.2 Authentication Flow

**JWT-Based:**
```
1. POST /api/v1/auth/login
   → Return: { "token": "...", "refresh_token": "..." }

2. Subsequent requests:
   Header: Authorization: Bearer {token}

3. Token expiry: 1 hour (access), 30 days (refresh)

4. POST /api/v1/auth/refresh
   → Return new access token
```

**Security:**
- HTTPS only (redirect HTTP)
- Token stored in HttpOnly cookie (web) atau secure storage (mobile)
- Rate limiting: 5 failed logins → 15 min lockout

---

## 2.7 Caching Strategy

### 2.7.1 Cache Layers

| Layer | Technology | Use Case | TTL |
|---|---|---|---|
| **Application Cache** | Redis | Query results, computed data | 5-60 min |
| **HTTP Cache** | Browser + CDN | Static assets, public pages | 1 year (assets), 5 min (pages) |
| **Database Cache** | PostgreSQL shared buffers | Hot data in RAM | Managed by PG |
| **Object Cache** | Redis | Eloquent model cache | 15 min |

### 2.7.2 Cache Invalidation Strategy

**Pattern:**
```php
// Cache key naming
"menu:items:all:branch:{branch_id}"
"inventory:stock:{item_id}"
"member:points:{member_id}"

// Invalidation on write
OrderService::createOrder() {
    // ...create order...
    Cache::tags(['orders', 'inventory'])->flush();
}
```

**Cache Warming:**
- Menu data di-load saat app boot (Service Provider)
- Hot inventory items di-cache via scheduled job every 5 menit

---

## 2.8 Queue & Async Processing

### 2.8.1 Queue Architecture

**Queue Driver:** Redis

**Queue Types:**
```php
// config/queue.php
'connections' => [
    'high' => [...],      // Payment processing, order confirmation
    'default' => [...],   // Email, notifications
    'low' => [...],       // Report generation, data export
]
```

**Worker Scaling:**
```
Production:
- High priority: 4 workers
- Default: 2 workers  
- Low: 1 worker

Monitored via Supervisor + Laravel Horizon (optional)
```

### 2.8.2 Async Use Cases

- **Email/SMS:** Order confirmation, password reset, marketing
- **Reports:** Daily sales, inventory valuation, payroll
- **Data Export:** CSV/Excel download untuk large datasets
- **Image Processing:** Thumbnail generation, compression
- **Inventory Recalculation:** Aggregate stock dari multi-branch

---

## 2.9 Real-Time Features

### 2.9.1 Technology Choice

**Approach:** Laravel Broadcasting + Pusher / Soketi (self-hosted)

**Rationale:**
- Laravel native integration
- Fallback ke polling jika WebSocket unavailable
- Cheaper than third-party (Pusher free tier limited)

### 2.9.2 Real-Time Use Cases

| Feature | Channel | Event |
|---|---|---|
| **KDS Live Orders** | `branch.{id}.kitchen` | `OrderReceived`, `OrderCompleted` |
| **POS Inventory Alert** | `branch.{id}.pos` | `LowStockAlert` |
| **Admin Dashboard** | `admin.metrics` | `SalesUpdated` |
| **Customer Order Status** | `order.{id}` | `StatusChanged` |

**Implementation:**
```php
// Backend
broadcast(new OrderReceived($order))->toOthers();

// Frontend (Next.js)
const channel = pusher.subscribe(`branch.${branchId}.kitchen`);
channel.bind('OrderReceived', (data) => {
    // Update UI
});
```

---

## 2.10 Security Architecture

### 2.10.1 Defense Layers

```
┌─────────────────────────────────────────┐
│  WAF / DDoS Protection (Cloudflare)     │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  Rate Limiting (API Gateway)            │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  Authentication (JWT Validation)        │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  Authorization (RBAC + Policies)        │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  Input Validation (FormRequests)        │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  SQL Injection Protection (Eloquent)    │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  Audit Logging (All mutations tracked)  │
└─────────────────────────────────────────┘
```

### 2.10.2 Key Security Measures

**Authentication:**
- JWT with short expiry (1 hour)
- Refresh token rotation
- Blacklist pada logout (Redis set)

**Authorization:**
- RBAC via Laravel Gates & Policies
- Row-level security (branch_id enforcement)
- Explicit permission checks di setiap sensitive operation

**Data Protection:**
- Passwords: bcrypt (cost 12)
- PII encryption: Laravel encrypted casts
- Payment data: NEVER stored (token only)

**Network:**
- HTTPS enforced (HSTS header)
- CORS whitelist (only known frontends)
- Rate limiting: 60 req/min per user, 10 req/min per IP (unauthenticated)

---

## 2.11 Monitoring & Observability

### 2.11.1 Monitoring Stack

| Aspect | Tool | Metrics |
|---|---|---|
| **Application Performance** | Laravel Telescope (dev), Sentry (prod) | Response time, memory usage, DB queries |
| **Error Tracking** | Sentry | Exceptions, stack traces, breadcrumbs |
| **Log Aggregation** | Laravel Log → daily files | Structured JSON logs |
| **Uptime** | UptimeRobot / Pingdom | HTTP health checks, alerting |
| **Infrastructure** | Server monitoring (optional) | CPU, RAM, disk, network |

### 2.11.2 Health Check Endpoint

```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-07-13T05:20:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok",
    "storage": "ok"
  },
  "version": "1.0.0"
}
```

**Usage:**
- Load balancer health check
- Monitoring service polling (every 1 min)
- Pre-deployment validation

---

## 2.12 Scalability Path

### 2.12.1 Vertical Scaling (Phase 1)

**Current Capacity:**
- Single Laravel app server (4 CPU, 8GB RAM)
- Single PostgreSQL server (8GB RAM, SSD)
- Redis co-located atau managed service

**Scale Triggers:**
- Response time > 500ms (p95)
- CPU > 70% sustained
- DB connections > 80% pool

**Actions:**
- Upgrade server specs (8 CPU, 16GB RAM)
- Enable query caching aggressively
- Add read replicas untuk reporting queries

### 2.12.2 Horizontal Scaling (Phase 2)

**Load Balancer:**
```
         Nginx / Caddy (Load Balancer)
                  ▼
    ┌─────────────┴─────────────┐
    ▼                           ▼
Laravel App 1              Laravel App 2
    │                           │
    └───────────┬───────────────┘
                ▼
         PostgreSQL Primary
                ▼
         Read Replicas (2x)
```

**Stateless Requirements:**
- JWT (no server session)
- Redis untuk shared cache
- S3 untuk file storage (no local disk)

### 2.12.3 Microservices Migration (Phase 3)

**Extraction Candidates:**
1. **Inventory Service** (high write load, isolated domain)
2. **Analytics Service** (read-heavy, separate database)
3. **Notification Service** (async, external dependencies)

**Strategy:**
- Keep monolith as API gateway
- Extract service dengan database sekaligus
- Inter-service communication via HTTP atau message queue

---

## 2.13 Deployment Architecture

### 2.13.1 Environment Tiers

| Environment | Purpose | Deployment Trigger | Data |
|---|---|---|---|
| **Local** | Developer workstation | Manual | Seed data |
| **Dev** | Integration testing | Push ke `develop` branch | Anonymized prod data |
| **Staging** | Pre-production QA | Push ke `staging` branch | Copy of production |
| **Production** | Live system | Manual deploy (GitHub Release) | Real data |

### 2.13.2 Infrastructure Layout (Production)

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│           (DDoS protection, SSL termination)            │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx/Caddy (Reverse Proxy)                │
│          - Static asset serving                         │
│          - Rate limiting                                │
└─────────────────────────────────────────────────────────┘
                         ▼
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│   Laravel App    │            │   Next.js App    │
│   (API Server)   │            │   (SSR/Static)   │
│   + Queue Workers│            │                  │
└──────────────────┘            └──────────────────┘
        │                                  │
        └────────────────┬─────────────────┘
                         ▼
        ┌────────────────┴────────────────┐
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│   PostgreSQL     │            │      Redis       │
│   (Primary)      │            │   (Cache/Queue)  │
└──────────────────┘            └──────────────────┘
        │
        ▼
┌──────────────────┐
│   S3-Compatible  │
│   Storage (R2)   │
└──────────────────┘
```

### 2.13.3 Container Strategy

**Docker Compose (Development):**
```yaml
services:
  app:
    image: php:8.3-fpm
    volumes: [./:/var/www]
  
  nginx:
    image: nginx:alpine
    depends_on: [app]
  
  postgres:
    image: postgres:16-alpine
  
  redis:
    image: redis:7-alpine
  
  nextjs:
    build: ./frontend
    environment: [NEXT_PUBLIC_API_URL]
```

**Production:**
- Docker images di-build via CI/CD
- Deploy ke VPS atau managed container service (Kamal, Coolify)
- Secrets management via environment variables atau Vault

---

## 2.14 Disaster Recovery

### 2.14.1 Backup Strategy

| Data | Frequency | Retention | Storage |
|---|---|---|---|
| **Database** | Daily (automated) | 30 days | S3 Glacier |
| **User-uploaded files** | Continuous (S3 versioning) | 90 days | S3 bucket |
| **Application code** | Every commit | Infinite | Git repository |
| **Configuration** | On change | Infinite | Infrastructure as Code repo |

### 2.14.2 Recovery Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours (last daily backup)

**Critical Failure Scenarios:**
1. Database corruption → Restore dari last backup
2. Ransomware → Restore dari immutable S3 backup
3. Server hardware failure → Rebuild di server baru (< 2 jam dengan IaC)
4. Regional outage → Manual failover ke backup region (Phase 3)

---

## 2.15 Technology Decision Log

| Decision | Options Considered | Choice | Rationale |
|---|---|---|---|
| **Backend Framework** | Laravel, Symfony, NestJS | Laravel | Maturity, ecosystem, RAD, team expertise |
| **Frontend Framework** | Next.js, Nuxt, SvelteKit | Next.js | React ecosystem, Vercel DX, RSC |
| **Database** | PostgreSQL, MySQL, MongoDB | PostgreSQL | ACID, JSON support, full-text search |
| **Auth Strategy** | Session, JWT, OAuth2 | JWT | Stateless, multi-channel support |
| **Real-time** | WebSocket (raw), Pusher, Socket.io | Laravel Broadcasting + Soketi | Native Laravel integration, cost |
| **Deployment** | Kubernetes, Kamal, PM2 | Kamal (Rails-inspired) | Simplicity untuk monolith, Docker-based |
| **Monitoring** | New Relic, Datadog, Sentry | Sentry | Cost-effective, Laravel integration |

---

## 2.16 Constraints & Assumptions

### 2.16.1 Constraints

- **Budget:** Bootstrap-friendly stack (no expensive licenses atau SaaS lock-in)
- **Team:** Small team (2-3 devs), prefer batteries-included frameworks
- **Timeline:** MVP dalam 3-4 bulan
- **Compliance:** No specific regulatory requirements (GDPR-ready, not mandatory yet)

### 2.16.2 Assumptions

- Traffic: < 10,000 daily active users di Year 1
- Branches: < 20 branches di MVP, < 100 di Year 2
- Data volume: < 10GB database size di Year 1
- Availability: 99.5% uptime acceptable (< 4 hours downtime/month)

### 2.16.3 Batasan Rilis v1.0 & Preparedness Architecture

- **No Native Mobile Apps di v1.0:** Rilis awal difokuskan pada aplikasi web responsif dan PWA; API telah sepenuhnya disiapkan (`API ready`) untuk native apps iOS/Android pada fase berikutnya sesuai PRD §2.4.
- **Offline-First Bounded Resilience (POS & KDS):** Aplikasi POS fisik di toko **wajib mendukung offline mode sementara** (*bounded window via IndexedDB local queue*) dan sinkronisasi saat re-connect (`POS-002`). KDS mendukung *local buffering/graceful degradation* dalam jaringan lokal toko (`KDS-005`). Untuk modul web manajemen lainnya (Admin, CMS, Portal) memerlukan konektivitas penuh.
- **Multi-Branch & Multi-Currency Foundation:** Arsitektur database dan API sejak awal dirancang mendukung *multi-branch, multi-currency, dan multi-timezone* (`§1.2` & `§6.1`), dengan konfigurasi mata uang default tahap awal menggunakan IDR.
- **Localization Framework (i18n-ready):** Platform disiapkan dengan kerangka kerja i18n sejak Sprint 0, dengan lokalisasi awal mencakup Bahasa Inggris dan Bahasa Indonesia (`§3.1`).

---

## 2.17 Appendix: Diagram Conventions

**Legend:**
```
┌────────┐
│  Box   │  → System component
└────────┘

──────▶   → Synchronous call (HTTP, function call)
······▶   → Asynchronous message (event, queue)
═════▶    → Data flow
```

**Color Coding (jika rendered):**
- Blue: External services
- Green: User-facing applications
- Orange: Internal services
- Red: Data stores

---

**Document Status:** ✅ Complete
**Next Document:** [03-desain-sistem.md](./03-desain-sistem.md)
**Related:** [prd.md Section 6](./prd.md), [04-database-design.md](./04-database-design.md)
