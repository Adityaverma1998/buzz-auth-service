# BuzzMart Authentication & Registration APIs

BuzzMart uses **JSON Web Tokens (JWT)** for access control. Mobile and web clients must submit the access token inside HTTP headers for protected paths.

---

## 1. Authentication Endpoints

### Register Customer
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@example.com",
    "password": "Password123",
    "phone": "9876543210"
  }
  ```
* **Response (201 Created)**:
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
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "Password123"
  }
  ```
* **Response (200 OK)**:
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

### Google OAuth Sign-In
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth/google`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "idToken": "google-oauth-identity-token-string"
  }
  ```
* **Response (200 OK)**:
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

### Retrieve Current Profile (`/me`)
* **Method**: `GET`
* **Endpoint**: `/api/v1/auth/me`
* **Access**: Authenticated Shared (customer or admin)
* **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "id": 12,
      "email": "johndoe@example.com",
      "role": "customer",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```

---

### Register Mobile Device Token
Associates an FCM registration token with the authenticated session to enable push notifications.
* **Method**: `POST`
* **Endpoint**: `/api/v1/auth/device`
* **Access**: Authenticated Shared (customer or admin)
* **Headers**:
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "fcmToken": "c1p_Xy8...J2M8"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Device registered successfully"
  }
  ```
