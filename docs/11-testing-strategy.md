# 11. Testing Strategy

**Dokumen:** Testing Strategy & Quality Assurance
**Versi:** 1.0.0
**Status:** Baseline

---

## 11.1 Testing Philosophy

Testing dilakukan untuk memastikan aplikasi berfungsi sesuai spesifikasi, aman, dan tidak rusak karena perubahan. Tujuan utama:
- Menangkap bug sebelum produksi.
- Validasi alur bisnis kritikal.
- Dokumentasi perilaku sistem lewat test.

---

## 11.2 Testing Pyramid

```
              ┌──────────┐
              │  E2E     │  5%
              └──────────┘
           ┌──────────────┐
           │ Integration  │  15%
           └──────────────┘
       ┌────────────────────┐
       │    Unit Tests      │  80%
       └────────────────────┘
```

---

## 11.3 Unit Testing

**Cakupan:**
- Service logic
- Model method
- Policy/Gate logic
- Helper functions

**Tools:**
- Backend: PHPUnit
- Frontend: Vitest / Jest

**Target Coverage:** 80%+ untuk business logic.

**Contoh:**
```php
// Tests/Unit/Services/OrderServiceTest.php
public function test_order_calculates_total_correctly()
{
    $order = OrderService::create([...]);
    $this->assertEquals(50000, $order->total_cents);
}
```

---

## 11.4 Integration Testing

**Cakupan:**
- API endpoint dengan database nyata.
- Event dan listener.
- Recipe-based inventory deduction.
- Payment workflow.

**Tools:**
- Laravel Feature Tests (PHPUnit)
- Database refresh per test

**Contoh:**
```php
// Tests/Feature/Api/OrderTest.php
public function test_authenticated_user_can_create_order()
{
    $response = $this->actingAs($user)->postJson('/api/v1/orders', [...]);
    $response->assertStatus(201);
}
```

---

## 11.5 E2E Testing

**Cakupan:**
- Critical user flows (order, checkout, payment).
- Halaman admin (create menu, adjust stock).

**Tools:**
- Playwright atau Cypress

**Skenario:**
1. Customer login → browse menu → checkout → payment.
2. Cashier buka POS → input order → bayar → cetak struk.
3. Kitchen staff lihat order baru di KDS → mark ready.

---

## 11.6 RBAC Testing

Setiap endpoint harus diuji:
- ✅ Allowed role dapat akses.
- ❌ Forbidden role mendapat `403`.
- ❌ Guest mendapat `401`.
- ❌ Branch A tidak bisa akses data Branch B.

**Contoh Test Matrix:**

| Endpoint | Super Admin | Branch Mgr | Cashier | Customer |
|---|:---:|:---:|:---:|:---:|
| `GET /orders` | ✅ | ✅ (branch) | ✅ (own) | ✅ (own) |
| `POST /inventory/adjust` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /menu/{id}` | ✅ | ✅ | ❌ | ❌ |

---

## 11.7 Security Testing

- **SQL Injection:** Test dengan payload seperti `' OR 1=1 --`.
- **XSS:** Test dengan `<script>alert('xss')</script>` di CMS input.
- **CSRF:** Pastikan endpoint dengan side-effect memerlukan valid token.
- **Rate Limit:** Verify throttle bekerja.
- **Auth Bypass:** Coba akses protected endpoint tanpa token.

---

## 11.8 Performance Testing

**Load Test:**
- 100 concurrent user membuat order.
- Monitor response time, error rate, server load.

**Stress Test:**
- Tingkatkan load sampai sistem mulai degradasi.
- Catat titik breaking point.

**Tools:** k6, JMeter, Artillery.

---

## 11.9 Manual Testing (QA)

**Checklist:**
- Setiap fitur baru diuji manual sebelum merge.
- Cross-browser testing (Chrome, Safari, Firefox).
- Responsive testing (mobile, tablet, desktop).
- Test payment flow dengan sandbox.
- Test receipt printing di POS.

---

## 11.10 Test Data & Fixtures

- **Seeder:** Buat factory dan seeder untuk test data (user, menu, inventory).
- **Snapshot:** Gunakan database snapshot untuk integration test.
- **Reset:** Setiap test harus independent, reset state sebelum dan sesudah.

---

## 11.11 CI/CD Pipeline Testing

Setiap push ke repository harus:
1. Run unit tests.
2. Run integration tests.
3. Run linter (PHPStan, ESLint).
4. Run security audit (composer audit, npm audit).
5. Generate coverage report.

Jika ada test gagal, deployment otomatis dibatalkan.

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
