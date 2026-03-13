# WFC Gym Management System - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

No authentication required.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "member"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "member"
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

No authentication required.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token sent to your email",
  "resetToken": "token_here"
}
```

---

### 4. Reset Password
**POST** `/auth/reset-password`

No authentication required.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 5. Get Current User
**GET** `/auth/me`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "member",
    "isActive": true
  }
}
```

---

## 📋 Member Endpoints

### 1. Get All Members
**GET** `/members`

**Authentication:** Required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "members": [
    {
      "_id": "member_id",
      "userId": { "name": "John Doe", "email": "john@example.com" },
      "height": 175,
      "weight": 75,
      "bmi": 24.5,
      "fitnessCategory": "Normal",
      "status": "active",
      "currentPlan": { "name": "Premium Plan" },
      "expiryDate": "2024-12-31",
      "displayStatus": "active"
    }
  ]
}
```

---

### 2. Get Member Statistics
**GET** `/members/stats`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalMembers": 50,
    "activeMembers": 45,
    "expiredMembers": 3,
    "suspendedMembers": 2,
    "expiringMembers": 5,
    "pendingPaymentMembers": 8
  }
}
```

---

### 3. Get Single Member
**GET** `/members/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "member": {
    "_id": "member_id",
    "userId": { "name": "John Doe", "email": "john@example.com" },
    "dateOfBirth": "1995-05-15",
    "gender": "Male",
    "height": 175,
    "weight": 75,
    "chest": 95,
    "waist": 85,
    "hip": 95,
    "arm": 32,
    "thigh": 55,
    "bmi": 24.5,
    "waistHipRatio": 0.89,
    "fitnessCategory": "Normal",
    "progressPhotos": [
      { "type": "front", "url": "image_url", "uploadedAt": "2024-01-01" }
    ],
    "address": "123 Main St",
    "city": "New York",
    "status": "active",
    "joinDate": "2024-01-01",
    "expiryDate": "2024-12-31",
    "totalPaid": 5000,
    "pendingAmount": 0
  }
}
```

---

### 4. Create Member
**POST** `/members`

**Authentication:** Required | **Role:** Admin, Staff

**Request Body:**
```json
{
  "userId": "user_id",
  "dateOfBirth": "1995-05-15",
  "gender": "Male",
  "height": 175,
  "weight": 75,
  "chest": 95,
  "waist": 85,
  "hip": 95,
  "arm": 32,
  "thigh": 55,
  "profession": "Software Engineer",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "currentPlan": "plan_id",
  "startDate": "2024-01-01",
  "planDuration": 180
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member created successfully",
  "member": { /* member object */ }
}
```

---

### 5. Update Member
**PUT** `/members/:id`

**Authentication:** Required | **Role:** Admin, Staff

**Request Body:** (Same as create, but all fields optional)

---

### 6. Delete Member
**DELETE** `/members/:id`

**Authentication:** Required | **Role:** Admin

---

## 💳 Payment Endpoints

