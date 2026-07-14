# 6. Security

**Dokumen:** Security Architecture & Controls
**Versi:** 1.0.0
**Status:** Baseline

---

## 6.1 Tujuan Keamanan

Velvra melindungi data pelanggan, karyawan, pembayaran, inventory, dan operasional cabang melalui kontrol berlapis.

Tujuan:
- Mencegah akses tidak sah.
- Menjaga isolasi data antar cabang.
- Melindungi PII pelanggan dan karyawan.
- Menjaga integritas transaksi order, payment, dan inventory.
- Menyediakan audit trail untuk operasi sensitif.
- Mengurangi risiko kebocoran secret dan payment data.

---

## 6.2 Threat Model

| Threat | Risiko | Kontrol |
|---|---|---|
| Credential stuffing | Account takeover | Rate limit, lockout, MFA-ready |
| Broken access control | Data lintas cabang bocor | RBAC, policies, branch scope |
| SQL injection | Data breach | Query binding, validation |
| XSS | Token theft | Escaping, sanitization, CSP |
| CSRF | Unauthorized mutation | SameSite cookie, CSRF token jika cookie auth |
| Payment fraud | Financial loss | Signed webhook, idempotency |
| Inventory tampering | Operational loss | Permission, audit logs |
| Secret leakage | System compromise | Secret management, rotation |

---

## 6.3 Authentication

### JWT

- Access token berlaku 60 menit.
- Refresh token berlaku 30 hari.
- Refresh token harus rotation-based.
- Logout memasukkan token aktif ke Redis blacklist.
- Token memuat user ID, role, branch ID, issued-at, dan expiry.

### Password Policy

- Staff: minimum 12 karakter.
- Customer: minimum 8 karakter.
- Hash menggunakan bcrypt cost 12 atau Argon2id.
- Reset password link berlaku 30 menit.
- 5 failed login attempts memicu lockout 15 menit.

### MFA

MFA disiapkan untuk Phase 2, terutama untuk:
- Super Admin
- Corporate Admin
- Finance
- Branch Manager

---

## 6.4 Authorization

### RBAC

Semua protected endpoint wajib memeriksa permission melalui Laravel Gate/Policy.

Contoh permission:
- `orders.read`
- `orders.cancel`
- `inventory.adjust`
- `reports.export`
- `cms.publish`

### Branch Isolation

User cabang hanya boleh mengakses data dengan `branch_id` yang sesuai. Backend tidak boleh mempercayai `branch_id` dari client tanpa validasi policy.

Exception:
- Super Admin
- Corporate Admin
- Area Manager dengan explicit branch assignment

### Object-Level Policy

```php
public function view(User $user, Order $order): bool
{
    return $user->hasPermission('orders.read')
        && $user->canAccessBranch($order->branch_id);
}
```

---

## 6.5 Input Validation

- Semua request write memakai FormRequest.
- Unknown write fields ditolak.
- Email, phone, slug, dan code dinormalisasi.
- CMS rich text disanitasi dengan allowlist.
- Upload divalidasi berdasarkan MIME, extension, dan ukuran.
- Body size dibatasi di web server dan aplikasi.

---

## 6.6 Data Protection

### PII

Data sensitif:
- Email dan phone pelanggan
- Alamat pelanggan
- Birth date
- Payroll dan employee data
- Banking detail supplier

Kontrol:
- Field sensitif dienkripsi jika perlu.
- PII dibatasi berdasarkan permission.
- Log dan export harus melakukan masking.
- Export PII wajib tercatat di audit log.

### Payment Data

Velvra tidak boleh menyimpan:
- Nomor kartu penuh
- CVV
- Magnetic stripe data
- Raw sensitive payment credentials

Yang boleh disimpan:
- Provider
- Provider transaction ID
- Status pembayaran
- Last four digits jika aman dan diizinkan provider

---

## 6.7 Transport Security

- HTTPS wajib di production.
- HSTS minimum 6 bulan.
- TLS 1.2 minimum, TLS 1.3 preferred.
- Cookie secure memakai `HttpOnly`, `Secure`, dan `SameSite`.
- CORS hanya allowlist origin resmi.

Recommended headers:

```http
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self'
```

---

## 6.8 File Upload Security

Allowed formats:
- JPG
- PNG
- WebP
- SVG hanya jika disanitasi

Kontrol:
- Maksimum 5 MB untuk CMS image.
- Maksimum 20 MB untuk internal media.
- File disimpan di path non-executable.
- Filename dibuat random.
- Metadata image di-strip.
- Virus scanning recommended untuk production.

---

## 6.9 API Security

- Rate limiting per IP, user, dan terminal.
- Request ID untuk tracing.
- Idempotency key untuk order/payment creation.
- Webhook signature verification.
- Strict `Content-Type: application/json` untuk write endpoint.
- Pagination max 100 row per page.

---

## 6.10 Frontend Security

- Hindari localStorage untuk access token browser app jika cookie-based storage memungkinkan.
- Sanitize semua CMS-rendered HTML.
- Escape user-generated content.
- Protect admin route dengan server-side validation.
- Jangan expose permission internal pada public page.
- Dependency scanning dijalankan di CI.

---

## 6.11 Database Security

- Application DB user bukan superuser.
- Least privilege untuk DB role.
- SSL database connection di production.
- Backup terenkripsi at rest.
- Direct DB access dibatasi ke VPN/private network.

---

## 6.12 Audit Logging

Audit wajib untuk:
- User create/update/delete
- Role dan permission changes
- Inventory adjustment
- Order cancellation/refund
- Payment status changes
- Payroll changes
- CMS publish/unpublish
- Data export

Audit log bersifat append-only.

---

## 6.13 Incident Response

| Severity | Contoh | Response Target |
|---|---|---|
| P0 | Active data breach | Immediate |
| P1 | Privilege escalation, major outage | < 1 hour |
| P2 | Isolated account compromise | < 4 hours |
| P3 | Low-risk vulnerability | Next sprint |

Steps:
1. Triage dan konfirmasi.
2. Contain account/system terdampak.
3. Preserve logs dan evidence.
4. Patch atau disable vulnerable component.
5. Rotate secrets.
6. Notify stakeholder sesuai severity.
7. Post-incident review.

---

## 6.14 Security Testing

Required checks:
- Auth bypass tests
- RBAC matrix tests
- Branch isolation tests
- SQL injection checks
- XSS checks untuk CMS
- File upload validation tests
- Webhook signature tests
- Rate limit tests

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
