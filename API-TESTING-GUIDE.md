# ConnectX Backend - API Testing Guide

## Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:4000`

## Authentication Endpoints

### 1. Signup (POST /api/auth/signup)

**Request:**
```bash
POST http://localhost:4000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",  // optional
  "collegeId": "clx...",   // optional
  "batch": "2024",         // optional
  "role": "student"        // optional (default: student)
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 2. Login (POST /api/auth/login)

**Request:**
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 3. Get Current User (GET /api/auth/me)

**Request:**
```bash
GET http://localhost:4000/api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "points": 0,
    "college": {
      "id": "...",
      "name": "...",
      ...
    }
  }
}
```

## Testing with PowerShell

Run the test script:
```powershell
.\test-auth.ps1
```

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Me
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

## Testing with Postman/Insomnia

1. Import the endpoints
2. For protected routes, add header: `Authorization: Bearer <token>`
3. Set Content-Type to `application/json` for POST requests