### 1. Get All Payments
**GET** `/payments`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "count": 10,
  "payments": [
    {
      "_id": "payment_id",
      "invoiceNumber": "INV-123456",
      "amount": 1000,
      "paymentMode": "cash",
      "paymentStatus": "completed",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "memberId": { "userId": { "name": "John Doe" } },
      "planId": { "name": "Basic Plan", "price": 1000 },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Revenue Summary
**GET** `/payments/revenue/summary`

**Authentication:** Required | **Role:** Admin

**Response:**
```json
{
  "success": true,
  "summary": {
    "overall": {
      "totalRevenue": 50000,
      "totalPayments": 25,
      "avgPayment": 2000
    },
    "byMode": [
      { "_id": "cash", "total": 30000, "count": 15 },
      { "_id": "card", "total": 15000, "count": 8 },
      { "_id": "upi", "total": 5000, "count": 2 }
    ],
    "monthly": [
      { "_id": { "year": 2024, "month": 1 }, "total": 20000, "count": 10 }
    ]
  }
}
```

---

### 3. Create Payment
**POST** `/payments`

**Authentication:** Required | **Role:** Admin, Staff

**Request Body:**
```json
{
  "memberId": "member_id",
  "planId": "plan_id",
  "amount": 1000,
  "paymentMode": "cash",
  "description": "Monthly membership payment"
}
```

---

## 📊 Diet Plan Endpoints

### 1. Get All Diet Plans
**GET** `/diet-plans`

**Authentication:** Required

---

### 2. Get Diet Plan by Member
**GET** `/diet-plans/member/:memberId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "dietPlan": {
    "_id": "diet_plan_id",
    "memberId": "member_id",
    "goal": "Weight Loss",
    "calorieTarget": 2000,
    "weightGoal": 70,
    "breakfast": {
      "items": ["Oatmeal", "Eggs", "Milk"],
      "calories": 400,
      "time": "8:00 AM"
    },
    "lunch": { /* ... */ },
    "dinner": { /* ... */ },
    "snacks": { /* ... */ },
    "protein": 150,
    "carbs": 200,
    "fats": 60,
    "fiber": 30
  }
}
```

---

### 3. Create Diet Plan
**POST** `/diet-plans`

**Authentication:** Required | **Role:** Admin, Staff, Trainer

**Request Body:**
```json
{
  "memberId": "member_id",
  "goal": "Weight Loss",
  "calorieTarget": 2000,
  "weightGoal": 70,
  "breakfast": {
    "items": ["Oatmeal", "Eggs", "Milk"],
    "calories": 400,
    "time": "8:00 AM"
  },
  "lunch": { /* ... */ },
  "dinner": { /* ... */ },
  "snacks": { /* ... */ },
  "protein": 150,
  "carbs": 200,
  "fats": 60,
  "fiber": 30,
  "notes": "Optional notes"
}
```

---

## 👥 Trainer Endpoints

### 1. Get All Trainers
**GET** `/trainers`

**Authentication:** Required

---

### 2. Get Trainer by ID
**GET** `/trainers/:id`

**Authentication:** Required

---

### 3. Create Trainer
**POST** `/trainers`

**Authentication:** Required | **Role:** Admin

**Request Body:**
```json
{
  "userId": "user_id",
  "specialization": ["Strength Training", "Cardio"],
  "certification": ["ACE", "ISSA"],
  "yearsOfExperience": 5,
  "bio": "Experienced fitness trainer",
  "hourlyRate": 500
}
```

---

### 4. Assign Training to Member
**POST** `/trainers/assign`

**Authentication:** Required | **Role:** Admin, Staff

**Request Body:**
```json
{
  "memberId": "member_id",
  "trainerId": "trainer_id",
  "packageName": "Premium Training",
  "totalSessions": 20,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

---

## 📅 Attendance Endpoints

### 1. Check In Member
**POST** `/attendance/check-in`

**Authentication:** Required

**Request Body:**
```json
{
  "memberId": "member_id",
  "checkInMethod": "staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member checked in successfully",
  "attendance": {
    "_id": "attendance_id",
    "memberId": "member_id",
    "checkInTime": "2024-01-15T10:00:00Z",
    "checkInMethod": "staff",
    "date": "2024-01-15"
  }
}
```

---

### 2. Check Out Member
**POST** `/attendance/check-out`

**Authentication:** Required | **Role:** Admin, Staff

**Request Body:**
```json
{
  "attendanceId": "attendance_id"
}
```

---

### 3. Get Daily Attendance
**GET** `/attendance/daily?date=2024-01-15`

**Authentication:** Required | **Role:** Admin, Staff

**Response:**
```json
{
  "success": true,
  "count": 25,
  "attendance": [
    {
      "_id": "attendance_id",
      "memberId": { "userId": { "name": "John Doe" } },
      "checkInTime": "10:00:00",
      "checkOutTime": "11:30:00",
      "duration": 90,
      "checkInMethod": "staff"
    }
  ]
}
```

---

## 📄 Invoice Endpoints

### 1. Get All Invoices
**GET** `/invoices`

**Authentication:** Required | **Role:** Admin

---

### 2. Get Invoice by ID
**GET** `/invoices/:id`

**Authentication:** Required

---

### 3. Get Invoice by Number
**GET** `/invoices/number/:invoiceNumber`

**Authentication:** Required

---

### 4. Get Invoice Data (For PDF)
**GET** `/invoices/:id/data`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "gymName": "WFC – Wolverine Fitness Club",
    "invoiceNumber": "INV-123456",
    "memberName": "John Doe",
    "memberEmail": "john@example.com",
    "planName": "Basic Plan",
    "amount": 1000,
    "paymentMode": "cash",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

---

## 🏷️ Plan Endpoints

### 1. Get All Plans
**GET** `/plans`

No authentication required.

**Response:**
```json
{
  "success": true,
  "count": 4,
  "plans": [
    {
      "_id": "plan_id",
      "name": "Basic Plan",
      "duration": 30,
      "price": 1000,
      "description": "Monthly membership",
      "features": ["Unlimited gym access", "Locker facility"]
    }
  ]
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Rate Limiting & Pagination

Future implementations will include:
- Rate limiting (100 requests per minute per IP)
- Pagination (default page size: 10, max: 100)
- Filtering and sorting

---

## Webhooks (Future)

Planned webhook events:
- member.registered
- payment.received
- membership.expired
- trainer.assigned

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"9876543210","password":"pass123","role":"member"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Members
curl -X GET http://localhost:5000/api/v1/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

For more information, see the [Implementation Guide](./IMPLEMENTATION_GUIDE.md).
