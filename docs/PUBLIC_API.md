# BuzzMart Public APIs

Public endpoints are accessible by guest users and do not require authentication headers (e.g. for registration, catalog browsing, or guest logs).

---

## 1. Catalog Browsing Endpoints

### List Products
* **Method**: `GET`
* **Endpoint**: `/api/v1/products`
* **Access**: Public
* **Query Parameters**:
  * `page` (number, default: 1)
  * `limit` (number, default: 10)
  * `search` (string, optional)
  * `categoryId` (uuid, optional)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Products retrieved successfully",
    "data": [
      {
        "id": "c1a967f6-6c84-406a-a222-26330bd8f8ff",
        "name": "Wireless Keyboard",
        "slug": "wireless-keyboard",
        "sku": "KB-WIRELESS",
        "price": 49.99,
        "stock": 120,
        "thumbnail": "http://localhost:5555/uploads/kb.jpg"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### Get Product Details
* **Method**: `GET`
* **Endpoint**: `/api/v1/products/:id`
* **Access**: Public
* **Path Parameters**:
  * `id` (uuid, required)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product retrieved successfully",
    "data": {
      "id": "c1a967f6-6c84-406a-a222-26330bd8f8ff",
      "name": "Wireless Keyboard",
      "slug": "wireless-keyboard",
      "sku": "KB-WIRELESS",
      "price": 49.99,
      "stock": 120,
      "taxPercentage": 18.00,
      "variants": []
    }
  }
  ```

---

### List Categories
* **Method**: `GET`
* **Endpoint**: `/api/v1/categories`
* **Access**: Public

---

### List Brands
* **Method**: `GET`
* **Endpoint**: `/api/v1/brands`
* **Access**: Public

---

## 2. Analytics Telemetry Logging

### Submit Telemetry Log
* **Method**: `POST`
* **Endpoint**: `/api/v1/event-logs`
* **Access**: Public (Optional authentication. If token header is provided, links log to user ID).
* **Request Body**:
  ```json
  {
    "eventType": "click",
    "eventName": "add_to_cart_button",
    "platform": "android",
    "metadata": {
      "productId": "c1a967f6-6c84-406a-a222-26330bd8f8ff",
      "quantity": 1
    }
  }
  ```
* **Response (210 Created)**:
  ```json
  {
    "success": true,
    "message": "Event logged successfully"
  }
  ```
