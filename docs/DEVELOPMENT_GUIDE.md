# BuzzMart Backend Development Guide

This guide details how to setup, configure, run, and test the BuzzMart backend service.

---

## 1. Environment Configurations

Create a local configuration file named `.env.dev` (copied from `.env.example`). The application bootstrap loads these parameters at runtime.

```ini
# Server Setup
PORT=5555
NODE_ENV=development

# Postgres Database connection
DB_HOST=host.docker.internal
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_DATABASE=buzmart_dev

# JWT Security
JWT_SECRET=your_jwt_signature_secret_key
JWT_EXPIRES_IN=24h

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_yourkey
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Firebase service account credentials (for Push Notifications)
FIREBASE_PROJECT_ID=buzzmart-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@buzzmart.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...=-----END PRIVATE KEY-----\n"
```

---

## 2. Bootstrapping the Server

### Local Development (with Node + Node Package Manager)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs with nodemon + tsx):
   ```bash
   npm run dev
   ```

### Docker Containerized Setup
Run the development container matching the user environment:
```bash
docker run --rm -it \
  --name auth-service \
  -p 5555:5555 \
  -v "$(pwd)":/usr/src/app \
  auth-service:dev
```
* **Host Postgres Mapping**: To connect to a local database running on the host machine from inside the Docker container, use `host.docker.internal` as the `DB_HOST`.

---

## 3. Database Schema Updates
Under the development configuration, database schema adjustments are synchronized automatically on startup using TypeORM synchronization:
```typescript
synchronize: true
```
> [!WARNING]
> Do NOT set `synchronize: true` in production environments. Turn it off and write explicit migrations instead.

---

## 4. Code Quality & Formatting

* **Type Safety Check**: Run the TypeScript compiler without generating output:
  ```bash
  npx tsc --noEmit
  ```
* **Linting Check**: Validate syntax structure:
  ```bash
  npm run lint
  ```
* **Formatting**: Ensure files align to configuration standards:
  ```bash
  npm run format
  ```
