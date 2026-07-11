# BuzzMart Database Schema

The database is built on **PostgreSQL** using TypeORM mappings. Price fields are stored as `numeric`/`decimal` types to prevent floating-point errors, and currency math is managed at application level using a custom value transformer.

---

## 1. User Management Domain

### User
* **Entity Class**: `User`
* **Table Name**: `user`
* **Primary Key**: `id` (int, auto-increment)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | integer | Yes | *Primary Key* | Auto-incrementing identifier |
| **firstName** | varchar | Yes | — | First name of the user |
| **lastName** | varchar | Yes | — | Last name of the user |
| **email** | varchar | Yes | — | Email (Unique constraint) |
| **password** | varchar | No | null | Hashed password (null for OAuth users) |
| **phone** | varchar | No | null | Contact number |
| **provider** | varchar | Yes | 'local' | Authentication provider ('local', 'google', etc.) |
| **providerUserId** | varchar | No | null | OAuth provider user ID reference |
| **role** | enum | Yes | 'customer' | User privilege role ('admin', 'customer') |
| **isActive** | boolean | Yes | true | Flag for active/deactivated user status |
| **createdAt** | timestamptz | Yes | *now()* | Creation timestamp |
| **updatedAt** | timestamptz | Yes | *now()* | Last update timestamp |

* **Relations**:
  * `devices` (1:N with `UserDevice`, CASCADE delete)
  * `addresses` (1:N with `Address`, CASCADE delete)
  * `carts` (1:N with `Cart`, CASCADE delete)
  * `orders` (1:N with `Order`, SET NULL delete)

---

### UserDevice (FCM Registration Tokens)
* **Entity Class**: `UserDevice`
* **Table Name**: `user_device`
* **Primary Key**: `id` (int, auto-increment)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | integer | Yes | *Primary Key* | Auto-incrementing identifier |
| **fcmToken** | varchar | Yes | — | Firebase registration token (Unique index) |
| **userId** | integer | Yes | — | Owner user ID reference |
| **createdAt** | timestamptz | Yes | *now()* | Creation timestamp |
| **updatedAt** | timestamptz | Yes | *now()* | Last update timestamp |

---

### Address
* **Entity Class**: `Address`
* **Table Name**: `address`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **userId** | integer | Yes | — | Foreign key to user |
| **addressType** | enum | Yes | 'shipping' | Address type ('billing', 'shipping') |
| **fullName** | varchar | Yes | — | Recipient full name |
| **phoneNumber** | varchar | Yes | — | Recipient phone number |
| **street** | varchar | Yes | — | Flat/House, street details |
| **apartment** | varchar | No | null | Apartment/Suite details |
| **city** | varchar | Yes | — | District/City name |
| **state** | varchar | Yes | — | State/Province |
| **postalCode** | varchar | Yes | — | Zip/Postal code |
| **country** | varchar | Yes | 'India' | Country name |
| **landmark** | varchar | No | null | Landmark nearby |
| **isDefault** | boolean | Yes | false | Flag for default shipping/billing address |

---

## 2. Product Catalog Domain

### Product
* **Entity Class**: `Product`
* **Table Name**: `product`
* **Primary Key**: `id` (uuid)
* **Check Constraints**:
  * `"stock" >= 0`
  * `"reserved" >= 0`
  * `"stock" >= "reserved"` (available stock cannot drop below zero)
  * `"price" >= 0`

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **name** | varchar | Yes | — | Product title |
| **slug** | varchar | Yes | — | Unique URL identifier |
| **sku** | varchar | Yes | — | Unique SKU code |
| **barcode** | varchar | No | null | UPC/EAN barcode value |
| **price** | decimal(10,2)| Yes | 0.00 | Base retail price |
| **salePrice** | decimal(10,2)| No | null | Special discount/sale price |
| **costPrice** | decimal(10,2)| No | null | Acquisition wholesale cost price |
| **stock** | integer | Yes | 0 | Total physically present stock in inventory |
| **reserved** | integer | Yes | 0 | Reserved items waiting for payment clearance |
| **minStock** | integer | Yes | 0 | Low inventory trigger threshold value |
| **taxPercentage** | decimal(5,2)| Yes | 0.00 | Item tax rate (GST/VAT percentage) |
| **status** | enum | Yes | 'DRAFT' | Status: 'DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK' |
| **featured** | boolean | Yes | false | Display on home/landing pages |
| **isActive** | boolean | Yes | true | Soft-deactivation logic flag |

