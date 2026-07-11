# BuzzMart API Schema & Frontend Integration Contract

This manifest describes the request/response JSON schemas, header contracts, and TypeScript interfaces for both the **Customer Mobile/Web Client** and the **Admin Dashboard Panel**. It serves as a direct input for frontend generation agents.

---

## 1. Authentication & Session Domain

### Register Customer
* **Endpoint**: `POST /api/v1/auth/register`
* **Request Schema (TypeScript)**:
  ```typescript
  interface RegisterRequest {
    firstName: string; // min: 1
    lastName: string;  // min: 1
    email: string;     // format: email
    password: string;  // min: 6
    phone?: string;
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": 12,
      "email": "johndoe@example.com",
      "role": "customer"
    }
  }
  ```

---

### Local Login
* **Endpoint**: `POST /api/v1/auth/login`
* **Request Schema**:
  ```typescript
  interface LoginRequest {
    email: string;     // format: email
    password: string;  // min: 6
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 12,
        "email": "johndoe@example.com",
        "role": "customer",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
  ```

---

### Google OAuth Login
* **Endpoint**: `POST /api/v1/auth/google`
* **Request Schema**:
  ```typescript
  interface GoogleLoginRequest {
    idToken: string; // OAuth credentials token from Google Mobile SDK
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Google authentication successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 15,
        "email": "googleuser@gmail.com",
        "role": "customer"
      }
    }
  }
  ```

---

### Register Device (FCM Push Notifications)
* **Endpoint**: `POST /api/v1/auth/device`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface RegisterDeviceRequest {
    fcmToken: string; // unique FCM registration token
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Device registered successfully"
  }
  ```

---

## 2. Customer Cart & Address Domains

### Add Item to Cart
* **Endpoint**: `POST /api/v1/cart/items`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface AddToCartRequest {
    productId: string;  // UUID format
    variantId?: string; // UUID format (optional)
    quantity: number;   // positive integer >= 1
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Item added to cart successfully",
    "data": {
      "id": "cart-uuid",
      "totalPrice": 149.97,
      "itemCount": 3,
      "items": [
        {
          "id": "cart-item-uuid",
          "productId": "product-uuid",
          "variantId": "variant-uuid",
          "quantity": 3,
          "price": 49.99
        }
      ]
    }
  }
  ```

---

### Register Address
* **Endpoint**: `POST /api/v1/addresses`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface AddAddressRequest {
    addressType: "shipping" | "billing";
    fullName: string;
    phoneNumber: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string; // default: "India"
    landmark?: string;
    isDefault?: boolean;
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Address created successfully",
    "data": {
      "id": "address-uuid",
      "fullName": "Jane Doe",
      "city": "Mumbai"
    }
  }
  ```

---

## 3. Checkout & Payment Domains

### Preview Checkout (Pricing Calculations)
* **Endpoint**: `POST /api/v1/checkout/preview`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface CheckoutPreviewRequest {
    addressId: string;    // shipping destination Address UUID
    couponCode?: string;  // discount promo code (optional)
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Checkout preview generated successfully",
    "data": {
      "pricing": {
        "subtotal": 120.00,
        "shippingCost": 50.00,
        "discountAmount": 12.00,
        "taxAmount": 21.60,
        "totalAmount": 179.60
      },
      "appliedCoupon": {
        "code": "SAVE10",
        "value": 10.00,
        "type": "PERCENTAGE"
      }
    }
  }
  ```

---

### Place Order (Locks Cart & Generates Gateway Refs)
* **Endpoint**: `POST /api/v1/checkout/place`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface PlaceOrderRequest {
    addressId: string;      // shipping destination Address UUID
    couponCode?: string;    // discount promo code (optional)
    paymentMethod: "cod" | "razorpay";
    idempotencyKey: string; // unique transaction key (UUID) to prevent double submit
    notes?: string;
  }
  ```
* **Success Response (201 Created)**:
  * For `paymentMethod: "razorpay"`:
    ```json
    {
      "success": true,
      "message": "Order placed successfully",
      "data": {
        "id": "order-uuid",
        "orderNumber": "BZM-20260711-X4D2S",
        "totalAmount": 179.60,
        "paymentMethod": "razorpay",
        "razorpayOrderId": "order_P3kd8S7dls0" // pass this to Razorpay Checkout Mobile/Web SDK
      }
    }
    ```
  * For `paymentMethod: "cod"`:
    ```json
    {
      "success": true,
      "message": "Order placed successfully",
      "data": {
        "id": "order-uuid",
        "orderNumber": "BZM-20260711-X4D2S",
        "totalAmount": 179.60,
        "paymentMethod": "cod"
      }
    }
    ```

---

### Verify Gateway Payment (Online Orders Completion)
* **Endpoint**: `POST /api/v1/checkout/verify-payment`
* **Headers**: `Authorization: Bearer <token>`
* **Request Schema**:
  ```typescript
  interface VerifyPaymentRequest {
    razorpayPaymentId: string; // received from Razorpay Checkout success payload
    razorpayOrderId: string;   // received from Razorpay Checkout success payload
    razorpaySignature: string; // cryptographic signature proof
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified and order confirmed successfully",
    "data": {
      "orderId": "order-uuid",
      "status": "CONFIRMED"
    }
  }
  ```

---

## 4. Admin Workflow & Reporting

### Update Order Status
* **Endpoint**: `PATCH /api/v1/admin/orders/:id/status`
* **Headers**: `Authorization: Bearer <token>` (Must have role "admin")
* **Request Schema**:
  ```typescript
  interface UpdateStatusRequest {
    status: "CONFIRMED" | "PROCESSING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    message?: string;
    location?: string;
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": {
      "id": "order-uuid",
      "status": "PROCESSING"
    }
  }
  ```

---

### Update Shipping Information (Carrier Handover)
* **Endpoint**: `PATCH /api/v1/admin/orders/:id/shipping`
* **Headers**: `Authorization: Bearer <token>` (Must have role "admin")
* **Request Schema**:
  ```typescript
  interface UpdateShippingRequest {
    shippingProvider: string; // e.g. "BlueDart", "Delhivery"
    trackingNumber: string;   // tracking ID sequence
    message?: string;
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order shipping information updated successfully",
    "data": {
      "id": "order-uuid",
      "status": "SHIPPED",
      "shippingProvider": "BlueDart",
      "trackingNumber": "BD987654321IN"
    }
  }
  ```

---

## 5. Client Analytics Telemetry

### Submit Event Log
Sends click, route view, or crash events to backend database.
* **Endpoint**: `POST /api/v1/event-logs`
* **Headers**: `Authorization: Bearer <token>` (Optional)
* **Request Schema**:
  ```typescript
  interface EventLogRequest {
    eventType: string; // e.g. "page_view", "click", "app_crash", "search"
    eventName: string; // e.g. "add_to_cart_btn", "checkout_completed"
    platform: "web" | "android" | "ios" | "app";
    metadata?: Record<string, any>; // custom extra properties (e.g. { search_query: "shoes" })
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Event logged successfully"
  }
  ```
