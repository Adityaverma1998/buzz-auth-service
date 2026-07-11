# BuzzMart Backend Technical Report

---

## 1. Executive Summary
BuzzMart is a production-grade e-commerce platform designed with a robust modular monolithic architecture using Node.js, Express.js, TypeScript, PostgreSQL, and TypeORM. 

The backend supports multi-tenant clients, specifically prioritizing the **Customer Mobile Application**, while maintaining compatibility with the **Customer Web Application** and the **Admin Web Panel**.

---

## 2. Verified Working Features
* **Authentication**: Email/Password and Google OAuth integrations generating JWT tokens.
* **Shopping Cart**: Fully stateful endpoints with addition, quantities edit, variant snapshots, and cart clear capabilities.
* **Shipping Profiles**: Customer addresses management with default address toggle controls.
* **Coupon Logic**: Percentage and fixed discount applications with subtotal threshold checking and multi-use limits per user.
* **Fulfillment Workflows**: Admin order status transitions (Confirmed -> Processing -> Shipped -> Delivered) and carrier tracking attachments.
* **Inventory Management**: Pessimistic write locking on stock adjustments to prevent overselling.
* **Firebase Push Notifications**: Multi-device token mapping and event-triggered pushes on placement, verification, shipment, and cancellations.
* **Admin Analytical Reports**: Real-time sales calculations, category performance, daily charts, and low stock warnings.
* **Client Telemetry Logs**: Telemetry logging APIs for web/app clicks, pages views, search terms, and crash reporting.

---

## 3. Customer Mobile App Readiness

### What is Ready Today:
* Registration, standard login, and Google Sign-in.
* FCM token registration (`POST /api/v1/auth/device`).
* Cart CRUD and multi-address management.
* Checkout preview and placement (integrated with Razorpay payments).
* Payment signature validation endpoints to confirm orders.
* Customer cancellations.

### What is Missing:
* **Token Refresh Handlers**: The mobile client has no endpoint to refresh expired access tokens. It must force re-login on token expiry.
* **Wishlist**: No database collections or APIs are implemented.
* **Reviews**: Customers cannot submit ratings or reviews.

---

## 4. Admin Web Panel Readiness

### What is Ready Today:
* Admin login validations.
* Catalog admin APIs (Products, Categories, and Brands CRUD).
* Orders listing, tracking updates, and shipping information controls.
* Analytics reports (sales performance, daily metrics, and low-stock indicators).

### What is Missing:
* **Admin Notifications**: Admins cannot subscribe to alerts (such as `LOW_STOCK` warnings or payment anomalies) via push notifications or dashboard notification pools. All events are recorded only inside the database audit logs.

---

## 5. Firebase & FCM Audit Findings
* **FCM Multicast**: The backend successfully maps and sends notifications to all registered device tokens of a user.
* **Stale Token Eviction**: The system monitors Firebase delivery results and purges invalid or expired tokens immediately.
* **Security Risk**: The Firebase service account private key is committed to git history within `.env.dev`. This must be revoked and removed immediately.

---

## 6. Critical Problems (P0 - P3)

### P0 (Critical) — Credentials Exposure
* Firebase private key credential committed to version control in [`.env.dev`](file:///Users/adityaverma/projects/e-commerce/auth_service/.env.dev#L10).
* **Action**: Revoke keys in Firebase console immediately, move to environment secrets, and erase git history.

### P1 (High) — Fallback Secrets in Production
* Fallback default JWT secrets inside configuration file.
* **Action**: Throw boot errors if mandatory secrets are missing on startup in production.

### P2 (Medium) — Missing Automated Tests
* Low automated unit and integration test coverage.
* **Action**: Setup Jest and write test assertions for cart calculations and order verification checkout logic.

### P3 (Low) — Missing Wishlists & Reviews
* Modules are planned but not yet implemented.
* **Action**: Implement wishlist schemas and product review endpoints.

---

## 7. Recommended Next Steps
1. **Sanitize Secrets**: Revoke and rotate database, JWT, and Firebase credentials. Move keys out of code files to secure environment parameters.
2. **Add Admin Alert Pools**: Add database alert tracking and long-polling or Server-Sent Events (SSE) to deliver real-time notifications to the Admin Panel.
3. **Build Automated Tests**: Implement integration tests for the checkout and pricing calculation flows.
