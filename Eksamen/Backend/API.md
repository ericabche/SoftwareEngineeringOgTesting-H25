# API Documentation

This document describes all available API endpoints for the Bussapp backend.

**Base URL:** `http://localhost:8081` (development) or `https://itstud.hiof.no/~philipag/app/` (production)

---

## Authentication Endpoints

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "token": "jwt_token_here",
  "username": "john.doe@example.com",
  "message": "User registered successfully!"
}
```

**Response (Error - 400):**
```json
{
  "token": null,
  "username": null,
  "message": "Email already exists"
}
```

---

### POST `/auth/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "john.doe@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "token": "jwt_token_here",
  "username": "john.doe@example.com",
  "message": "Login successful"
}
```

**Response (Error - 400):**
```json
{
  "token": null,
  "username": null,
  "message": "Invalid credentials"
}
```

---

### POST `/auth/logout`
Logout endpoint (client-side token removal).

**Response (Success - 200):**
```json
{
  "token": null,
  "username": null,
  "message": "Logged out successfully"
}
```

---

### POST `/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "If email exists, a password reset link has been sent"
}
```

---

### POST `/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## Route Endpoints

### GET `/api/route`
Get bus routes between two locations.

**Query Parameters:**
- `from` (required): Origin location
- `to` (required): Destination location
- `delay` (optional, default: 0): Delay in minutes

**Example:**
```
GET /api/route?from=Sarpsborg&to=Halden&delay=5
```

**Response (Success - 200):**
```json
{
  "itineraries": [
    {
      "from": "Sarpsborg",
      "to": "Halden",
      "durationMinutes": 35,
      "departureTime": "2025-11-05T14:05:00+01:00",
      "arrivalTime": "2025-11-05T14:40:00+01:00",
      "routeCode": "633",
      "routeName": "Skjeberg–Halden"
    }
  ]
}
```

---

## Ticket Endpoints

### GET `/api/tickets`
Get all available tickets based on location and time.

**Query Parameters:**
- `location` (optional): Location filter
- `time` (optional): Time filter

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "route": "Sarpsborg–Halden",
    "departureTime": "2025-11-05T14:05:00+01:00",
    "price": 50
  }
]
```

---

### GET `/api/tickets/{id}`
Get specific ticket by ID.

**Response (Success - 200):**
```json
{
  "id": 1,
  "route": "Sarpsborg–Halden",
  "departureTime": "2025-11-05T14:05:00+01:00",
  "qrCode": "qr_code_hash",
  "state": "NEW"
}
```

---

### GET `/api/tickets/history`
Get ticket purchase history.

**Query Parameters:**
- `page` (optional, default: 0): Page number
- `size` (optional, default: 8): Items per page

**Response (Success - 200):**
```json
{
  "tickets": [
    {
      "id": 1,
      "route": "Sarpsborg–Halden",
      "purchasedAt": "2025-11-05T10:00:00+01:00",
      "state": "NEW"
    }
  ],
  "page": 0,
  "totalPages": 1
}
```

---

### POST `/api/tickets/buy`
Purchase a ticket.

**Request Body:**
```json
{
  "departureId": 1,
  "paymentMethodId": 1,
  "fareType": "ADULT"
}
```

**Response (Success - 200):**
```json
{
  "ticketId": 1,
  "message": "Ticket purchase successful",
  "success": true
}
```

---

### GET `/api/tickets/{id}/download`
Download ticket as PDF/QR code.

**Response (Success - 200):**
```json
{
  "message": "Ticket download initiated",
  "url": "/tickets/1/pdf"
}
```

---

### POST `/api/tickets/{id}/refund`
Request ticket refund.

**Response (Success - 200):**
```json
{
  "message": "Refund request processed"
}
```

---

## Profile Endpoints

### GET `/api/profile`
Get all profile data.

**Response (Success - 200):**
```json
{
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "phone": "+47 123 45 678",
  "createdAt": "2025-01-01T00:00:00+01:00"
}
```

---

### POST `/api/profile/changetel`
Change phone number.

**Request Body:**
```json
{
  "phone": "+47 987 65 432"
}
```

**Response (Success - 200):**
```json
{
  "message": "Phone number updated successfully"
}
```

---

### POST `/api/profile/changeemail`
Change email address.

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "Email updated successfully"
}
```

---

### POST `/api/profile/changename`
Change first and last name.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (Success - 200):**
```json
{
  "message": "Name updated successfully"
}
```

---

### POST `/api/profile/changepassword`
Change password.

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Favorite Endpoints

### GET `/api/favorites/saved-trips`
Get saved bus trips for user.

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "from": "Sarpsborg",
    "to": "Halden",
    "routeCode": "633"
  }
]
```

---

### POST `/api/favorites/save-trip`
Save trip to saved trips.

**Request Body:**
```json
{
  "from": "Sarpsborg",
  "to": "Halden",
  "routeCode": "633"
}
```

**Response (Success - 200):**
```json
{
  "message": "Trip saved successfully"
}
```

---

### GET `/api/favorites/favorite-trips`
Get favorite trips.

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "from": "Sarpsborg",
    "to": "Halden",
    "routeCode": "633"
  }
]
```

---

### POST `/api/favorites/favorite-trip`
Save favorite trip.

**Request Body:**
```json
{
  "from": "Sarpsborg",
  "to": "Halden",
  "routeCode": "633"
}
```

