# 3. Desain Sistem

**Dokumen:** System Design Specification
**Versi:** 1.0.0
**Status:** Baseline
**Referensi:** PRD Section 7 - Information Architecture

---

## 3.1 High-Level System Flows

### 3.1.1 Customer Order Flow (End-to-End)

```
CUSTOMER (Web/Mobile)
    ↓
1. Browse Menu
    → GET /api/v1/menu/items (cached, filtered by branch)
    ↓
2. Add to Cart
    → POST /api/v1/cart/items (Redis session)
    ↓
3. Checkout
    → POST /api/v1/orders (validation, inventory check)
    ↓ (Success)
    → emit: OrderCreated event
    ↓
INVENTORY MODULE
    → Listener: DeductStockOnOrder
    → Check recipe ingredients, deduct from inventory
    ↓
NOTIFICATION MODULE
    → Listener: SendOrderConfirmation
    → Send email/SMS to customer & branch
    ↓
KDS (Kitchen Display System)
    → Real-time update via WebSocket
    → Chef sees order on display
    ↓
CUSTOMER (receives notification)
    → Order status: CONFIRMED → PREPARING → READY → COMPLETED
```

### 3.1.2 POS Terminal Flow

```
POS OPERATOR (In-Store Kiosk)
    ↓
1. Start Transaction
    → GET /api/v1/pos/session (verify terminal identity)
    ↓
2. Scan Item / Manual Entry
    → GET /api/v1/menu/items/{id}
    → Verify stock in real-time
    ↓
3. Apply Discount / Promo
    → POST /api/v1/orders/validate-promo
    → Check member tier eligibility
    ↓
4. Process Payment
    → POST /api/v1/payments
    → Integrated with payment gateway
    ↓ (Success)
    → emit: OrderCreated event
    ↓
5. Receipt
    → GET /api/v1/orders/{id}/receipt (PDF generation)
```

### 3.1.3 Inventory Management Flow

```
INVENTORY OFFICER (Admin Dashboard)
    ↓
1. View Stock
    → GET /api/v1/inventory/items (filter by branch, category)
    ↓
2. Manual Adjustment
    → POST /api/v1/inventory/transactions
    → Reason: CORRECTION, DAMAGE, USAGE, RECEIVED
    ↓ (logged for audit)
    ↓
3. Create Purchase Order
    → POST /api/v1/procurement/orders
    → Select vendor, items, quantity
    ↓ (auto-calculate cost)
    ↓
4. Receive Goods
    → POST /api/v1/procurement/orders/{id}/receive
    → Match PO, scan barcodes
    ↓ (inventory updated)
    ↓
5. Generate Valuation Report
    → GET /api/v1/reports/inventory-valuation
    → FIFO/LIFO costing per item
```

---

## 3.2 Module Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  Marketing Site │ Customer Portal │ Admin Dashboard │ CMS   │
└──────────────────────────────────────────────────────────────┘
                              ▼ API Calls
┌──────────────────────────────────────────────────────────────┐
│                    API LAYER (Laravel)                       │
│  Auth │ POS │ Inventory │ Membership │ Menu │ KDS │ Reports  │
└──────────────────────────────────────────────────────────────┘
                         ▼ Events
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
│ Inventory   │  │ Notification│  │ Analytics        │
│ Service     │  │ Service     │  │ Service          │
│             │  │             │  │                  │
│ - Stock     │  │ - Email     │  │ - Track metrics  │
│ - Recipes   │  │ - SMS       │  │ - Generate       │
│ - Costing   │  │ - Push      │  │   reports        │
└─────────────┘  └─────────────┘  └──────────────────┘
    ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  PostgreSQL │ Redis Cache │ S3 Storage │ Email Queue        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.3 Data Flow Diagrams

### 3.3.1 Order Processing Pipeline

