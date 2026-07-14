# 7. Roles & Permissions

**Dokumen:** Role-Based Access Control (RBAC)
**Versi:** 1.0.0
**Status:** Baseline

---

## 7.1 Overview

RBAC di Velvra mendefinisikan siapa bisa melakukan apa. Role adalah kumpulan permission yang dapat di-assign ke user.

- **Permissions**: Aksi atomik (e.g., `orders.create`)
- **Roles**: Nama pekerjaan (e.g., `cashier`)
- **Scopes**: Lingkup akses (`SYSTEM`, `ORGANIZATION`, `BRANCH`)

---

## 7.2 System Roles

### Super Admin

- **Scope:** SYSTEM
- **Deskripsi:** Akses penuh ke semua fitur, data, dan konfigurasi. Untuk developer dan system administrator.
- **Permissions:** `*` (semua permission)

### Corporate Admin

- **Scope:** ORGANIZATION
- **Deskripsi:** Mengelola semua cabang dalam satu organisasi. Bisa membuat cabang baru, mengelola user corporate, dan melihat laporan agregat.
- **Permissions:**
  - `branches.*`
  - `users.invite_corporate`
  - `reports.read_aggregate`
  - `cms.manage_global`

---

## 7.3 Branch Roles

### Branch Manager

- **Scope:** BRANCH
- **Deskripsi:** Mengelola operasional satu cabang.
- **Permissions:**
  - `dashboard.read_branch`
  - `orders.read_all`
  - `orders.cancel`
  - `inventory.*`
  - `menu.manage`
  - `users.invite_branch`
  - `pos.manage_sessions`
  - `reports.read_branch`

### Cashier

- **Scope:** BRANCH
- **Deskripsi:** Mengoperasikan POS.
- **Permissions:**
  - `pos.use`
  - `orders.create_pos`
  - `orders.read_own`
  - `members.lookup`

### Kitchen Staff

- **Scope:** BRANCH
- **Deskripsi:** Mengoperasikan KDS.
- **Permissions:**
  - `kds.read`
  - `kds.update`

### Inventory Staff

- **Scope:** BRANCH
- **Deskripsi:** Mengelola stok.
- **Permissions:**
  - `inventory.read`
  - `inventory.adjust`
  - `procurement.read`
  - `procurement.receive`

---

## 7.4 Customer Roles

### Customer

- **Scope:** SYSTEM
- **Deskripsi:** Pengguna terdaftar yang melakukan order.
- **Permissions:**
  - `orders.create_own`
  - `orders.read_own`
  - `profile.manage_own`
  - `reservations.create_own`

### Guest

- **Scope:** SYSTEM
- **Deskripsi:** Pengguna anonim.
- **Permissions:**
  - `menu.read`
  - `branches.read_public`
  - `reservations.check_availability`

---

## 7.5 Permission Matrix

| Module | Action | Super Admin | Corp Admin | Branch Mgr | Cashier | Kitchen | Inventory | Customer |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Users** | `invite_branch` | ✅ | | ✅ | | | | |
| | `invite_corporate` | ✅ | ✅ | | | | | |
| | `reset_password` | ✅ | ✅ | ✅ | | | | |
| **Orders**| `create_pos` | ✅ | | ✅ | ✅ | | | |
| | `create_own` | | | | | | | ✅ |
| | `read_all` | ✅ | | ✅ | | | | |
| | `read_own` | | | | ✅ | | | ✅ |
| | `cancel` | ✅ | | ✅ | | | | ⚠️ |
| **Menu** | `manage` | ✅ | | ✅ | | | | |
| **Inv.** | `adjust` | ✅ | | ✅ | | | ✅ | |
| **KDS** | `read`, `update` | ✅ | | ✅ | | ✅ | | |
| **POS** | `use` | ✅ | | ✅ | ✅ | | | |
| **Reports**|`read_branch`| ✅ | | ✅ | | | | |
| |`read_aggregate`| ✅ | ✅ | | | | | |

⚠️ *Customer bisa cancel ordernya sendiri dalam batas waktu tertentu.*

---

**Document Status:** ✅ Complete