**Response (Success - 200):**
```json
{
  "message": "Favorite trip saved successfully"
}
```

---

### DELETE `/api/favorites/favorite-trip/{id}`
Remove favorite trip.

**Response (Success - 200):**
```json
{
  "message": "Favorite trip removed successfully"
}
```

---

## Payment Endpoints

### GET `/api/payment/methods`
Get available payment methods.

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "name": "Credit Card",
    "type": "CARD"
  },
  {
    "id": 2,
    "name": "PayPal",
    "type": "PAYPAL"
  }
]
```

---

## Realtime Endpoints

### GET `/api/realtime/stop/{stopId}`
Get live bus data for a specific stop.

**Response (Success - 200):**
```json
{
  "stopId": 1,
  "departures": [
    {
      "route": "633",
      "expectedTime": "2025-11-05T14:05:00+01:00",
      "delay": 0
    }
  ],
  "delays": []
}
```

---

### GET `/api/realtime/bus/{busId}`
Get live bus position.

**Response (Success - 200):**
```json
{
  "busId": 1,
  "latitude": 59.2833,
  "longitude": 11.1096,
  "route": "633",
  "status": "IN_PROGRESS"
}
```

---

### POST `/api/realtime/notification`
Set notification for bus arrival.

**Request Body:**
```json
{
  "stopId": 1,
  "routeCode": "633",
  "minutesBefore": 5
}
```

**Response (Success - 200):**
```json
{
  "message": "Notification set successfully"
}
```

---

## Settings Endpoints

### GET `/api/settings`
Get user settings.

**Response (Success - 200):**
```json
{
  "notifications": true,
  "theme": "light",
  "language": "no",
  "privacy": {
    "shareLocation": false
  }
}
```

---

### PUT `/api/settings/notifications`
Update notification settings.

**Request Body:**
```json
{
  "enabled": true
}
```

**Response (Success - 200):**
```json
{
  "message": "Notification settings updated"
}
```

---

### PUT `/api/settings/theme`
Update theme settings.

**Request Body:**
```json
{
  "theme": "dark"
}
```

**Response (Success - 200):**
```json
{
  "message": "Theme updated"
}
```

---

### PUT `/api/settings/language`
Update language settings.

**Request Body:**
```json
{
  "language": "en"
}
```

**Response (Success - 200):**
```json
{
  "message": "Language updated"
}
```

---

### PUT `/api/settings/privacy`
Update privacy settings.

**Request Body:**
```json
{
  "shareLocation": false
}
```

**Response (Success - 200):**
```json
{
  "message": "Privacy settings updated"
}
```

---

## Support Endpoints

### GET `/api/support/contact`
Get contact information.

**Response (Success - 200):**
```json
{
  "email": "support@bussapp.no",
  "phone": "+47 123 45 678",
  "address": "Bussveien 1, 1234 Oslo"
}
```

---

### GET `/api/support/faq`
Get frequently asked questions.

**Response (Success - 200):**
```json
[
  {
    "question": "Hvordan kjøper jeg billett?",
    "answer": "Du kan kjøpe billett gjennom appen ved å velge rute og betalingsmetode."
  }
]
```

---

### POST `/api/support/message`
Send support message.

**Request Body:**
```json
{
  "subject": "Question about tickets",
  "message": "How do I refund a ticket?",
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "message": "Support message sent successfully"
}
```

---

## Admin Endpoints

### GET `/api/admin/users`
Get all users (Admin only).

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "isActive": true
  }
]
```

---

### GET `/api/admin/users/{id}`
Get user by ID (Admin only).

**Response (Success - 200):**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "isActive": true
}
```

---

### POST `/api/admin/users`
Create new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "fullName": "New User",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "fullName": "New User",
  "isActive": true
}
```

---

### PUT `/api/admin/users/{id}`
Update user (Admin only).

**Request Body:**
```json
{
  "email": "updated@example.com",
  "fullName": "Updated User",
  "isActive": true
}
```

**Response (Success - 200):**
```json
{
  "id": 1,
  "email": "updated@example.com",
  "fullName": "Updated User",
  "isActive": true
}
```

---

### DELETE `/api/admin/users/{id}`
Delete user (Admin only).

**Response (Success - 200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### GET `/api/admin/routes`
Get all routes (Admin only).

**Response (Success - 200):**
```json
[
  {
    "id": 1,
    "code": "633",
    "name": "Sarpsborg–Halden",
    "active": true
  }
]
```

---

### GET `/api/admin/stats`
Get system statistics (Admin only).

**Response (Success - 200):**
```json
{
  "totalUsers": 100,
  "totalTickets": 500,
  "totalRoutes": 12,
  "activeBuses": 5,
  "revenue": 25000
}
```

---

## Health Endpoints

### GET `/api/health`
Check if the server is running.

**Response (Success - 200):**
```
Serveren kjører
```

---

## Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Public endpoints (no authentication required):**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /api/health`
- `GET /api/route`
- `GET /api/support/contact`
- `GET /api/support/faq`

**Admin endpoints (require admin role):**
- All `/api/admin/*` endpoints

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message here"
}
```

Or for auth endpoints:

```json
{
  "token": null,
  "username": null,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors, invalid credentials)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

- All timestamps are in ISO 8601 format with timezone
- All prices are in cents (integer)
- JWT tokens expire after 24 hours
- Passwords are hashed using BCrypt
- Most endpoints return JSON
- Admin endpoints require admin role verification