```
INPUT:
├─ Order creation request (customer/POS)
├─ Items list with quantities
└─ Discount/promo codes

PROCESSING STEPS:
1. Validate Request
   ├─ Check auth (JWT)
   ├─ Verify branch_id matches
   └─ Validate order items exist & are available

2. Check Inventory
   ├─ For each item, check recipe
   ├─ For each ingredient, check available stock
   └─ Reserve stock (pessimistic lock)

3. Calculate Cost
   ├─ Item prices (base + modifiers)
   ├─ Apply discounts (promo, member tier)
   ├─ Calculate tax (branch-specific)
   └─ Calculate delivery fee (if applicable)

4. Process Payment
   ├─ Call payment gateway API (Stripe/Midtrans)
   ├─ Tokenize (never store card)
   └─ Return transaction ID or error

5. Persist Order
   ├─ Create Order record
   ├─ Create OrderItems records
   ├─ Create Payment record
   └─ Deduct inventory in transaction

6. Emit Events
   ├─ OrderCreated
   ├─ PaymentProcessed
   ├─ InventoryDeducted
   └─ NotificationTriggered

7. Return Response
   ├─ Order ID
   ├─ Receipt URL
   └─ Estimated fulfillment time

OUTPUT:
├─ Order created (status: CONFIRMED)
├─ Stock reduced
├─ Notification queued
├─ Real-time KDS update
└─ Customer notification sent
```

### 3.3.2 Recipe-Based Stock Deduction

```
TRIGGER: OrderCreated event

INPUT: Order with items
  [
    { menu_item_id: 42, quantity: 2, modifiers: [10, 15] },
    { menu_item_id: 53, quantity: 1, modifiers: [] }
  ]

PROCESSING:
1. For each OrderItem:
   ├─ Lookup MenuItem → get recipe_id
   ├─ Lookup Recipe → get ingredients list
   │  [
   │    { ingredient_id: 5, quantity: 10, unit: 'grams' },
   │    { ingredient_id: 8, quantity: 50, unit: 'ml' }
   │  ]
   └─ Apply quantity multiplier

2. For each Ingredient in Recipe:
   ├─ Calculate total needed: ingredient.quantity * order_item.quantity
   ├─ Lookup current inventory
   ├─ Deduct from stock
   ├─ Create InventoryTransaction record
   └─ Check if below reorder point
     └─ If yes: emit LowStockAlert event

3. Update Metrics:
   ├─ Increment item_sold count
   ├─ Update branch daily_sales
   └─ Update member loyalty_points

OUTPUT:
├─ All ingredients deducted atomically
├─ Audit trail recorded
├─ Alerts triggered if needed
└─ Real-time metrics updated
```

---

## 3.4 State Machine Definitions

### 3.4.1 Order Lifecycle States

```
                    ┌─────────────┐
                    │   PENDING   │
                    │  (created)  │
                    └──────┬──────┘
                           │ payment_confirmed
                           ▼
                    ┌─────────────┐
        ┌──────────▶│ CONFIRMED   │◀──────────┐
        │           │ (ready for  │           │
        │           │  kitchen)   │           │
        │           └──────┬──────┘           │
        │                  │ prep_started     │
        │ cancel           ▼                  │ reschedule
        │           ┌─────────────┐           │
        │           │ PREPARING   │───────────┤
        │           │ (KDS active)│           │
        │           └──────┬──────┘           │
        │                  │ prep_complete    │
        │                  ▼                  │
        │           ┌─────────────┐           │
        │───────────│ READY       │           │
        │           │ (pickup/    │           │
        │           │  delivery)  │           │
        │           └──────┬──────┘           │
        │                  │ pickup_confirmed
        │                  ▼
        │           ┌─────────────┐
        │           │ COMPLETED   │
        │           │ (delivered) │
        │           └─────────────┘
        │
        └─────────────── cancel
                        └─ CANCELLED
                           (refund issued)
```

