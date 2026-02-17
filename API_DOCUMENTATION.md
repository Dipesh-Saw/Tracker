# 🔌 API Documentation

Complete API reference for Document Tracker application.

---

## 📋 Base URL

```
http://localhost:3000
```

---

## 🔐 Authentication

All API endpoints (except auth routes) require session-based authentication.

### Session Management

- Sessions stored in MongoDB
- Cookie-based (httpOnly)
- Expires after 24 hours
- Renewed on activity

---

## 📡 Endpoints

### Authentication Routes

#### 1. Login Page

```http
GET /auth/login
```

**Response:** HTML login page

**Usage:**

```
Navigate to: http://localhost:3000/auth/login
```

---

#### 2. Login User

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**

```http
302 Redirect to /
Set-Cookie: connect.sid=...
```

**Response (Error):**

```http
302 Redirect to /auth/login?error=Invalid+credentials
```

**Example (curl):**

```bash
curl -X POST http://localhost:3000/auth/login \
  -d "email=user@example.com&password=password123" \
  -c cookies.txt
```

---

#### 3. Register Page

```http
GET /auth/register
```

**Response:** HTML registration page

---

#### 4. Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "username": "JohnDoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**

```http
302 Redirect to /auth/login
```

**Response (Error):**

```json
{
  "error": "Email already exists"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "JohnDoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

#### 5. Logout

```http
GET /auth/logout
```

**Response:**

```http
302 Redirect to /auth/login
```

**Example:**

```bash
curl -X GET http://localhost:3000/auth/logout \
  -b cookies.txt
```

---

#### 6. Forgot Password Page

```http
GET /auth/forgot-password
```

**Response:** HTML forgot password page

---

#### 7. Forgot Password

```http
POST /auth/forgot-password
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset link sent to email"
}
```

---

### Application Routes

#### 8. Main Dashboard (Entry Form)

```http
GET /
```

**Authentication:** Required  
**Response:** HTML entry form page

**Data Included:**

- Recent entries (last 5)
- Available platforms
- Available queues
- Document types
- User list (if admin)

**Example:**

```bash
curl -X GET http://localhost:3000/ \
  -b cookies.txt
```

---

#### 9. Create Entry

```http
POST /api/entry
```

**Authentication:** Required

**Request Body:**

```json
{
  "username": "JohnDoe",
  "date": "2026-02-17",
  "dayType": "Full Day",
  "entries": [
    {
      "platform": "PEGA",
      "queue": "Queue1",
      "docType": "DC",
      "count": 25,
      "timeInMins": 120
    },
    {
      "platform": "WISE",
      "queue": "Queue2",
      "docType": "Apple",
      "count": 15,
      "timeInMins": 90
    }
  ]
}
```

**Field Descriptions:**

- `username`: User who performed the work
- `date`: Date of work (YYYY-MM-DD)
- `dayType`: "Half Day", "Full Day", or "PTO"
- `entries`: Array of entry objects
  - `platform`: Platform used (from MyObjects.js)
  - `queue`: Queue name (from MyObjects.js)
  - `docType`: Document type (from MyObjects.js)
  - `count`: Number of documents (integer)
  - `timeInMins`: Time spent in minutes (integer)

**Response (Success):**

```json
{
  "message": "Entry saved successfully!",
  "entry": {
    "_id": "65f1234567890abcdef12345",
    "user": "65f1234567890abcdef12346",
    "username": "JohnDoe",
    "date": "2026-02-17T00:00:00.000Z",
    "dayType": "Full Day",
    "entries": [...],
    "createdAt": "2026-02-17T10:30:00.000Z"
  }
}
```

**Response (Error):**

```json
{
  "error": "Invalid entry data"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/entry \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "username": "JohnDoe",
    "date": "2026-02-17",
    "dayType": "Full Day",
    "entries": [
      {
        "platform": "PEGA",
        "queue": "Queue1",
        "docType": "DC",
        "count": 25,
        "timeInMins": 120
      }
    ]
  }'