---

### ProductVariant
* **Entity Class**: `ProductVariant`
* **Table Name**: `product_variant`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **variantName** | varchar | Yes | — | Variant label (e.g. "Space Gray / 256GB") |
| **sku** | varchar | No | null | Variant SKU code |
| **price** | decimal(10,2)| Yes | 0.00 | Variant-specific base price |
| **salePrice** | decimal(10,2)| No | null | Variant sale price |
| **stock** | integer | Yes | 0 | Variant inventory count |
| **attributes** | jsonb | No | null | Attribute JSON key-values (e.g. `{ "size": "M" }`) |

---

## 3. Cart & Discount Domains

### Cart
* **Entity Class**: `Cart`
* **Table Name**: `cart`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **userId** | integer | Yes | — | Reference to owner User |
| **status** | enum | Yes | 'ACTIVE' | Lifecycle state: 'ACTIVE', 'ABANDONED', 'CONVERTED' |
| **totalPrice** | decimal(12,2)| Yes | 0.00 | Total value of items inside the cart |
| **itemCount** | integer | Yes | 0 | Total quantities inside the cart |

---

### CartItem
* **Entity Class**: `CartItem`
* **Table Name**: `cart_item`
* **Primary Key**: `id` (uuid)
* **Check Constraints**: `"quantity" > 0`, `"price" >= 0`

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **cartId** | uuid | Yes | — | Associated cart ID |
| **productId** | uuid | Yes | — | Associated product ID |
| **variantId** | uuid | No | null | Optional variant ID |
| **quantity** | integer | Yes | — | Selected quantity |
| **price** | decimal(10,2)| Yes | — | Unit price snapshot at addition time |

---

### Coupon
* **Entity Class**: `Coupon`
* **Table Name**: `coupon`
* **Primary Key**: `id` (uuid)
* **Check Constraints**:
  * `"value" > 0`
  * `"usageCount" >= 0`
  * `"expiresAt" > "validFrom"`

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **code** | varchar | Yes | — | Unique coupon code (e.g. "SAVE20") |
| **type** | enum | Yes | — | Coupon behavior: 'PERCENTAGE', 'FIXED_AMOUNT' |
| **value** | decimal(10,2)| Yes | — | Amount or percentage to deduct |
| **maxDiscountAmount**| decimal(10,2)| No | null | Discount cap for percentage-based coupons |
| **minOrderAmount** | decimal(10,2)| Yes | 0.00 | Minimum order subtotal required to apply |
| **usageLimit** | integer | No | null | Global redemption limit |
| **usageCount** | integer | Yes | 0 | Current globally recorded usage |
| **usagePerUser** | integer | Yes | 1 | Maximum redemptions per customer |
| **isActive** | boolean | Yes | true | Coupon activation status flag |
| **validFrom** | timestamptz | Yes | — | Coupon validity start timestamp |
| **expiresAt** | timestamptz | Yes | — | Coupon expiry timestamp |

---

## 4. Order & Checkout Domains