**State Transitions & Rules:**
- PENDING → CONFIRMED: Payment confirmed
- CONFIRMED → PREPARING: Chef accepts order
- PREPARING → READY: All items prepared
- READY → COMPLETED: Customer confirms pickup/delivery
- [ANY] → CANCELLED: User cancels (before COMPLETED)
- CANCELLED → [refund queue]

### 3.4.2 Inventory Transaction Types

```
INCOMING:
├─ RECEIVED: Goods received from supplier (PO)
├─ RETURNED: Returned from customer
└─ ADJUSTMENT_UP: Recount/correction

OUTGOING:
├─ SOLD: Deducted from order
├─ ADJUSTMENT_DOWN: Recount/correction
├─ DAMAGED: Item damaged/expired
└─ WASTE: Cook/training waste

TRACKING:
├─ Timestamp
├─ Type
├─ Quantity
├─ Unit
├─ Reference (Order ID / PO ID / Manual note)
├─ User ID (who made transaction)
└─ Branch ID
```

---

## 3.5 Cache Strategy

### 3.5.1 Cache Keys & TTLs

```php
// Menu (rarely changes)
"menu:items:all:branch:{branch_id}" → 1 hour
"menu:item:{item_id}:detail" → 1 hour
"menu:categories:branch:{branch_id}" → 1 hour

// Inventory (frequently reads, moderately changes)
"inventory:stock:{item_id}" → 5 minutes
"inventory:stock:branch:{branch_id}" → 5 minutes
"inventory:reorder:branch:{branch_id}" → 15 minutes

// Member (changes on profile update)
"member:{member_id}:profile" → 30 minutes
"member:{member_id}:points" → 10 minutes
"member:{member_id}:tier" → 30 minutes

// Promo/Discount (rarely changes)
"promo:active:branch:{branch_id}" → 1 hour
"promo:codes:all" → 4 hours

// Reports (cached computations)
"report:daily_sales:branch:{branch_id}:date:{date}" → 1 day
"report:inventory_valuation:branch:{branch_id}" → 4 hours
```

### 3.5.2 Cache Invalidation Events

```php
// When to flush
MenuItem::updated() → flush "menu:*"
InventoryItem::updated() → flush "inventory:stock:{id}"
Member::updated() → flush "member:{id}:*"
OrderCreated → flush "inventory:stock:*", "report:daily_sales:*"
PromoCode::updated() → flush "promo:*"

// Pattern: Tag-based invalidation
Cache::tags(['menu', 'branch:1'])->flush()
Cache::tags(['inventory'])->flush()
```

---

## 3.6 Error Handling Strategy

### 3.6.1 Error Classification

```
CLIENT ERRORS (4xx):
├─ 400 Bad Request: Invalid input format
├─ 401 Unauthorized: Missing/invalid JWT
├─ 403 Forbidden: Authenticated but insufficient permissions
├─ 404 Not Found: Resource doesn't exist
├─ 409 Conflict: Stock not available / duplicate entry
└─ 429 Too Many Requests: Rate limit exceeded

SERVER ERRORS (5xx):
├─ 500 Internal Server Error: Unhandled exception
├─ 502 Bad Gateway: Upstream service unavailable
├─ 503 Service Unavailable: Database/Redis down
└─ 504 Gateway Timeout: Payment gateway slow

BUSINESS ERRORS (returned in 200/400):
├─ INSUFFICIENT_STOCK
├─ PROMO_NOT_APPLICABLE
├─ MEMBER_TIER_MISMATCH
├─ PAYMENT_DECLINED
├─ DUPLICATE_ORDER_DETECTED
└─ BRANCH_OPERATION_HOURS_CLOSED
```

