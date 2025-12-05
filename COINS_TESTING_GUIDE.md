# 🪙 Coins System Testing Guide

## ✅ Setup Complete
- ✅ Database migration applied
- ✅ Coin bundles seeded (₹10, ₹20, ₹50, ₹100)
- ✅ All routes registered at `/api/coins`

## 🧪 Testing the Coins System

### Prerequisites
1. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server should start on `http://localhost:4000` (or your configured PORT)

2. **Get a student user token:**
   - Register/Login as a student user
   - Copy the JWT token from the response

### API Endpoints

All endpoints require:
- **Authentication**: `Authorization: Bearer <token>`
- **Role**: Student only

Base URL: `http://localhost:4000/api/coins`

---

### 1. Get Coin Bundles
**GET** `/api/coins/bundles`

**Request:**
```bash
curl -X GET http://localhost:4000/api/coins/bundles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "amountINR": 10, "coins": 100 },
    { "id": 2, "amountINR": 20, "coins": 250 },
    { "id": 3, "amountINR": 50, "coins": 700 },
    { "id": 4, "amountINR": 100, "coins": 1500 }
  ]
}
```

---

### 2. Create Payment Order
**POST** `/api/coins/create-order`

**Request:**
```bash
curl -X POST http://localhost:4000/api/coins/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bundleId": 1}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_...",
      "amount": 1000,
      "currency": "INR",
      "receipt": "receipt_..."
    },
    "purchase": {
      "id": 1,
      "userId": "...",
      "bundleId": 1,
      "coins": 100,
      "amountINR": 10,
      "status": "pending",
      "orderId": "order_...",
      "createdAt": "..."
    }
  }
}
```

---

### 3. Verify Payment (After Payment)
**POST** `/api/coins/verify`

**Request:**
```bash
curl -X POST http://localhost:4000/api/coins/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_...",
    "razorpay_payment_id": "pay_...",
    "razorpay_signature": "signature_..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment verified and coins added successfully",
  "data": {
    "id": 1,
    "status": "success",
    ...
  }
}
```

**Note:** After verification, coins are added to the user's account and a transaction is created.

---

### 4. Gift Coins to Another User
**POST** `/api/coins/gift`

**Request:**
```bash
curl -X POST http://localhost:4000/api/coins/gift \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "recipient_user_id",
    "coins": 50
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coins gifted successfully",
  "data": {
    "id": 1,
    "fromUser": "sender_id",
    "toUser": "recipient_id",
    "coins": 50,
    "type": "gift",
    "createdAt": "..."
  }
}
```

**Error Cases:**
- `400`: Insufficient coins
- `400`: Cannot gift coins to yourself
- `404`: Recipient user not found

---

### 5. Get Transaction History
**GET** `/api/coins/history`

**Request:**
```bash
curl -X GET http://localhost:4000/api/coins/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fromUser": null,
      "toUser": "user_id",
      "coins": 100,
      "type": "purchase",
      "createdAt": "...",
      "sender": null,
      "receiver": {
        "id": "user_id",
        "name": "User Name",
        "avatar": "..."
      }
    },
    {
      "id": 2,
      "fromUser": "sender_id",
      "toUser": "user_id",
      "coins": 50,
      "type": "gift",
      "createdAt": "...",
      "sender": {
        "id": "sender_id",
        "name": "Sender Name",
        "avatar": "..."
      },
      "receiver": {
        "id": "user_id",
        "name": "User Name",
        "avatar": "..."
      }
    }
  ]
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Purchase Flow
1. Get bundles → Select bundle
2. Create order → Get order ID
3. (Simulate payment) → Verify payment
4. Check transaction history → Should see "purchase" transaction
5. Check user coins → Should be increased

### Scenario 2: Gift Flow
1. Ensure sender has coins (purchase first)
2. Gift coins to another user
3. Check transaction history → Should see "gift" transaction
4. Check sender coins → Should be decreased
5. Check recipient coins → Should be increased

### Scenario 3: Error Handling
1. Try to gift more coins than available → Should get "Insufficient coins" error
2. Try to gift to yourself → Should get "Cannot gift coins to yourself" error
3. Try invalid bundle ID → Should get "Bundle not found" error

---

## 📝 Postman Collection

You can import these endpoints into Postman:

1. **Environment Variables:**
   - `base_url`: `http://localhost:4000/api`
   - `token`: Your JWT token

2. **Collection:**
   - GET `{{base_url}}/coins/bundles`
   - POST `{{base_url}}/coins/create-order`
   - POST `{{base_url}}/coins/verify`
   - POST `{{base_url}}/coins/gift`
   - GET `{{base_url}}/coins/history`

---

## 🔍 Database Verification

You can verify the data directly in the database:

```sql
-- Check coin bundles
SELECT * FROM "CoinBundle";

-- Check purchases
SELECT * FROM "CoinPurchase";

-- Check transactions
SELECT * FROM "CoinTransaction";

-- Check user coins
SELECT id, name, email, coins FROM "User";
```

---

## ⚠️ Notes

1. **Razorpay Integration**: Currently using dummy implementation. Replace with actual Razorpay SDK in production.
2. **Payment Verification**: Signature verification is currently bypassed. Implement proper Razorpay signature verification in production.
3. **Transaction Safety**: Coin gifting uses Prisma transactions to ensure atomicity.

---

## 🚀 Next Steps

1. Integrate actual Razorpay payment gateway
2. Add webhook endpoint for Razorpay callbacks
3. Add admin endpoints to manage coin bundles
4. Add analytics for coin usage
5. Add coin expiration/redemption features

