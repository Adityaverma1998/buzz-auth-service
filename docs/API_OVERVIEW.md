# BuzzMart API Overview

All API endpoints are versioned under the `/api/v1` namespace. Success responses return a standard body format: `{ success: boolean, message: string, data?: any }`.

---

## 1. Endpoint Access Classifications

* **PUBLIC**: No authentication header required.
* **AUTHENTICATED SHARED**: Requires a valid Bearer JWT token. Accessible by both customers and admins.
* **CUSTOMER ONLY**: Requires a valid Bearer JWT token with claim `"role": "customer"`.
* **ADMIN ONLY**: Requires a valid Bearer JWT token with claim `"role": "admin"`.

---

## 2. Master Endpoint Registry

| Method | Endpoint Route | Access | Module | Auth Required | Required Role | Notification Event Triggered |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **POST** | `/api/v1/auth/register` | Public | Authentication | No | — | None |
| **POST** | `/api/v1/auth/login` | Public | Authentication | No | — | None |
| **POST** | `/api/v1/auth/google` | Public | Authentication | No | — | None |
| **GET** | `/api/v1/auth/me` | Shared | Authentication | Yes | any | None |
| **POST** | `/api/v1/auth/device` | Shared | Device Tokens | Yes | any | None |
| **GET** | `/api/v1/products` | Public | Catalog | No | — | None |
| **POST** | `/api/v1/products` | Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/products/:id` | Public | Catalog | No | — | None |
| **PUT** | `/api/v1/products/:id` | Admin | Catalog | Yes | admin | None |
| **DELETE**| `/api/v1/products/:id` | Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/categories` | Public | Catalog | No | — | None |
| **POST** | `/api/v1/categories` | Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/categories/:id`| Public | Catalog | No | — | None |
| **PUT** | `/api/v1/categories/:id`| Admin | Catalog | Yes | admin | None |
| **DELETE**| `/api/v1/categories/:id`| Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/brands` | Public | Catalog | No | — | None |
| **POST** | `/api/v1/brands` | Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/brands/:id` | Public | Catalog | No | — | None |
| **PUT** | `/api/v1/brands/:id` | Admin | Catalog | Yes | admin | None |
| **DELETE**| `/api/v1/brands/:id` | Admin | Catalog | Yes | admin | None |
| **GET** | `/api/v1/cart` | Customer| Shopping Cart | Yes | customer | None |
| **DELETE**| `/api/v1/cart` | Customer| Shopping Cart | Yes | customer | None |
| **POST** | `/api/v1/cart/items` | Customer| Shopping Cart | Yes | customer | None |
| **PUT** | `/api/v1/cart/items` | Customer| Shopping Cart | Yes | customer | None |
| **DELETE**| `/api/v1/cart/items` | Customer| Shopping Cart | Yes | customer | None |
| **GET** | `/api/v1/addresses` | Customer| User Profiles | Yes | customer | None |
| **POST** | `/api/v1/addresses` | Customer| User Profiles | Yes | customer | None |
| **GET** | `/api/v1/addresses/:id` | Customer| User Profiles | Yes | customer | None |
| **PUT** | `/api/v1/addresses/:id` | Customer| User Profiles | Yes | customer | None |
| **DELETE**| `/api/v1/addresses/:id` | Customer| User Profiles | Yes | customer | None |
| **PATCH** | `/api/v1/addresses/:id/default` | Customer| User Profiles | Yes | customer | None |
| **POST** | `/api/v1/checkout/preview`| Customer| Order Checkout | Yes | customer | None |
| **POST** | `/api/v1/checkout/place` | Customer| Order Checkout | Yes | customer | **ORDER_CREATED** |
| **POST** | `/api/v1/checkout/verify-payment`| Customer| Order Checkout | Yes | customer | **PAYMENT_SUCCESS** |
| **GET** | `/api/v1/orders` | Customer| Orders | Yes | customer | None |
| **GET** | `/api/v1/orders/:id` | Customer| Orders | Yes | customer | None |
| **POST** | `/api/v1/orders/:id/cancel`| Customer| Orders | Yes | customer | **ORDER_CANCELLED** |
| **GET** | `/api/v1/admin/orders` | Admin | Order Admin | Yes | admin | None |
| **GET** | `/api/v1/admin/orders/:id`| Admin | Order Admin | Yes | admin | None |
| **PATCH** | `/api/v1/admin/orders/:id/status`| Admin | Order Admin | Yes | admin | **Status Dependent** |
| **PATCH** | `/api/v1/admin/orders/:id/shipping`| Admin| Order Admin | Yes | admin | **ORDER_SHIPPED** |
| **GET** | `/api/v1/admin/reports/dashboard-stats`| Admin| Dashboard Analytics| Yes | admin | None |
| **GET** | `/api/v1/admin/reports/daily-sales`| Admin| Dashboard Analytics| Yes | admin | None |
| **GET** | `/api/v1/admin/reports/category-performance`| Admin| Dashboard Analytics| Yes | admin | None |
| **GET** | `/api/v1/admin/reports/top-products`| Admin| Dashboard Analytics| Yes | admin | None |
| **POST** | `/api/v1/event-logs` | Public | Analytics Logs | No | optional | None |

---

## 3. Global Error Responses

Error payloads output by the global Express error middleware follow this format:

```json
{
  "success": false,
  "message": "Detailed error message or validation errors summary",
  "errors": [
    {
      "field": "bodyParameterName",
      "message": "Field specific validation warning"
    }
  ]
}
```

### Common HTTP Status Codes
* **400 Bad Request**: Input parameters failed validation or missing required attributes.
* **401 Unauthorized**: Missing or malformed Bearer Token in authorization headers.
* **403 Forbidden**: Token verified, but the user lacks the required role.
* **404 Not Found**: Target resource (address, order, product) was not found in the database.
* **409 Conflict**: Idempotency key match or concurrent conflict occurred.
* **500 Internal Server Error**: Internal runtime exceptions.
