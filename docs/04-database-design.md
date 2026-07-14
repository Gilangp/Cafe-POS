# 4. Database Design

**Dokumen:** Database Design Specification
**Versi:** 1.0.0
**Status:** Baseline
**Database:** PostgreSQL 16+

---

## 4.1 Prinsip Database

Velvra menggunakan PostgreSQL sebagai single source of truth untuk data transaksi, operasional, pelanggan, dan konten.

Prinsip utama:
- Semua transaksi kritikal harus ACID-compliant.
- Data operasional multi-branch memakai `branch_id`.
- Semua nilai uang disimpan dalam integer minor unit seperti `price_cents`.
- Timestamp disimpan dalam UTC dan ditampilkan sesuai timezone cabang.
- Soft delete digunakan untuk data bisnis yang perlu audit trail.
- Perubahan penting dicatat dalam `audit_logs`.

---

## 4.2 Konvensi Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| Table | plural snake_case | `menu_items` |
| Column | snake_case | `created_at` |
| Foreign key | `{table_singular}_id` | `branch_id` |
| Pivot | singular alphabetical | `permission_role` |
| Index | `{table}_{columns}_idx` | `orders_branch_id_created_at_idx` |

---

## 4.3 Entity Overview

```
organizations
  └── branches
      ├── users → roles → permissions
      ├── menu_categories → menu_items → recipes
      ├── inventory_items → inventory_transactions
      ├── orders → order_items → payments
      ├── members → loyalty_transactions
      ├── reservations
      └── cms_pages → cms_blocks
```

---

## 4.4 Core Tables

### organizations

```sql
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    legal_name VARCHAR(180),
    default_currency CHAR(3) NOT NULL DEFAULT 'IDR',
    default_timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Jakarta',
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
```

### branches

```sql
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40),
    email VARCHAR(160),
    address_line_1 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Jakarta',
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);
```

---

## 4.5 Auth & RBAC

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(40),
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    scope VARCHAR(40) NOT NULL DEFAULT 'BRANCH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    module VARCHAR(80) NOT NULL,
    action VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_user (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, user_id)
);

CREATE TABLE permission_role (
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (permission_id, role_id)
);
```

---

## 4.6 Menu & Recipe

```sql
CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    parent_id BIGINT NULL REFERENCES menu_categories(id),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    UNIQUE (branch_id, slug)
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    menu_category_id BIGINT NOT NULL REFERENCES menu_categories(id),
    recipe_id BIGINT NULL REFERENCES recipes(id),
    sku VARCHAR(80) UNIQUE,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    description TEXT,
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
    cost_cents BIGINT NOT NULL DEFAULT 0,
    image_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    UNIQUE (branch_id, slug)
);

CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    name VARCHAR(160) NOT NULL,
    yield_quantity DECIMAL(12,3) NOT NULL DEFAULT 1,
    yield_unit VARCHAR(40) NOT NULL DEFAULT 'portion',
    instructions TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    quantity DECIMAL(12,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(40) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4.7 Inventory

```sql
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    sku VARCHAR(80),
    name VARCHAR(160) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(40) NOT NULL,
    current_quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
    reorder_point DECIMAL(14,3) NOT NULL DEFAULT 0,
    reorder_quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
    average_cost_cents BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,
    UNIQUE (branch_id, sku)
);

CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    type VARCHAR(40) NOT NULL,
    quantity DECIMAL(14,3) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    unit_cost_cents BIGINT NOT NULL DEFAULT 0,
    reference_type VARCHAR(80),
    reference_id BIGINT,
    notes TEXT,
    created_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Transaction types: `RECEIVED`, `SOLD`, `ADJUSTMENT_UP`, `ADJUSTMENT_DOWN`, `DAMAGED`, `WASTE`, `RETURNED`.

---

## 4.8 Orders & Payments

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    member_id BIGINT NULL REFERENCES members(id),
    order_number VARCHAR(60) NOT NULL UNIQUE,
    source VARCHAR(40) NOT NULL,
    type VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    subtotal_cents BIGINT NOT NULL DEFAULT 0,
    discount_cents BIGINT NOT NULL DEFAULT 0,
    tax_cents BIGINT NOT NULL DEFAULT 0,
    total_cents BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id),
    name_snapshot VARCHAR(160) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL,
    total_price_cents BIGINT NOT NULL,
    modifiers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    method VARCHAR(40) NOT NULL,
    provider VARCHAR(80),
    provider_transaction_id VARCHAR(160),
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    paid_at TIMESTAMPTZ,
    failure_reason TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4.9 Membership & CMS

```sql
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    user_id BIGINT NULL REFERENCES users(id),
    member_code VARCHAR(80) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    email VARCHAR(160),
    phone VARCHAR(40),
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_spend_cents BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    order_id BIGINT NULL REFERENCES orders(id),
    type VARCHAR(40) NOT NULL,
    points INTEGER NOT NULL,
    description VARCHAR(255),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    meta_title VARCHAR(180),
    meta_description VARCHAR(255),
    status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    created_by BIGINT NULL REFERENCES users(id),
    updated_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE cms_blocks (
    id BIGSERIAL PRIMARY KEY,
    page_id BIGINT NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
    type VARCHAR(80) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    content_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4.10 Audit & Logs

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NULL REFERENCES branches(id),
    user_id BIGINT NULL REFERENCES users(id),
    auditable_type VARCHAR(160) NOT NULL,
    auditable_id BIGINT NOT NULL,
    action VARCHAR(40) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Audit logs are append-only and should not expose update/delete routes.

---

## 4.11 Required Indexes

```sql
CREATE INDEX users_branch_id_idx ON users(branch_id);
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX orders_branch_id_created_at_idx ON orders(branch_id, created_at DESC);
CREATE INDEX orders_member_id_idx ON orders(member_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX inventory_items_branch_id_idx ON inventory_items(branch_id);
CREATE INDEX inventory_transactions_item_created_idx ON inventory_transactions(inventory_item_id, created_at DESC);
CREATE INDEX menu_items_branch_category_idx ON menu_items(branch_id, menu_category_id);
CREATE INDEX audit_logs_auditable_idx ON audit_logs(auditable_type, auditable_id);
CREATE INDEX cms_blocks_content_gin_idx ON cms_blocks USING GIN (content_json);
```

---

## 4.12 Migration Rules

- Migration must be reversible where feasible.
- Avoid destructive production changes without backup.
- Add nullable columns first, backfill, then enforce `NOT NULL`.
- Large indexes should be created concurrently in production.
- Data migrations must be separated from schema migrations if risky.

---

## 4.13 Seed Data

Baseline seeders:
- Organization and default branch
- Roles and permissions
- Admin user
- Menu categories and sample menu items
- Inventory units and ingredients
- Membership tiers
- CMS default pages

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
