# BuzzMart Notification Event Matrix

BuzzMart uses a multicast push notification infrastructure built on **Firebase Cloud Messaging (FCM)**. Notifications are triggered asynchronously as side effects during order, checkout, and inventory lifecycles.

---

## Notification Event Matrix

| Event Name | Trigger Context | Recipient | In-App Alert | Mobile Push | Email | Priority | Deep Link Route | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **ORDER_CREATED** | Customer completes checkout preview and submits order. | Customer | Yes | Yes | Yes | **HIGH** | `/orders/:orderId` | **Implemented** |
| **PAYMENT_SUCCESS** | Online gateway payment or COD completion verified. | Customer | Yes | Yes | Yes | **HIGH** | `/orders/:orderId` | **Implemented** |
| **ORDER_CONFIRMED** | Order verified via signature callback or accepted by admin. | Customer | Yes | Yes | No | **NORMAL**| `/orders/:orderId` | **Implemented** |
| **ORDER_PROCESSING**| Admin changes order status from `CONFIRMED` to `PROCESSING`.| Customer | Yes | Yes | No | **NORMAL**| `/orders/:orderId` | **Implemented** |
| **ORDER_SHIPPED** | Admin updates shipping provider/tracking and triggers ship state. | Customer | Yes | Yes | Yes | **NORMAL**| `/orders/:orderId/tracking` | **Implemented** |
| **ORDER_DELIVERED** | Admin changes status to `DELIVERED` after carrier drop-off. | Customer | Yes | Yes | Yes | **HIGH** | `/orders/:orderId/review` | **Implemented** |
| **ORDER_CANCELLED** | Customer cancels early OR Admin cancels due to stock issues. | Customer | Yes | Yes | Yes | **HIGH** | `/orders/:orderId` | **Implemented** |
| **REFUND_PROCESSED** | Admin processes refund for a returned or cancelled order. | Customer | Yes | Yes | Yes | **HIGH** | `/orders/:orderId` | **Implemented** |
| **NEW_ORDER_ALERT** | A new customer order is placed and confirmed. | Admin | Yes | No | Yes | **NORMAL**| `/admin/orders/:orderId` | *Planned* |
| **LOW_STOCK_ALERT** | Product available quantity falls below `minStock` threshold. | Admin | Yes | No | Yes | **HIGH** | `/admin/inventory/:sku` | *Planned* |
| **OUT_OF_STOCK** | Product available stock hits absolute `0`. | Admin | Yes | No | Yes | **HIGH** | `/admin/inventory/:sku` | *Planned* |

---

## Priority Classification Definitions

### 1. CRITICAL
Operational warnings that require developer/systems operator intervention.
* *Delivery*: Trigger alerts inside monitoring console (e.g. Sentry, Winston) + pager tools.
* *Example*: Concurrency/inventory corruptions (reservations exceeding stock limit).

### 2. HIGH
Time-sensitive notifications related directly to financial billing or account changes.
* *Delivery*: Instant push alerts + confirmation email.
* *Example*: Successful/failed payments, user password reset.

### 3. NORMAL
Standard lifecycle milestones.
* *Delivery*: Instant push alert + in-app notification center.
* *Example*: Order confirmed, parcel shipped, status updates.

### 4. LOW
Marketing and promotional messages.
* *Delivery*: Deferred push alerts, subject to user unsubscribe controls and local rate limiting.
* *Example*: Coupons campaigns, discount campaigns.
