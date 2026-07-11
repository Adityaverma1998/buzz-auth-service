# BuzzMart Customer APIs

These endpoints are scoped to authenticated customer roles (`"role": "customer"`). They cover cart management, shipping profiles, checkout transactions, and personal order tracking.

---

## 1. Cart Management

### Get Active Cart
* **Method**: `GET`
* **Endpoint**: `/api/v1/cart`
* **Access**: Customer Only
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Cart retrieved successfully",
    "data": {
      "id": "a9a3b6f0-1c4b-4a52-b883-ccb38c2016ff",
      "totalPrice": 149.97,
      "itemCount": 3,
      "items": [
        {
          "id": "e6a127ff-8c88-4c12-9ab2-8cf3c4fe122a",
          "productId": "c1a967f6-6c84-406a-a222-26330bd8f8ff",
          "quantity": 3,
          "price": 49.99
        }
      ]
    }
  }
  ```

---

### Add Item to Cart
* **Method**: `POST`
* **Endpoint**: `/api/v1/cart/items`
* **Access**: Customer Only
* **Request Body**:
  ```json
  {
    "productId": "c1a967f6-6c84-406a-a222-26330bd8f8ff",
    "variantId": "b1b848c2-28e4-4d82-82ea-28efc0f4122d",
    "quantity": 2
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Item added to cart successfully",
    "data": {
      "id": "a9a3b6f0-1c4b-4a52-b883-ccb38c2016ff",
      "totalPrice": 99.98,
      "itemCount": 2
    }
  }
  ```

---

## 2. Address & Profiles

### List Customer Addresses
* **Method**: `GET`
* **Endpoint**: `/api/v1/addresses`
* **Access**: Customer Only

---

### Add Address
* **Method**: `POST`
* **Endpoint**: `/api/v1/addresses`
* **Access**: Customer Only
* **Request Body**:
  ```json
  {
    "addressType": "shipping",
    "fullName": "Jane Doe",
    "phoneNumber": "9876543210",
    "street": "123 Main St",
    "apartment": "Suite 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India",
    "isDefault": true
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Address created successfully",
    "data": {
      "id": "d1d848ff-18e4-4282-ae2b-28efc0f4b8ff",
      "fullName": "Jane Doe"
    }
  }
  ```

---

### Set Default Address
* **Method**: `PATCH`
* **Endpoint**: `/api/v1/addresses/:id/default`
* **Access**: Customer Only
* **Path Parameters**:
  * `id` (uuid, required)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Default address updated successfully"
  }
  ```

---

## 3. Order Checkout Journey

### Preview Order Pricing
Pre-calculates net totals, shipping fees, tax deductions, and coupon values without writing to the database.
* **Method**: `POST`
* **Endpoint**: `/api/v1/checkout/preview`
* **Access**: Customer Only
* **Request Body**:
  ```json
  {
    "addressId": "d1d848ff-18e4-4282-ae2b-28efc0f4b8ff",
    "couponCode": "SAVE10"
  }
  ```
* **Response (200 OK)**:
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

### Place Order
Converts cart items to an immutable order structure, reserves stock, generates payment reference, and logs audit entries.
* **Method**: `POST`
* **Endpoint**: `/api/v1/checkout/place`
* **Access**: Customer Only
* **Request Body**:
  ```json
  {
    "addressId": "d1d848ff-18e4-4282-ae2b-28efc0f4b8ff",
    "couponCode": "SAVE10",
    "paymentMethod": "razorpay",
    "idempotencyKey": "unique-client-uuid-key",
    "notes": "Please deliver after 5 PM"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "orderNumber": "BZM-20260711-X4D2S",
      "totalAmount": 179.60,
      "paymentMethod": "razorpay",
      "razorpayOrderId": "order_P3kd8S7dls0"
    }
  }
  ```
* **Notification Side Effect**: Triggers `ORDER_CREATED` push event to the customer.

---

### Verify Payment (Signature Verification)
Verifies Razorpay payment token signatures, transitions order status to `CONFIRMED`, and locks inventory.
* **Method**: `POST`
* **Endpoint**: `/api/v1/checkout/verify-payment`
* **Access**: Customer Only
* **Request Body**:
  ```json
  {
    "razorpayPaymentId": "pay_P4kd8s7sJ2L",
    "razorpayOrderId": "order_P3kd8S7dls0",
    "razorpaySignature": "cryptographic-signature-string-from-razorpay"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified and order confirmed successfully",
    "data": {
      "orderId": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "status": "CONFIRMED"
    }
  }
  ```
* **Notification Side Effect**: Triggers `PAYMENT_SUCCESS` push event to the customer.

---

## 4. Order Management

### List Orders
* **Method**: `GET`
* **Endpoint**: `/api/v1/orders`
* **Access**: Customer Only
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Orders retrieved successfully",
    "data": [
      {
        "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
        "orderNumber": "BZM-20260711-X4D2S",
        "totalAmount": 179.60,
        "status": "CONFIRMED",
        "createdAt": "2026-07-11T22:00:00Z"
      }
    ]
  }
  ```

---

### Cancel Order
Customers can cancel pending or unfulfilled orders.
* **Method**: `POST`
* **Endpoint**: `/api/v1/orders/:id/cancel`
* **Access**: Customer Only
* **Path Parameters**:
  * `id` (uuid, required)
* **Request Body**:
  ```json
  {
    "reason": "Customer cancellation request text"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order cancelled successfully"
  }
  ```
* **Notification Side Effect**: Triggers `ORDER_CANCELLED` push event to the customer.
