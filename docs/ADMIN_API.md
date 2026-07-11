# BuzzMart Admin APIs

These endpoints are strictly protected by role authentication (`"role": "admin"`). They provide catalogs control, order workflows, fulfillment, and analytical reporting metrics.

---

## 1. Product Catalog Administration

### Create Product
* **Method**: `POST`
* **Endpoint**: `/api/v1/products`
* **Access**: Admin Only
* **Request Body**:
  ```json
  {
    "name": "Mechanical Keyboard",
    "sku": "KB-MECH-01",
    "price": 89.99,
    "stock": 50,
    "categoryId": "c1c967f6-6c84-406a-a222-26330bd8f8cc",
    "brandId": "b1b967f6-6c84-406a-a222-26330bd8f8bb"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": {
      "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "sku": "KB-MECH-01"
    }
  }
  ```

---

## 2. Order Processing & Fulfillment

### Get Order Details
* **Method**: `GET`
* **Endpoint**: `/api/v1/admin/orders/:id`
* **Access**: Admin Only
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order retrieved successfully",
    "data": {
      "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "orderNumber": "BZM-20260711-X4D2S",
      "status": "CONFIRMED",
      "payments": []
    }
  }
  ```

---

### Update Order Status
Transitions the order status (e.g. from `CONFIRMED` to `PROCESSING` or `DELIVERED`), logs tracking records, and saves logs.
* **Method**: `PATCH`
* **Endpoint**: `/api/v1/admin/orders/:id/status`
* **Access**: Admin Only
* **Request Body**:
  ```json
  {
    "status": "PROCESSING",
    "message": "Order accepted at sorting center",
    "location": "Mumbai Hub"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order status updated successfully",
    "data": {
      "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "status": "PROCESSING"
    }
  }
  ```
* **Notification Side Effect**: Triggers `ORDER_PROCESSING` push alert to the customer.

---

### Update Shipping Information
Fulfills and ships the order (updates status to `SHIPPED`, registers carrier, and tracks logs).
* **Method**: `PATCH`
* **Endpoint**: `/api/v1/admin/orders/:id/shipping`
* **Access**: Admin Only
* **Request Body**:
  ```json
  {
    "shippingProvider": "BlueDart",
    "trackingNumber": "BD987654321IN",
    "message": "Parcel handed over to carrier dispatch"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order shipping information updated successfully",
    "data": {
      "id": "e1e848ff-18e4-4282-82ea-28efc0f4122d",
      "status": "SHIPPED",
      "shippingProvider": "BlueDart",
      "trackingNumber": "BD987654321IN"
    }
  }
  ```
* **Notification Side Effect**: Triggers `ORDER_SHIPPED` push alert to the customer containing carrier details.

---

## 3. Analytics & Dashboard Reports

### Get Dashboard Stats
* **Method**: `GET`
* **Endpoint**: `/api/v1/admin/reports/dashboard-stats`
* **Access**: Admin Only
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard stats retrieved successfully",
    "data": {
      "totalRevenue": 24500.50,
      "totalOrders": 142,
      "totalDiscounts": 1250.00,
      "averageOrderValue": 172.54,
      "customerCount": 85,
      "lowStockCount": 3
    }
  }
  ```

---

### Get Category Performance Sales
* **Method**: `GET`
* **Endpoint**: `/api/v1/admin/reports/category-performance`
* **Access**: Admin Only
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category sales performance report retrieved successfully",
    "data": [
      {
        "categoryId": "c1c967f6-6c84-406a-a222-26330bd8f8cc",
        "categoryName": "Electronics",
        "totalRevenue": 18200.00,
        "quantitySold": 94
      }
    ]
  }
  ```