```

---

#### 10. Analytics Dashboard

```http
GET /dashboard
```

**Authentication:** Required

**Response:** HTML analytics dashboard page

**Data Included:**

- All entries (filtered by user role)
  - Admin: All users' entries
  - Regular: Own entries only
- Available queues
- Chart data

**Example:**

```bash
curl -X GET http://localhost:3000/dashboard \
  -b cookies.txt
```

---

#### 11. Export to Excel

```http
GET /api/export-excel
```

**Authentication:** Required

**Response:** Excel file (.xlsx)

**Headers:**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=productivity-report-YYYY-MM-DD.xlsx
```

**File Structure:**

- Sheet name: "Productivity Report"
- Columns:
  - Username
  - Date
  - Day Type
  - Platform
  - Queue
  - Document Type
  - Count
  - Time (mins)

**Example:**

```bash
curl -X GET http://localhost:3000/api/export-excel \
  -b cookies.txt \
  -o report.xlsx
```

---

## 📊 Data Models

### User Object

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "string (hashed)",
  "isAdmin": "boolean",
  "resetToken": "string (optional)",
  "resetTokenExpiry": "Date (optional)"
}
```

### Entry Object

```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "username": "string",
  "date": "Date",
  "dayType": "string (Half Day|Full Day|PTO)",
  "entries": [
    {
      "platform": "string",
      "docType": "string",
      "queue": "string",
      "count": "number",
      "timeInMins": "number"
    }
  ],
  "createdAt": "Date"
}
```

---

## 🔒 Authorization

### Regular User Access

```javascript
// Can only access own data
const entries = await Entry.find({ user: req.session.userId });
```

### Admin Access

```javascript
// Can access all data
const entries = await Entry.find({});
```

---

## ⚠️ Error Handling

### Common Error Responses

#### 401 Unauthorized

```http
302 Redirect to /auth/login
```

**Cause:** No active session

#### 400 Bad Request

```json
{
  "error": "Invalid request data"
}
```

**Cause:** Missing or invalid fields

#### 500 Internal Server Error

```json
{
  "error": "Server error occurred"
}
```

**Cause:** Database error or server issue

---

## 🧪 Testing Examples

### Create a Complete Entry Flow

```bash
# 1. Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestUser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -d "email=test@example.com&password=TestPass123" \
  -c cookies.txt

# 3. Create entry
curl -X POST http://localhost:3000/api/entry \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestUser",
    "date": "2026-02-17",
    "dayType": "Full Day",
    "entries": [
      {
        "platform": "PEGA",
        "queue": "Queue1",
        "docType": "DC",
        "count": 50,
        "timeInMins": 240
      }
    ]
  }'

# 4. Export data
curl -X GET http://localhost:3000/api/export-excel \
  -b cookies.txt \
  -o report.xlsx

# 5. Logout
curl -X GET http://localhost:3000/auth/logout \
  -b cookies.txt
```

---

## 📝 Request Validation

### Entry Creation Rules

- ✅ `username` must exist in database
- ✅ `date` must be valid date format
- ✅ `dayType` must be one of: "Half Day", "Full Day", "PTO"
- ✅ `entries` must be non-empty array
- ✅ Each entry must have all required fields
- ✅ `count` and `timeInMins` must be positive numbers
- ✅ `platform`, `queue`, `docType` must match MyObjects.js values

---

## 🔄 Response Formats

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message description"
}
```

### Redirect Response

```http
HTTP/1.1 302 Found
Location: /target-url
```

---

## 🌐 CORS

Currently, CORS is not enabled. All requests must come from the same origin.

To enable CORS, add:

```javascript
const cors = require("cors");
app.use(cors());
```

---

## 📈 Rate Limiting

Currently, no rate limiting is implemented. Consider adding for production:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## 🔐 Security Considerations

1. **Always use HTTPS** in production
2. **Set secure cookie flags** for production
3. **Implement CSRF protection**
4. **Add input sanitization**
5. **Enable rate limiting**
6. **Use environment variables** for secrets

---

## 📚 Additional Notes

- All dates are stored in UTC
- Times are in minutes (convert to hours for display)
- Sessions expire after 24 hours of inactivity
- Excel export includes all user's entries
- Admin can export all entries

---

**API Version:** 1.0.0  
**Last Updated:** February 17, 2026