### Order
* **Entity Class**: `Order`
* **Table Name**: `order`
* **Primary Key**: `id` (uuid)
* **Check Constraints**:
  * `subtotal >= 0`, `shippingCost >= 0`, `discountAmount >= 0`, `taxAmount >= 0`, `totalAmount >= 0`

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **orderNumber** | varchar | Yes | — | Unique code format: `BZM-YYYYMMDD-XXXXXX` |
| **userId** | integer | No | null | Associated customer user reference |
| **shippingAddress** | jsonb | Yes | — | Immutably frozen AddressSnapshot payload |
| **billingAddress** | jsonb | Yes | — | Immutably frozen AddressSnapshot payload |
| **subtotal** | decimal(12,2)| Yes | 0.00 | Total item prices sum before discounts |
| **shippingCost** | decimal(12,2)| Yes | 0.00 | Shipping delivery fees |
| **discountAmount** | decimal(12,2)| Yes | 0.00 | Discount applied from coupon |
| **taxAmount** | decimal(12,2)| Yes | 0.00 | Sum of line-level calculated taxes |
| **totalAmount** | decimal(12,2)| Yes | 0.00 | Final customer payable amount |
| **status** | enum | Yes | 'PENDING' | Status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED |
| **paymentMethod** | varchar | No | null | 'cod', 'razorpay' |
| **isPaid** | boolean | Yes | false | Flag for payment completion status |
| **paidAt** | timestamptz | No | null | Timestamp of payment verification |
| **trackingNumber** | varchar | No | null | Shipping carrier tracking code |
| **shippingProvider**| varchar | No | null | Shipping carrier provider |
| **notes** | text | No | null | Customer checkout instructions |
| **couponCode** | varchar | No | null | Applied coupon code reference |
| **idempotencyKey** | varchar | No | null | Double-submit guard key (Unique) |

---

### OrderItem (Immutable Line Snapshots)
* **Entity Class**: `OrderItem`
* **Table Name**: `order_item`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **orderId** | uuid | Yes | — | Associated Order ID |
| **productId** | uuid | No | null | Product ID (null if product deleted later) |
| **variantId** | uuid | No | null | Variant ID |
| **productName** | varchar | Yes | — | Frozen Product Title |
| **productSku** | varchar | Yes | — | Frozen Product SKU |
| **productThumbnail**| varchar | No | null | Frozen Thumbnail URL |
| **variantName** | varchar | No | null | Frozen Variant Title |
| **variantSku** | varchar | No | null | Frozen Variant SKU |
| **variantAttributes**| jsonb | No | null | Frozen Variant attribute metadata |
| **quantity** | integer | Yes | — | Purchased quantity |
| **unitPrice** | decimal(10,2)| Yes | — | Frozen single-item price |
| **discountAmount** | decimal(10,2)| Yes | 0.00 | Distributed coupon discount fraction |
| **taxPercentage** | decimal(5,2)| Yes | 0.00 | Frozen tax rate percentage |
| **taxAmount** | decimal(10,2)| Yes | 0.00 | Total calculated tax for this line |
| **totalPrice** | decimal(12,2)| Yes | — | Net line price: `(unit*qty) + tax - discount` |

---

### Payment
* **Entity Class**: `Payment`
* **Table Name**: `payment`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **orderId** | uuid | Yes | — | Associated Order ID |
| **transactionId** | varchar | Yes | — | Razorpay order ID or COD internal ID (Unique) |
| **paymentMethod** | varchar | Yes | — | 'cod', 'razorpay' |
| **paymentGateway** | varchar | Yes | — | 'internal', 'razorpay' |
| **amount** | decimal(12,2)| Yes | — | Paid amount |
| **status** | enum | Yes | 'PENDING' | Status: 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED' |
| **gatewayResponse** | jsonb | No | null | Raw webhook payload from gateway |
| **failureReason** | text | No | null | Raw failure description |
| **completedAt** | timestamptz | No | null | Payment success verification timestamp |

---

## 5. System Logs & Tracking Domains

### UserEventLog (Client-side app/web telemetry)
* **Entity Class**: `UserEventLog`
* **Table Name**: `user_event_log`
* **Primary Key**: `id` (uuid)

| Field | Database Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **id** | uuid | Yes | *Primary Key* | Auto-generated UUID |
| **userId** | integer | No | null | Owner user ID (null for guest telemetry) |
| **eventType** | varchar | Yes | — | e.g. "page_view", "click", "app_crash" |
| **eventName** | varchar | Yes | — | e.g. "add_to_cart_btn", "out_of_memory_error" |
| **platform** | varchar | Yes | — | 'web', 'android', 'ios', 'app' |
| **metadata** | jsonb | No | null | Extra payload (page URL, query text) |
| **ipAddress** | varchar | No | null | Customer IP address |
| **userAgent** | varchar | No | null | Client browser/device user agent header |
| **createdAt** | timestamptz | Yes | *now()* | Timestamp when event occurred |