### 3.6.2 Error Response Format

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough Espresso Shot available",
    "status_code": 409,
    "details": {
      "item_id": 42,
      "item_name": "Espresso Shot",
      "requested": 5,
      "available": 3,
      "unit": "portions"
    },
    "timestamp": "2026-07-13T05:30:00Z",
    "request_id": "uuid-for-tracking"
  }
}
```

---

## 3.7 Transaction Management

### 3.7.1 ACID Compliance

**Critical Transactions:**
```php
DB::transaction(function () {
    // 1. Create order record
    $order = Order::create([...]);
    
    // 2. Create order items
    OrderItem::insert($items);
    
    // 3. Deduct inventory (must succeed or roll back all)
    foreach ($items as $item) {
        $this->inventoryService->deductStock($item);
    }
    
    // 4. Record payment
    Payment::create([...]);
    
    // 5. If any step fails, entire transaction rolls back
});
```

**Isolation Level:** READ COMMITTED (default PostgreSQL)

**Pessimistic Locking (for stock):**
```php
// Lock row during read to prevent race condition
$item = InventoryItem::where('id', $item_id)
    ->lockForUpdate()  // SELECT ... FOR UPDATE
    ->first();

if ($item->quantity >= $needed) {
    $item->decrement('quantity', $needed);
} else {
    throw new InsufficientStockException();
}
```

---

## 3.8 Async Task Queue

### 3.8.1 High Priority Tasks (Immediate)

```php
// Payment processing - must complete before user leaves checkout
Queue::connection('high')->dispatch(new ProcessPayment($order));

// Order confirmation email - sent immediately after order
Queue::connection('high')->dispatch(new SendOrderConfirmation($order));

// KDS notification - real-time via WebSocket
broadcast(new OrderReceived($order));
```

### 3.8.2 Default Priority Tasks (Soon)

```php
// Receipt PDF generation - user can download later
Queue::dispatch(new GenerateReceipt($order));

// Member loyalty points update
Queue::dispatch(new UpdateMemberPoints($member, $points));

// Inventory recount alert
Queue::dispatch(new CheckLowStock($branch_id));
```

### 3.8.3 Low Priority Tasks (Batch)

```php
// Daily sales report generation - scheduled job
// Runs every 1 AM via Laravel scheduler
Queue::connection('low')->dispatch(new GenerateDailySalesReport($branch_id));

// Export historical data
Queue::connection('low')->dispatch(new ExportInventoryHistory($params));

// Data cleanup (archive old orders > 1 year)
Queue::connection('low')->dispatch(new CleanupArchiveData());
```

---

## 3.9 Validation Rules

### 3.9.1 Order Creation Validation

```php
'branch_id' => 'required|exists:branches,id',
'member_id' => 'nullable|exists:members,id',
'items' => 'required|array|min:1',
'items.*.menu_item_id' => 'required|exists:menu_items,id',
'items.*.quantity' => 'required|integer|min:1|max:99',
'items.*.modifiers' => 'nullable|array',
'items.*.modifiers.*' => 'exists:menu_item_modifiers,id',
'promo_code' => 'nullable|string|size:10',
'delivery_address' => 'required_if:order_type,DELIVERY|string',
'special_instructions' => 'nullable|string|max:500',
'payment_method' => 'required|in:CASH,CARD,TRANSFER'
```

### 3.9.2 Menu Item Validation

```php
'name' => 'required|string|max:100|unique:menu_items,name,NULL,id,branch_id,' . $branchId,
'category_id' => 'required|exists:menu_categories,id',
'price' => 'required|numeric|min:1000|max:999999',
'recipe_id' => 'required|exists:recipes,id',
'available' => 'required|boolean',
'is_featured' => 'boolean',
'description' => 'nullable|string|max:500',
'image_url' => 'nullable|image|mimes:jpg,png,webp|max:2048'
```

---

## 3.10 Idempotency & Duplicate Prevention

### 3.10.1 Idempotency Keys

**For critical operations:**
```
POST /api/v1/orders
Header: Idempotency-Key: {uuid}

First request: Creates order, returns 201, stores key → value mapping
Duplicate request: Returns cached 201 response with same Order ID
```

**Implementation:**
```php
// Middleware
if ($idempotencyKey = $request->header('Idempotency-Key')) {
    $cached = Cache::get("idempotency:{$idempotencyKey}");
    if ($cached) return response($cached['body'], $cached['status']);
}

