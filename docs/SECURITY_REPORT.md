# BuzzMart Security Findings & Production Readiness Audit

This document reports critical security assessments of the BuzzMart backend codebase.

---

## 1. High Priority Vulnerability Findings

### Finding 1: Firebase Private Keys Committed to VCS
* **File Reference**: [`.env.dev`](file:///Users/adityaverma/projects/e-commerce/auth_service/.env.dev#L10)
* **Severity**: **CRITICAL**
* **Impact**: The development environment configuration file contains a fully readable private key credential for the Firebase admin service account. If this repository is shared or public, attackers can access your FCM and Firebase projects.
* **Remediation**: 
  1. Revoke the current Firebase credentials in the Firebase Google Console immediately.
  2. Move all private keys to secure environment storage (e.g. HashiCorp Vault, AWS Secrets Manager, or locked environment variables inside the CI/CD deployment platform).
  3. Never commit `.env.dev` or any environment configurations containing secrets directly to git. Add `.env.dev` to your `.gitignore`.

### Finding 2: Fallback JWT Secret in Production Configuration
* **File Reference**: [`src/config/index.ts`](file:///Users/adityaverma/projects/e-commerce/auth_service/src/config/index.ts#L39)
* **Severity**: **HIGH**
* **Impact**: If the `JWT_SECRET` environment variable is not defined, the config falls back to the hardcoded string `'dev-secret-key-1234567890'`. This allows attackers to forge valid JWT tokens and bypass authentication.
* **Remediation**: Modify [index.ts](file:///Users/adityaverma/projects/e-commerce/auth_service/src/config/index.ts) to throw a boot-time startup crash error if the secret environment variables are not populated.
  ```typescript
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
      throw new Error("FATAL: JWT_SECRET environment variable is required in production!");
  }
  ```

### Finding 3: Raw Gateway Response Leak in Payments Relation
* **File Reference**: [`src/entities/Payment.ts`](file:///Users/adityaverma/projects/e-commerce/auth_service/src/entities/Payment.ts)
* **Severity**: **MEDIUM**
* **Impact**: The `Payment` entity stores the `gatewayResponse` raw JSON object (which can contain sensitive payment gateway transaction keys, card network info, or customer details). Because the `Order` entity retrieves the `payments` relationship, this raw JSON payload could be serialized and sent to the client.
* **Remediation**: Apply the `@Column({ select: false })` decorator to the `gatewayResponse` property on [Payment.ts](file:///Users/adityaverma/projects/e-commerce/auth_service/src/entities/Payment.ts) to ensure it is excluded from default database queries.

---

## 2. Implemented Security Protections

### Concurrency & Double-Spend Safety
* **Mechanism**: Pessimistic Write Locking (`FOR UPDATE`).
* **Implementation**: Inside `InventoryService.ts` and `CheckoutService.ts`, the database locks the product rows and cart rows during checkout. This prevents race conditions, inventory overselling, or double-coupon application attempts.
* **Idempotency**: Implemented unique `idempotencyKey` check on orders to safeguard against duplicate client transaction submissions.

### Role Guard Protections
* **Mechanism**: Custom authorization middleware.
* **Implementation**: Standardized RBAC checks:
  * Customer actions are bound to their JWT `sub` ID.
  * Admin actions require `authorizeRoles("admin")` which parses and verifies the token claims.

### SQL Injection Protection
* **Mechanism**: Parameterized queries.
* **Implementation**: The system uses TypeORM's query builder parameter bindings (e.g., `:id`, `:status`) exclusively, completely preventing raw SQL interpolation vulnerabilities.
