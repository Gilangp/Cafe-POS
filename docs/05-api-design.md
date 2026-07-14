# 5. API Design

**Dokumen:** REST API Design Specification
**Versi:** 1.0.0
**Status:** Baseline
**Base URL:** `/api/v1`

---

## 5.1 Prinsip API

Velvra menyediakan REST API versioned untuk web, mobile, POS, KDS, kiosk, dan integrasi pihak ketiga.

Prinsip:
- Stateless authentication via JWT.
- Semua endpoint protected menerapkan RBAC dan branch scoping.
- Response envelope konsisten.
- Collection endpoint selalu mendukung pagination.
- Order dan payment endpoint wajib idempotent.
- Breaking changes hanya masuk ke versi API baru.

---

## 5.2 Authentication Endpoints

### Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "admin@velvra.test",
  "password": "secret"
}
```

Response:
```json
{
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Admin User",
      "roles": ["super_admin"]
    }
  }
}
```

### Other Auth Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke current token |
| GET | `/auth/me` | Current user profile |
| PATCH | `/auth/me` | Update own profile |

---

## 5.3 Response Format

### Success Object

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-07-13T05:30:00Z",
    "version": "1.0.0"
  }
}
```

### Success Collection

```json
{
  "data": [],
  "links": {
    "first": "/api/v1/orders?page=1",
    "last": "/api/v1/orders?page=10",
    "prev": null,
    "next": "/api/v1/orders?page=2"
  },
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 198
  }
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The given data was invalid.",
    "status_code": 422,
    "details": {},
    "request_id": "uuid"
  }
}
```

---

## 5.4 HTTP Status Usage

| Status | Usage |
|---|---|
| 200 | Successful read/update |
| 201 | Resource created |
| 204 | Successful delete/no body |
| 400 | Invalid business request |
| 401 | Missing/invalid authentication |
| 403 | Insufficient permission |
| 404 | Resource not found |
| 409 | Conflict such as insufficient stock |
| 422 | Validation failure |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

---

## 5.5 Query Patterns

```http
GET /api/v1/orders?page=1&per_page=20
GET /api/v1/orders?status=COMPLETED&branch_id=1
GET /api/v1/menu/items?sort=-created_at,name
GET /api/v1/menu/items?fields=id,name,price_cents
```

Rules:
- Maximum `per_page` is 100.
- `sort=-created_at` means descending.
- Unknown filters should return `422`.

---

## 5.6 User & Branch Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/users` | `users.read` | List users |
| POST | `/users` | `users.create` | Create user |
| GET | `/users/{id}` | `users.read` | User detail |
| PATCH | `/users/{id}` | `users.update` | Update user |
| DELETE | `/users/{id}` | `users.delete` | Soft delete user |
| GET | `/branches` | `branches.read` | List branches |
| POST | `/branches` | `branches.create` | Create branch |
| PATCH | `/branches/{id}` | `branches.update` | Update branch |

---

## 5.7 Menu Endpoints

| Method | Endpoint | Permission |
|---|---|---|
| GET | `/menu/categories` | public |
| POST | `/menu/categories` | `menu.create` |
| PATCH | `/menu/categories/{id}` | `menu.update` |
| DELETE | `/menu/categories/{id}` | `menu.delete` |
| GET | `/menu/items` | public |
| POST | `/menu/items` | `menu.create` |
| GET | `/menu/items/{id}` | public |
| PATCH | `/menu/items/{id}` | `menu.update` |
| DELETE | `/menu/items/{id}` | `menu.delete` |
| PATCH | `/menu/items/{id}/availability` | `menu.update` |

Create menu item payload:
```json
{
  "branch_id": 1,
  "menu_category_id": 3,
  "recipe_id": 8,
  "name": "Iced Latte",
  "slug": "iced-latte",
  "description": "Cold milk coffee with double espresso",
  "price_cents": 38000,
  "is_featured": true,
  "is_available": true
}
```

---

## 5.8 Order Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/orders` | `orders.read` | List orders scoped by role |
| POST | `/orders` | public/authenticated | Create customer order |
| GET | `/orders/{id}` | `orders.read` or owner | Order detail |
| PATCH | `/orders/{id}/status` | `orders.update_status` | Update order state |
| POST | `/orders/{id}/cancel` | `orders.cancel` or owner | Cancel order |
| GET | `/orders/{id}/receipt` | `orders.read` or owner | Receipt PDF |