// After successful response
Cache::put("idempotency:{$idempotencyKey}", 
    ['body' => $response, 'status' => 201], 
    now()->addHours(24)
);
```

### 3.10.2 Duplicate Order Detection

```php
// Check if order already exists within 5 minutes
$recent = Order::where('member_id', $member_id)
    ->where('total_price', $total_price)
    ->where('created_at', '>', now()->subMinutes(5))
    ->first();

if ($recent) {
    throw new DuplicateOrderException("Order already exists: " . $recent->id);
}
```

---

## 3.11 Audit & Compliance

### 3.11.1 Audit Trail

**Auditable Events:**
```php
// On create/update/delete
Model::observe(AuditObserver::class);

// Recorded fields:
- User ID (who made change)
- Timestamp
- Action (CREATE/UPDATE/DELETE)
- Old values (before)
- New values (after)
- IP address
- User agent
- Branch ID (tenant isolation)

// Example
Audit::create([
    'auditable_type' => MenuItem::class,
    'auditable_id' => 42,
    'user_id' => 5,
    'action' => 'UPDATE',
    'old_values' => ['price' => 45000],
    'new_values' => ['price' => 50000],
    'ip_address' => '192.168.1.1',
    'branch_id' => 1
]);
```

### 3.11.2 Access Logs

```
Every API request logged:
- Timestamp
- User ID
- Endpoint (POST /api/v1/orders)
- Method
- Response status
- Response time
- IP address
- User agent

Query: SELECT COUNT(*) FROM access_logs WHERE endpoint LIKE '%/orders%'
```

---

## 3.12 Constraints & Edge Cases

### 3.12.1 Race Conditions

**Problem:** Two orders simultaneously → inventory goes negative

**Solution:**
```php
// Pessimistic lock + atomic decrement
InventoryItem::where('id', $id)->lockForUpdate()->decrement('quantity', $needed);

// Alternative: Redis atomic increment
Redis::decrby("stock:{$item_id}", $needed);
```

### 3.12.2 Payment Timeout

**Problem:** Customer closes browser after checkout, payment status unclear

**Solution:**
```php
// Webhook from payment gateway (Stripe/Midtrans)
POST /api/v1/payments/webhook

1. Verify signature
2. Check order status
3. If webhook = SUCCESS but order = PENDING
   → Update order status
   → Emit event
   → Send notification
```

### 3.12.3 Inventory Negative Stock

**Problem:** Manual adjustment minus actual stock → negative

**Solution:**
```php
// Validation on manual adjustment
'quantity' => 'required|integer|min:0|max:' . $currentStock

// Prevent negative via constraint
InventoryItem::where('quantity', '<', 0)->doesntExist()
```

---

## 3.13 Performance Considerations

### 3.13.1 Query Optimization

- Index on: `branch_id`, `user_id`, `created_at`
- Use select() to limit columns
- Eager load relations (with())
- Cache N+1 queries

**Example:**
```php
// Slow (N+1)
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->member->name;  // Query inside loop
}

// Fast
$orders = Order::with('member')->get();
foreach ($orders as $order) {
    echo $order->member->name;  // Cached from load
}
```

### 3.13.2 API Response Size

- Paginate large result sets (limit: 50 per page)
- Use sparse fieldsets (only needed columns)
- Compress response body (gzip)

---

## 3.14 Related Documents

- [02-arsitektur-sistem.md](./02-arsitektur-sistem.md) - System architecture layers
- [04-database-design.md](./04-database-design.md) - Database schemas
- [05-api-design.md](./05-api-design.md) - API endpoints & responses
- [11-testing-strategy.md](./11-testing-strategy.md) - Test scenarios for state machines

---

**Document Status:** ✅ Complete
**Last Updated:** 2026-07-13
**Next Document:** [04-database-design.md](./04-database-design.md)