Create order payload:
```json
{
  "branch_id": 1,
  "member_id": 12,
  "source": "WEB",
  "type": "PICKUP",
  "items": [
    {
      "menu_item_id": 42,
      "quantity": 2,
      "modifiers": [5, 9],
      "notes": "Less sugar"
    }
  ],
  "promo_code": "WELCOME10",
  "payment_method": "CARD"
}
```

Required header:
```http
Idempotency-Key: 0b322e6f-8d50-4a41-9d92-89be9cbd2a4f
```

---

## 5.9 POS & KDS Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/pos/sessions` | `pos.use` | Open POS shift/session |
| POST | `/pos/sessions/{id}/close` | `pos.close` | Close shift |
| POST | `/pos/orders` | `pos.use` | Create in-store order |
| GET | `/pos/summary` | `pos.read` | Shift summary |
| GET | `/kds/orders` | `kds.read` | Active kitchen orders |
| PATCH | `/kds/orders/{id}/accept` | `kds.update` | Start preparing |
| PATCH | `/kds/orders/{id}/ready` | `kds.update` | Mark ready |

---

## 5.10 Inventory & Procurement Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/inventory/items` | `inventory.read` | List stock items |
| POST | `/inventory/items` | `inventory.create` | Create stock item |
| PATCH | `/inventory/items/{id}` | `inventory.update` | Update stock item |
| POST | `/inventory/transactions` | `inventory.adjust` | Manual stock movement |
| GET | `/inventory/low-stock` | `inventory.read` | Low stock list |
| GET | `/suppliers` | `procurement.read` | List suppliers |
| POST | `/purchase-orders` | `procurement.create` | Create purchase order |
| PATCH | `/purchase-orders/{id}/approve` | `procurement.approve` | Approve PO |
| POST | `/purchase-orders/{id}/receive` | `procurement.receive` | Receive goods |

---

## 5.11 Membership, Reservation & CMS Endpoints

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/members` | `members.read` | List members |
| POST | `/members` | `members.create` | Create member |
| GET | `/members/{id}/points` | `members.read` or owner | Point balance |
| POST | `/members/{id}/points/redeem` | `members.redeem` or owner | Redeem points |
| GET | `/reservations/availability` | public | Available slots |
| POST | `/reservations` | public/authenticated | Create reservation |
| PATCH | `/reservations/{id}/status` | `reservations.update` | Update reservation |
| GET | `/cms/pages` | public/CMS | Published pages or admin list |
| POST | `/cms/pages` | `cms.create` | Create page |
| POST | `/cms/pages/{id}/publish` | `cms.publish` | Publish page |
| POST | `/media` | `media.upload` | Upload media |

---

## 5.12 Analytics & Reports

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/analytics/dashboard` | `analytics.read` | Dashboard metrics |
| GET | `/reports/sales` | `reports.sales` | Sales report |
| GET | `/reports/inventory` | `reports.inventory` | Inventory valuation |
| POST | `/reports/export` | `reports.export` | Async export job |
| GET | `/exports/{id}` | `reports.export` | Export status/download |

---

## 5.13 Webhooks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/webhooks/payments/midtrans` | Payment provider notification |
| POST | `/webhooks/payments/stripe` | Stripe notification |
| POST | `/webhooks/delivery/{provider}` | Delivery aggregator status |

Webhook requirements:
- Verify provider signature.
- Be idempotent.
- Never trust unsigned payloads.
- Store raw payload only after masking sensitive fields.

---

## 5.14 Rate Limits

| Context | Limit |
|---|---|
| Public API | 60 requests/minute/IP |
| Login | 5 failed attempts/15 minutes |
| Authenticated user | 300 requests/minute/user |
| POS terminal | 600 requests/minute/terminal |
| Webhooks | 1000 requests/minute/provider IP |

---

## 5.15 OpenAPI

OpenAPI 3.1 documentation must be available at:

```http
GET /api/v1/openapi.json
GET /api/v1/docs
```

The schema must include request DTOs, response DTOs, error formats, auth scheme, pagination, examples, and permission notes.

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
