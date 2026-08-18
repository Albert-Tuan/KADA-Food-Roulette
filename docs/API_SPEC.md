# API SPECIFICATION

## FOOD ROULETTE

> **Version:** 1.2 · **Date:** 2026-08-09
> **Base URL:** `https://api.foodroulette.app/api/v1`
> **Authentication:** Bearer Token (JWT)

---

## MỤC LỤC

1. [Cấu trúc chung](#1-cấu-trúc-chung)
2. [Authentication APIs](#2-authentication-apis)
3. [User/Profile APIs](#3-userprofile-apis)
4. [Spin APIs](#4-spin-apis)
5. [Locket APIs](#5-locket-apis)
6. [Review APIs](#6-review-apis)
7. [Restaurant APIs](#7-restaurant-apis)
8. [Steward APIs](#8-steward-apis)
9. [Partner APIs](#9-partner-apis)
10. [Notification APIs](#10-notification-apis)
11. [System APIs](#11-system-apis)
12. [WebSocket APIs](#12-websocket-apis)

---

## 1. CẤU TRÚC CHUNG

### 1.1 Common Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>           # Optional, for tracing
X-Device-ID: <device_hash>      # Required for Locket upload
X-App-Version: <string>         # e.g., "1.0.0"
X-Platform: <ios|android>       # e.g., "ios"
```

### 1.2 Common Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": { ... }
  }
}
```

### 1.3 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (Delete success) |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Invalid/missing token) |
| 403 | Forbidden (No permission) |
| 404 | Not Found |
| 409 | Conflict (Duplicate) |
| 422 | Unprocessable Entity (Business rule violation) |
| 429 | Too Many Requests (Rate limit) |
| 500 | Internal Server Error |

### 1.4 Pagination

#### Offset Pagination (Standard)

```
Query params:
- page: int (default: 1)
- per_page: int (default: 20, max: 100)

Response meta:
{
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### Cursor Pagination (High-Volume Feeds)

**Use for:** `/lockets`, `/notifications` (high-volume data)

```
Query params:
- cursor: string (optional, opaque token from previous response)
- limit: int (default: 20, max: 50)
- direction: "forward" | "backward" (default: "forward")

Response meta:
{
  "meta": {
    "cursor_next": "eyJpZCI6MTIzNH0=",
    "cursor_prev": null,
    "has_more": true,
    "limit": 20
  }
}
```

**Implementation Notes:**
- Cursor based on `id` (UUID) with timestamp for ordering
- Cursor is Base64-encoded JSON: `{"id": "uuid", "created_at": "ISO8601"}`
- Use `limit=1` to check if more data exists

---

---

## 2. AUTHENTICATION APIs

### 2.1 Register

```
POST /auth/register
```

**Description:** Đăng ký tài khoản mới

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "display_name_private": "Mini",
  "display_name_public": "minifoodie",
  "cuisine_preferences": ["vietnamese", "italian"],
  "dietary_preferences": ["none"]
}
```

**Validation Rules:**
- `email`: required, valid email format, unique
- `password`: required, min 8 chars, at least 1 uppercase, 1 number
- `display_name_private`: required, 2-50 chars, unique in friends list
- `display_name_public`: required, 2-30 chars, alphanumeric + underscore only, unique, immutable after creation

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "display_name_private": "Mini",
      "display_name_public": "minifoodie",
      "public_id": "minifoodie",
      "avatar_url": null,
      "created_at": "2026-08-07T12:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

---

### 2.2 Login

```
POST /auth/login
```

**Description:** Đăng nhập bằng email/password

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

**Error Codes:**
- `AUTH_001`: Invalid credentials (wrong email or password)

---

### 2.3 Login with Google OAuth

```
POST /auth/google
```

**Description:** Đăng nhập/đăng ký bằng Google OAuth

**Auth Required:** No

**Request Body:**
```json
{
  "id_token": "google_id_token_string",
  "cuisine_preferences": ["vietnamese"],
  "dietary_preferences": ["none"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "is_new_user": true,
    "expires_in": 86400
  }
}
```

---

### 2.4 Forgot Password

```
POST /auth/forgot-password
```

**Description:** Gửi email reset password

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reset password email sent"
}
```

---

### 2.5 Reset Password

```
POST /auth/reset-password
```

**Description:** Đặt lại password bằng reset token

**Auth Required:** No

**Request Body:**
```json
{
  "reset_token": "token_from_email",
  "new_password": "NewSecurePass123"
}
```

**Validation Rules:**
- `reset_token`: required, valid, not expired (1h)
- `new_password`: required, min 8 chars, at least 1 uppercase, 1 number

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 2.6 Refresh Token

```
POST /auth/refresh
```

**Description:** Làm mới access token

**Auth Required:** No (Refresh token in body)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

---

### 2.7 Logout

```
POST /auth/logout
```

**Description:** Đăng xuất, revoke tokens

**Auth Required:** Yes

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2.8 Change Password

```
POST /auth/change-password
```

**Description:** Đổi password khi đã đăng nhập

**Auth Required:** Yes

**Request Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Notes:**
- All existing refresh tokens are automatically revoked upon password change
- User must re-authenticate on all devices

---

### 2.9 Verify Email

```
POST /auth/verify-email
```

**Description:** Xác thực email qua verification token

**Auth Required:** No

**Request Body:**
```json
{
  "verification_token": "abc123xyz"
}
```

**Validation Rules:**
- Token phải còn hiệu lực (expire 24h)
- Token là single-use

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": { ... }
  }
}
```

**Error Codes:**
- `AUTH_005`: Invalid verification token
- `AUTH_006`: Verification token expired

---

### 2.10 Resend Verification Email

```
POST /auth/resend-verification
```

**Description:** Gửi lại email xác thực

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Validation Rules:**
- Email chưa được verify mới gửi được
- Rate limit: 1 email/5 phút

**Error Codes:**
- `AUTH_007`: Email already verified

---

### 2.11 Revoke All Sessions

```
POST /auth/revoke-all-sessions
```

**Description:** Thu hồi tất cả tokens trên mọi thiết bị

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "All sessions revoked"
}
```

---

## 3. USER/PROFILE APIs

### 3.1 Get My Profile

```
GET /users/me
```

**Description:** Lấy thông tin profile của user hiện tại

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name_private": "Mini",
    "display_name_public": "minifoodie",
    "public_id": "minifoodie",
    "avatar_url": "https://cdn.foodroulette.app/avatars/xxx.jpg",
    "bio": "Food lover from Hanoi",
    "stats": {
      "locket_count": 15,
      "check_in_count": 8,
      "group_count": 3
    },
    "public_lockets": [],
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

### 3.2 Update My Profile

```
PATCH /users/me
```

**Description:** Cập nhật thông tin cá nhân

**Auth Required:** Yes

**Request Body:**
```json
{
  "bio": "Updated bio",                 // Optional, max 160 chars
  "display_name_private": "NewMini",    // Optional
  "display_name_public": "NewPublicName" // Optional; public_id không đổi
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name_private": "NewMini",
    "avatar_url": "https://cdn.foodroulette.app/avatars/xxx.jpg",
    ...
  }
}
```

**Storage boundary:** cập nhật avatar chưa được bật cho tới khi Supabase Storage/bucket policy được chốt; gửi `avatar` hoặc `avatar_uri` hiện trả `503 PROFILE_STORAGE_PENDING`.

---

### 3.3 Get Public Profile

```
GET /users/:public_id
```

**Description:** Lấy thông tin public profile của user khác

**Auth Required:** No (Optional)

**Path Params:**
- `public_id`: Định danh công khai bất biến của user

**Response (200):**
```json
{
  "success": true,
  "data": {
    "public_id": "minifoodie",
    "display_name_public": "minifoodie",
    "avatar_url": "https://cdn.foodroulette.app/avatars/xxx.jpg",
    "bio": "Food lover from Hanoi",
    "stats": {
      "locket_count": 15,
      "check_in_count": 8,
      "group_count": 3
    },
    "public_lockets": [],
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

**Notes:**
- Chỉ trả về thông tin công khai
- KHÔNG trả về email, display_name_private, friends list

---

### 3.4 Upload Avatar

> **Trạng thái:** Chưa triển khai — đang chờ Supabase Storage/bucket policy từ Thành Nam.

```
POST /users/me/avatar
```

**Description:** Upload avatar mới

**Auth Required:** Yes

**Request:** `multipart/form-data`

**Form Fields:**
- `avatar`: File (required), max 5MB, jpg/png

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://cdn.foodroulette.app/avatars/xxx.jpg"
  }
}
```

---

### 3.5 Delete Avatar

> **Trạng thái:** Chưa triển khai — đang chờ Supabase Storage/bucket policy từ Thành Nam.

```
DELETE /users/me/avatar
```

**Description:** Xóa avatar, revert về default

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatar_url": null
  }
}
```

---

### 3.6 Get My Friends

```
GET /users/me/friends
```

**Description:** Lấy danh sách bạn bè

**Auth Required:** Yes

**Query Params:**
- `page`: int (default: 1)
- `per_page`: int (default: 20, max: 100)
- `status`: filter by status (optional): `accepted` | `pending_sent` | `pending_received`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "public_id": "friend1",
      "display_name_private": "Min",
      "display_name_public": "minfood",
      "avatar_url": "...",
      "friendship_status": "accepted",
      "friends_since": "2026-06-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 42 }
}
```

---

### 3.7 Send Friend Request

```
POST /users/me/friends
```

**Description:** Gửi yêu cầu kết bạn

**Auth Required:** Yes

**Request Body:**
```json
{
  "user_id": "uuid_of_target_user"
}
```

**Validation Rules (USER_QĐ_8):**
- Target user chưa gửi request cho mình
- Chưa là bạn với target user
- Mỗi user tối đa 500 bạn

**Response (201):**
```json
{
  "success": true,
  "data": {
    "friendship_id": "uuid",
    "status": "pending",
    "user": { ... }
  }
}
```

**Error Codes:**
- `USER_001`: User not found
- `USER_002`: Already friends
- `USER_003`: Request already sent
- `USER_004`: Friend limit reached (max 500)

---

### 3.8 Accept Friend Request

```
POST /users/me/friends/:friendship_id/accept
```

**Description:** Chấp nhận yêu cầu kết bạn

**Auth Required:** Yes

**Path Params:**
- `friendship_id`: UUID của friendship

**Response (200):**
```json
{
  "success": true,
  "data": {
    "friendship_id": "uuid",
    "status": "accepted",
    "friends_since": "2026-08-07T12:00:00Z"
  }
}
```

---

### 3.9 Reject Friend Request

```
POST /users/me/friends/:friendship_id/reject
```

**Description:** Từ chối yêu cầu kết bạn

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request rejected"
}
```

---

### 3.10 Remove Friend

```
DELETE /users/me/friends/:friendship_id
```

**Description:** Xóa bạn bè

**Auth Required:** Yes

**Response (204):** No Content

---

### 3.11 Block User

```
POST /users/me/blocks
```

**Description:** Chặn user

**Auth Required:** Yes

**Request Body:**
```json
{
  "user_id": "uuid_of_user_to_block"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User blocked"
}
```

---

### 3.12 Unblock User

```
DELETE /users/me/blocks/:user_id
```

**Description:** Bỏ chặn user

**Auth Required:** Yes

**Response (204):** No Content

---

### 3.13 Search Users

```
GET /users/search
```

**Description:** Tìm kiếm user theo public_id hoặc display_name

**Auth Required:** Yes

**Query Params:**
- `q`: Search query (required), min 2 chars
- `page`: int (default: 1)
- `per_page`: int (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "public_id": "minifoodie",
      "display_name_public": "minifoodie",
      "avatar_url": "...",
      "is_friend": false,
      "friend_status": null
    }
  ],
  "meta": { ... }
}
```

---

### 3.14 Get User Settings

```
GET /users/me/settings
```

**Description:** Lấy cài đặt của user

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "push_enabled": true,
      "email_enabled": false,
      "friend_requests": true,
      "spin_results": true,
      "locket_likes": true,
      "locket_comments": true,
      "reviews_on_my_restaurants": true
    },
    "privacy": {
      "default_locket_visibility": "friends",
      "show_on_public_leaderboard": true,
      "show_reviews_on_profile": true
    }
  }
}
```

---

### 3.15 Update User Settings

```
PATCH /users/me/settings
```

**Description:** Cập nhật cài đặt

**Auth Required:** Yes

**Request Body:**
```json
{
  "notifications": {
    "push_enabled": true,
    "friend_requests": false
  },
  "privacy": {
    "default_locket_visibility": "public"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 3.16 Delete Account

```
DELETE /users/me
```

**Description:** Xóa tài khoản người dùng (soft delete)

**Auth Required:** Yes

**Request Body:**
```json
{
  "password": "CurrentPassword123",
  "confirmation_text": "XÓA TÀI KHOẢN"
}
```

**Validation Rules:**
- Password phải đúng
- confirmation_text phải khớp chính xác
- Tất cả tokens của user bị revoke
- Data được anonymize sau 30 ngày

**Response (200):**
```json
{
  "success": true,
  "message": "Account scheduled for deletion",
  "data": {
    "deletion_scheduled_at": "2026-09-06T12:00:00Z",
    "recover_until": "2026-09-06T12:00:00Z"
  }
}
```

**Error Codes:**
- `AUTH_008`: Invalid password
- `AUTH_009`: Confirmation text mismatch

**Notes:**
- Account is soft-deleted immediately (hidden from other users)
- Data is retained for 30 days for recovery
- After 30 days, data is permanently anonymized
- User can cancel deletion by logging in within 30 days

---

## 4. SPIN APIs

### 4.1 Personal Spin

```
POST /spins
```

**Description:** Quay bánh xe chọn quán ngẫu nhiên (cá nhân)

**Auth Required:** Yes

**Request Body:**
```json
{
  "filters": {
    "distance_km": 3,
    "cuisines": ["vietnamese", "italian"],
    "price_range": ["$", "$$"],
    "open_now": true
  },
  "location": {
    "latitude": 21.0285,
    "longitude": 105.8542
  }
}
```

**Validation Rules (SPIN_QĐ_1, SPIN_QĐ_2, SPIN_QĐ_3):**
- Distance: 0.5 - 10 km
- User phải có GPS permission
- Phải có ít nhất 1 restaurant trong bán kính
- Restaurant phải có status = 'approved'

**Response (201):**
```json
{
  "success": true,
  "data": {
    "spin_id": "uuid",
    "result": {
      "restaurant": {
        "id": "uuid",
        "name": "Quán Ăn Ngon",
        "address": "123 Đường ABC, Quận 1",
        "latitude": 21.0290,
        "longitude": 105.8550,
        "cuisine": "vietnamese",
        "price_range": "$$",
        "rating": 4.5,
        "review_count": 120,
        "distance_km": 0.8,
        "photo_url": "https://cdn.foodroulette.app/restaurants/xxx.jpg",
        "phone": "+84-123-456-789",
        "opening_hours": "08:00 - 22:00",
        "is_open": true
      },
      "spin_number": 1,
      "total_spins_today": 1
    },
    "filters_used": { ... },
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

**Error Codes:**
- `SPIN_001`: No restaurant in range
- `SPIN_002`: GPS permission denied

---

### 4.2 Respin

```
POST /spins/:spin_id/respin
```

**Description:** Quay lại (respin) - tối đa 3 lần/session

**Auth Required:** Yes

**Path Params:**
- `spin_id`: UUID của spin gốc

**Response (201):**
```json
{
  "success": true,
  "data": {
    "spin_id": "uuid",
    "result": {
      "restaurant": { ... },
      "spin_number": 2,
      "total_spins_today": 2
    },
    "remaining_respins": 2
  }
}
```

**Error Codes:**
- `SPIN_002`: Respin limit exceeded
- `SPIN_003`: Respin cooldown not elapsed (10s)

---

### 4.3 Get Spin History

```
GET /spins
```

**Description:** Lấy lịch sử spin của user

**Auth Required:** Yes

**Query Params:**
- `page`: int (default: 1)
- `per_page`: int (default: 20)
- `from_date`: ISO date (optional)
- `to_date`: ISO date (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "spin_id": "uuid",
      "restaurant": { ... },
      "spin_number": 1,
      "was_accepted": true,
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### 4.4 Get Spin Detail

```
GET /spins/:spin_id
```

**Description:** Lấy chi tiết một spin

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spin_id": "uuid",
    "restaurant": { ... },
    "spin_number": 1,
    "filters_used": { ... },
    "was_accepted": true,
    "group_id": null,
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 4.5 Create Group Spin

```
POST /spins/groups
```

**Description:** Tạo nhóm spin mới

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Cuối tuần đi ăn",
  "max_members": 10,
  "filters": {
    "distance_km": 5,
    "cuisines": ["vietnamese"],
    "price_range": ["$", "$$"],
    "open_now": true
  }
}
```

**Validation Rules (SPIN_QĐ_5):**
- max_members: 5, 10, hoặc 20
- Creator tự động là host
- Group có unique invite_code (6 chars)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "name": "Cuối tuần đi ăn",
    "invite_code": "ABC123",
    "invite_link": "https://foodroulette.app/join/ABC123",
    "max_members": 10,
    "host": {
      "id": "uuid",
      "display_name_private": "Mini",
      "avatar_url": "..."
    },
    "member_count": 1,
    "status": "waiting",
    "filters": { ... },
    "expires_at": "2026-08-07T12:30:00Z",
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 4.6 Get Group Spin Detail

```
GET /spins/groups/:group_id
```

**Description:** Lấy chi tiết nhóm spin

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "name": "Cuối tuần đi ăn",
    "invite_code": "ABC123",
    "max_members": 10,
    "host": { ... },
    "members": [
      {
        "id": "uuid",
        "display_name_private": "Mini",
        "avatar_url": "...",
        "status": "joined",
        "joined_at": "2026-08-07T12:00:00Z"
      }
    ],
    "member_count": 1,
    "status": "waiting",
    "filters": { ... },
    "current_spin": null,
    "votes": [],
    "expires_at": "2026-08-07T12:30:00Z",
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 4.7 Join Group Spin

```
POST /spins/groups/:group_id/join
```

**Description:** Tham gia nhóm spin

**Auth Required:** Yes

**Request Body:**
```json
{
  "invite_code": "ABC123"
}
```

**Validation Rules (SPIN_QĐ_6, SPIN_QĐ_7):**
- Invite code còn hiệu lực
- Inviter phải là bạn của joiner (mutual friendship)
- Group chưa full
- User không trong group active khác

**Response (200):**
```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "member_status": "joined"
  }
}
```

**Error Codes:**
- `GROUP_001`: Group full
- `GROUP_002`: Invite code expired
- `GROUP_003`: Not friends with inviter
- `GROUP_004`: Already in another active group

---

### 4.8 Invite to Group

```
POST /spins/groups/:group_id/invite
```

**Description:** Mời bạn bè vào nhóm

**Auth Required:** Yes

**Request Body:**
```json
{
  "user_id": "uuid_of_friend"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "invite_id": "uuid",
    "invitee": {
      "id": "uuid",
      "display_name_private": "Friend"
    },
    "status": "pending"
  }
}
```

---

### 4.9 Leave Group

```
POST /spins/groups/:group_id/leave
```

**Description:** Rời khỏi nhóm spin

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

**Error Codes:**
- `GROUP_005`: Cannot leave while spin is in progress

---

### 4.10 Cancel Group Spin

```
POST /spins/groups/:group_id/cancel
```

**Description:** Hủy nhóm spin (chỉ host, trước khi spin)

**Auth Required:** Yes (Host only)

**Request Body:**
```json
{
  "reason": "Không đủ thành viên"
}
```

**Validation Rules:**
- Chỉ host được hủy
- Chỉ hủy được khi group chưa spin
- Notify all members via WebSocket

**Response (200):**
```json
{
  "success": true,
  "message": "Group spin cancelled",
  "data": {
    "group_id": "uuid",
    "status": "cancelled",
    "cancelled_by": "uuid",
    "cancelled_at": "2026-08-07T12:10:00Z"
  }
}
```

**Error Codes:**
- `GROUP_006`: Cannot cancel after spin has started

---

### 4.11 Execute Group Spin

```
POST /spins/groups/:group_id/spin
```

**Description:** Thực hiện spin cho nhóm (chỉ host)

**Auth Required:** Yes (Host only)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "spin_id": "uuid",
    "restaurant": { ... },
    "status": "voting",
    "vote_deadline": "2026-08-07T12:05:00Z"
  }
}
```

---

### 4.12 Vote on Group Result

```
POST /spins/groups/:group_id/vote
```

**Description:** Bình chọn kết quả group spin

**Auth Required:** Yes

**Request Body:**
```json
{
  "vote": "accept"  // "accept" | "respin"
}
```

**Validation Rules (SPIN_QĐ_8):**
- Group đang ở trạng thái voting
- User là thành viên group
- Mỗi user 1 vote (update nếu đã vote)

**Tie-Breaking Rules:**
- If votes are tied (e.g., 2 accept, 2 respin): automatic respin triggered
- Tie-breaking respins do NOT count against the 3-respin session limit
- Maximum 3 tie-breaking respins per session; if still tied after 3, random selection determines winner
- Users can vote again after each respin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vote": "accept",
    "votes_accepted": 3,
    "votes_respin": 1,
    "total_members": 5,
    "deadline": "2026-08-07T12:05:00Z"
  }
}
```

---

### 4.13 Get Group Votes

```
GET /spins/groups/:group_id/votes
```

**Description:** Lấy danh sách vote của nhóm

**Auth Required:** Yes (Group member)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "votes": [
      {
        "user": {
          "id": "uuid",
          "display_name_private": "Mini"
        },
        "vote": "accept",
        "voted_at": "2026-08-07T12:02:00Z"
      }
    ],
    "summary": {
      "accepted": 3,
      "respin": 1,
      "pending": 1
    },
    "deadline": "2026-08-07T12:05:00Z"
  }
}
```

---

### 4.14 End Group Spin

```
POST /spins/groups/:group_id/end
```

**Description:** Kết thúc nhóm spin (chỉ host)

**Auth Required:** Yes (Host only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "group_id": "uuid",
    "status": "completed",
    "final_restaurant": { ... },
    "total_participants": 5,
    "completed_at": "2026-08-07T12:10:00Z"
  }
}
```

---

### 4.15 Get My Groups

```
GET /spins/groups
```

**Description:** Lấy danh sách nhóm spin của user

**Auth Required:** Yes

**Query Params:**
- `status`: `active` | `completed` | `all` (default: active)
- `page`: int
- `per_page`: int

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "group_id": "uuid",
      "name": "Cuối tuần đi ăn",
      "status": "voting",
      "member_count": 5,
      "final_restaurant": { ... },
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

## 5. LOCKET APIs

### 5.1 Upload Locket

```
POST /lockets
```

**Description:** Upload locket mới (camera-only)

**Auth Required:** Yes

**Request:** `multipart/form-data`

**Form Fields:**
- `image`: File (required), max 10MB, jpg/png
- `restaurant_id`: UUID (optional)
- `note`: String (optional), max 280 chars
- `visibility`: `PUBLIC` | `FRIENDS` | `PRIVATE` (default: `FRIENDS`)
- `latitude`: Float (required)
- `longitude`: Float (required)

**Validation Rules (LOCKET_QĐ_1, LOCKET_QĐ_2, LOCKET_QĐ_3):**
- Image phải từ camera trong app (validated by device_hash + captured_at)
- captured_at không lệch server time > 60s
- Device hash phải match

**Device Hash Validation Algorithm (MVP):**
```
1. App tạo App Installation ID ngẫu nhiên trong SecureStore.
2. App chỉ gửi SHA256 hash 64 ký tự; Installation ID gốc không rời thiết bị.
3. Server kiểm tra định dạng hash và lưu để audit/rate-abuse detection.
4. Server yêu cầu X-Captured-At trong sai số tối đa 60 giây.
5. Reset hash là flow user-initiated khi đổi máy (chưa thuộc endpoint này).
```

**Request Headers:**
```
X-Device-ID: <device_hash>
X-Captured-At: <ISO8601_timestamp>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "author": {
      "id": "uuid",
      "public_id": "minifoodie",
      "display_name_public": "Mini Foodie",
      "avatar_url": null
    },
    "image_url": "https://project.supabase.co/storage/v1/object/sign/lockets/...",
    "thumbnail_url": "https://project.supabase.co/storage/v1/object/sign/lockets/...",
    "image_metadata": {
      "width": 1536,
      "height": 2048,
      "bytes": 284120,
      "thumbnail_bytes": 18420,
      "mime_type": "image/jpeg"
    },
    "restaurant_id": null,
    "note": "Bữa ăn ngon quá!",
    "visibility": "FRIENDS",
    "location": { "latitude": 10.7769, "longitude": 106.7009 },
    "can_display_location": true,
    "exif_stripped": true,
    "permissions": { "can_edit": true, "can_delete": true },
    "captured_at": "2026-08-07T11:59:45Z",
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

**Error Codes:**
- `AUTH_REQUIRED` / `AUTH_INVALID`: Thiếu hoặc sai JWT
- `LOCKET_UPLOAD_INVALID`: Multipart hoặc kích thước file không hợp lệ
- `LOCKET_IMAGE_REQUIRED` / `LOCKET_IMAGE_INVALID`: Thiếu ảnh hoặc MIME/magic bytes không hợp lệ
- `LOCKET_DEVICE_INVALID`: Device hash không đúng định dạng SHA-256
- `LOCKET_CAPTURE_EXPIRED`: `captured_at` không hợp lệ hoặc lệch quá 60 giây
- `LOCKET_VALIDATION`: Metadata/GPS/visibility không hợp lệ
- `LOCKET_STORAGE_UNCONFIGURED`: Production storage chưa được cấu hình đầy đủ
- `LOCKET_STORAGE_BUCKET_INVALID`: Bucket `lockets` không tồn tại hoặc không ở chế độ private
- `LOCKET_STORAGE_ERROR`: Supabase upload/download/delete/signing thất bại
- `LOCKET_STORAGE_CLEANUP_FAILED`: Không thể dọn object sau khi Prisma persistence thất bại
- `LOCKET_IMAGE_PROCESSING_FAILED`: Sharp không thể giải mã hoặc chuẩn hóa ảnh

**Legacy compatibility:** API vẫn nhận và lưu `dish_name`, `restaurant_name`, `rating`, `tags` từ client cũ. Client mới không gửi hoặc hiển thị các field này; `restaurant_id` vẫn có thể được truyền ngầm từ Spin check-in.

**Media pipeline:**

```text
Mobile camera → Express multipart → auth/metadata/file validation
              → Sharp rotate + JPEG re-encode + thumbnail
              → Supabase private bucket → Prisma metadata
```

- Bucket `lockets` luôn private; service role key chỉ tồn tại ở backend.
- Object paths: `lockets/{userId}/{locketId}/original.jpg` và `thumbnail.jpg`.
- Sharp re-encode ảnh JPEG/PNG thành JPEG, loại metadata/EXIF và giới hạn kích thước giải mã.
- Nếu Prisma ghi thất bại, backend xóa cả hai object; khi xóa Locket, backend soft-delete rồi xóa object và hoàn tác soft-delete nếu Storage thất bại.
- `PRIVATE`/`FRIENDS` nhận Supabase signed URL TTL 1 giờ.
- `PUBLIC` nhận `/api/v1/lockets/media/lockets/{userId}/{locketId}/{fileName}`. Endpoint đọc lại visibility trong Prisma trước khi tải object từ bucket private; không dùng `getPublicUrl`.
- Public media trả `Cache-Control: public, max-age=0, must-revalidate`; proxy/CDN có thể lưu nhưng phải revalidate với Express. `PRIVATE`/`FRIENDS` trả `private, no-store` nếu đi qua Express fallback. Việc cấu hình CDN nằm ngoài Express.

### 5.1.1 Read Locket Media

```text
GET /lockets/media/lockets/:user_id/:locket_id/:file_name
```

**Auth Required:** Không với Locket đang `PUBLIC`; owner/friend cần JWT hoặc capability URL hợp lệ cho nội dung được phép.

**Security:** Mỗi request Express kiểm tra object path, bản ghi chưa bị xóa, visibility hiện tại và quan hệ owner/friend trước khi trả bytes. Chỉ chấp nhận `original.jpg` hoặc `thumbnail.jpg` theo path server cấp.

---

### 5.2 Get Locket Feed

```
GET /lockets
```

**Description:** Lấy feed locket

**Auth Required:** Yes

**Query Params (MVP):**
- `type`: `ALL` | `MINE` | `FRIENDS` | `DISCOVER` (default: `ALL`)
- MVP trả tối đa 50 bản ghi mới nhất. Cursor pagination sẽ được bổ sung trước khi mở rộng traffic.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "author": {
        "id": "uuid",
        "public_id": "minifoodie",
        "display_name_public": "minifoodie",
        "avatar_url": "..."
      },
      "image_url": "...",
      "thumbnail_url": "...",
      "image_metadata": {
        "width": 1536,
        "height": 2048,
        "bytes": 284120,
        "thumbnail_bytes": 18420,
        "mime_type": "image/jpeg"
      },
      "restaurant_id": null,
      "note": "Bữa ăn ngon quá!",
      "visibility": "FRIENDS",
      "exif_stripped": true,
      "permissions": { "can_edit": true, "can_delete": true },
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": {
    "has_more": false,
    "limit": 50
  }
}
```

**Storage/EXIF boundary:** dev/test dùng adapter in-memory khi toàn bộ biến Supabase vắng mặt. Production fail closed với `503 LOCKET_STORAGE_UNCONFIGURED`. Supabase adapter dùng bucket private; ảnh `PRIVATE`/`FRIENDS` dùng signed URL TTL 1 giờ, còn ảnh `PUBLIC` đi qua Express media endpoint để visibility luôn được kiểm tra từ Prisma. Adapter dev dùng capability URL HMAC cùng TTL cho nội dung không public.

**Notes:**
- Feed is chronological (newest first)

---

### 5.3 Get My Lockets

```
GET /lockets/me
```

**Description:** Lấy tất cả locket của mình

**Auth Required:** Yes

**Query Params (MVP):** Không có; trả tối đa 50 bản ghi mới nhất của owner.

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { ... }
}
```

---

### 5.4 Get Locket Detail

```
GET /lockets/:locket_id
```

**Description:** Lấy chi tiết một locket

**Auth Required:** Optional — Locket `PUBLIC` xem được không cần auth

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "author": { ... },
    "image_url": "...",
    "note": "...",
    "visibility": "FRIENDS",
    "permissions": { "can_edit": false, "can_delete": false },
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 5.5 Update Locket

```
PATCH /lockets/:locket_id
```

**Description:** Cập nhật locket (chỉ owner)

**Auth Required:** Yes (Owner only)

**Request Body:**
```json
{
  "note": "Updated note",
  "visibility": "PUBLIC",
  "restaurant_id": "uuid"  // null to remove
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 5.6 Delete Locket

```
DELETE /lockets/:locket_id
```

**Description:** Xóa locket (soft delete)

**Auth Required:** Yes (Owner only)

**Response (204):** No Content

---

### 5.7 Like Locket

```
POST /lockets/:locket_id/like
```

**Description:** Thích một locket

**Auth Required:** Yes

**Response (201):**
```json
{
  "success": true,
  "data": {
    "is_liked": true,
    "like_count": 13
  }
}
```

---

### 5.8 Unlike Locket

```
DELETE /lockets/:locket_id/like
```

**Description:** Bỏ thích locket

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_liked": false,
    "like_count": 12
  }
}
```

---

### 5.9 Comment on Locket

```
POST /lockets/:locket_id/comments
```

**Description:** Comment trên locket

**Auth Required:** Yes

**Request Body:**
```json
{
  "text": "Ngon quá!"
}
```

**Validation Rules:**
- Max 200 chars
- No external links

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user": { ... },
    "text": "Ngon quá!",
    "created_at": "2026-08-07T12:30:00Z"
  }
}
```

---

### 5.10 Delete Comment

```
DELETE /lockets/:locket_id/comments/:comment_id
```

**Description:** Xóa comment

**Auth Required:** Yes (Comment owner or Locket owner)

**Response (204):** No Content

---

### 5.11 Report Locket

```
POST /lockets/:locket_id/report
```

**Description:** Báo cáo locket vi phạm

**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "spam",  // "spam" | "inappropriate" | "wrong_location" | "other"
  "description": "Mô tả chi tiết (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Report submitted"
}
```

---

### 5.12 Hide Locket

```
POST /lockets/:locket_id/hide
```

**Description:** Ẩn locket khỏi feed (không xóa)

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Locket hidden"
}
```

---

## 6. REVIEW APIs

### 6.1 Create Review

```
POST /reviews
```

**Description:** Viết review cho quán ăn

**Auth Required:** Yes

**Request:** `multipart/form-data`

**Form Fields:**
- `restaurant_id`: UUID (required)
- `rating`: Int 1-5 (required)
- `text`: String (optional), max 2000 chars
- `photos`: File[] (optional), max 5 files, 5MB each

**Validation Rules (REVIEW_QĐ_1, REVIEW_QĐ_2):**
- Mỗi user 1 review/quán (update nếu đã có)
- No external links in text
- Strip EXIF from photos

**Response (201):**
```json
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "restaurant": { ... },
    "rating": 5,
    "text": "Quán rất ngon, phục vụ tốt!",
    "photos": [
      {
        "id": "uuid",
        "url": "https://cdn.foodroulette.app/reviews/xxx.jpg"
      }
    ],
    "created_at": "2026-08-07T12:00:00Z"
  }
}
```

**Error Codes:**
- `REVIEW_001`: Restaurant not found
- `REVIEW_002`: Duplicate review (already reviewed)

---

### 6.2 Get My Reviews

```
GET /reviews/me
```

**Description:** Lấy tất cả review của mình

**Auth Required:** Yes

**Query Params:**
- `page`: int
- `per_page`: int
- `restaurant_id`: UUID (optional filter)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "review_id": "uuid",
      "restaurant": { ... },
      "rating": 5,
      "text": "...",
      "photos": [ ... ],
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### 6.3 Get Review Detail

```
GET /reviews/:review_id
```

**Description:** Lấy chi tiết review

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "user": { ... },
    "restaurant": { ... },
    "rating": 5,
    "text": "...",
    "photos": [ ... ],
    "created_at": "2026-08-07T12:00:00Z",
    "updated_at": "2026-08-07T12:00:00Z"
  }
}
```

---

### 6.4 Update Review

```
PATCH /reviews/:review_id
```

**Description:** Cập nhật review (chỉ owner, trong 30 ngày)

**Auth Required:** Yes (Owner only)

**Request Body:**
```json
{
  "rating": 4,
  "text": "Updated review text",
  "photos_to_remove": ["photo_id_1", "photo_id_2"],
  "new_photos": "<binary_files>"
}
```

**Validation Rules (REVIEW_QĐ_3):**
- Chỉ owner được sửa
- Trong vòng 30 ngày từ ngày tạo
- Log lịch sử chỉnh sửa

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Codes:**
- `REVIEW_003`: Edit period expired (>30 days)
- `REVIEW_004`: Not review owner

---

### 6.5 Delete Review

```
DELETE /reviews/:review_id
```

**Description:** Xóa review (soft delete)

**Auth Required:** Yes (Owner only)

**Response (204):** No Content

---

## 7. RESTAURANT APIs

### 7.1 Search Restaurants

```
GET /restaurants
```

**Description:** Tìm kiếm quán ăn

**Auth Required:** No

**Query Params:**
- `q`: Search query (optional)
- `cuisine`: Cuisine type (optional, multi-select)
- `price_range`: `$` | `$$` | `$$$` | `$$$$` (optional, multi-select)
- `latitude`: Float (optional)
- `longitude`: Float (optional)
- `radius_km`: Float (optional, default 5, max 20)
- `open_now`: Boolean (optional)
- `sort_by`: `distance` | `rating` | `review_count` (default: distance)
- `page`: int
- `per_page`: int

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Quán Ăn Ngon",
      "address": "123 Đường ABC",
      "latitude": 21.0290,
      "longitude": 105.8550,
      "cuisine": "vietnamese",
      "price_range": "$$",
      "rating": 4.5,
      "review_count": 120,
      "distance_km": 0.8,
      "photo_url": "...",
      "is_open": true
    }
  ],
  "meta": { ... }
}
```

---

### 7.2 Check Restaurant Duplicates

```
GET /restaurants/check-duplicate
```

**Description:** Kiểm tra quán đã tồn tại trước khi submit mới

**Auth Required:** Yes

**Query Params:**
- `name`: string (required)
- `latitude`: float (required)
- `longitude`: float (required)
- `radius_m`: int (default: 50, max: 100)

**Response (200) - No duplicates found:**
```json
{
  "success": true,
  "data": {
    "has_duplicate": false,
    "suggestions": []
  }
}
```

**Response (200) - Duplicates found:**
```json
{
  "success": true,
  "data": {
    "has_duplicate": true,
    "suggestions": [
      {
        "restaurant_id": "uuid",
        "name": "Quán Ăn Ngon",
        "address": "123 Đường ABC",
        "distance_m": 25,
        "source": "google_places"
      }
    ],
    "message": "Tìm thấy quán gần đó. Bạn có muốn đóng góp cho quán này không?"
  }
}
```

**Notes:**
- Used before `POST /restaurants` to prevent duplicate submissions
- Matches by name similarity + distance within radius_m

---

### 7.3 Get Restaurant Detail

```
GET /restaurants/:restaurant_id
```

**Description:** Lấy chi tiết quán ăn

**Auth Required:** No

**Query Params:**
- `latitude`: Float (optional, for distance calculation)
- `longitude`: Float (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Quán Ăn Ngon",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "latitude": 21.0290,
    "longitude": 105.8550,
    "phone": "+84-123-456-789",
    "website": "https://quananong.vn",
    "cuisine": "vietnamese",
    "price_range": "$$",
    "rating": 4.5,
    "review_count": 120,
    "photo_url": "...",
    "photos": [ ... ],
    "opening_hours": {
      "monday": "08:00 - 22:00",
      "tuesday": "08:00 - 22:00",
      ...
    },
    "is_open": true,
    "distance_km": 0.8,
    "source": "google_places",
    "status": "approved"
  }
}
```

---

### 7.4 Get Restaurant Reviews

```
GET /restaurants/:restaurant_id/reviews
```

**Description:** Lấy reviews của quán

**Auth Required:** No

**Query Params:**
- `page`: int
- `per_page`: int
- `sort_by`: `newest` | `highest` | `lowest` (default: newest)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "review_id": "uuid",
      "user": { ... },
      "rating": 5,
      "text": "...",
      "photos": [ ... ],
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### 7.5 Get Restaurant Menu

```
GET /restaurants/:restaurant_id/menu
```

**Description:** Lấy menu của quán (nếu có)

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurant_id": "uuid",
    "menu_url": "https://cdn.foodroulette.app/menus/xxx.pdf",
    "menu_items": [
      {
        "category": "Món chính",
        "items": [
          {
            "name": "Phở bò",
            "price": "45,000 VND",
            "description": "Phở bò tái nạm"
          }
        ]
      }
    ]
  }
}
```

---

### 7.6 Submit New Restaurant

```
POST /restaurants
```

**Description:** Đề xuất thêm quán mới (user-submitted)

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Quán Mới Ngon",
  "address": "456 Đường XYZ, Quận 2",
  "latitude": 21.0300,
  "longitude": 105.8560,
  "phone": "+84-234-567-890",
  "cuisine": "vietnamese",
  "price_range": "$$",
  "opening_hours": "09:00 - 21:00",
  "website": "https://quanmoingon.vn"
}
```

**Validation Rules (REVIEW_QĐ_4):**
- Thông tin bắt buộc: Tên, Địa chỉ, Latitude, Longitude
- Trạng thái ban đầu: pending
- Review đầu tiên sẽ auto-approve

**Response (201):**
```json
{
  "success": true,
  "data": {
    "restaurant_id": "uuid",
    "status": "pending",
    "message": "Restaurant submitted for review"
  }
}
```

---

### 7.7 Submit Restaurant Photos

```
POST /restaurants/:restaurant_id/photos
```

**Description:** Upload ảnh quán

**Auth Required:** Yes

**Request:** `multipart/form-data`

**Form Fields:**
- `photos`: File[] (required), max 5 files, 5MB each

**Response (201):**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "uuid",
        "url": "https://cdn.foodroulette.app/restaurants/xxx.jpg"
      }
    ]
  }
}
```

---

### 7.8 Get Cuisines

```
GET /restaurants/cuisines
```

**Description:** Lấy danh sách loại ẩm thực

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "vietnamese", "name": "Việt Nam", "icon": "🍜" },
    { "id": "italian", "name": "Ý", "icon": "🍕" },
    { "id": "japanese", "name": "Nhật Bản", "icon": "🍣" },
    ...
  ]
}
```

---

## 8. STEWARD APIs

### 8.1 Get Pending Restaurants

```
GET /steward/restaurants
```

**Description:** Lấy danh sách quán chờ duyệt (Steward only)

**Auth Required:** Yes (Steward or Admin role)

**Query Params:**
- `page`: int
- `per_page`: int
- `sort_by`: `newest` | `oldest` (default: newest)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "restaurant_id": "uuid",
      "name": "Quán Mới Ngon",
      "address": "456 Đường XYZ",
      "submitted_by": {
        "id": "uuid",
        "display_name_public": "minifoodie"
      },
      "submitted_at": "2026-08-07T12:00:00Z",
      "photos": [ ... ]
    }
  ],
  "meta": { ... }
}
```

---

### 8.2 Approve Restaurant

```
POST /steward/restaurants/:restaurant_id/approve
```

**Description:** Duyệt quán (Steward only)

**Auth Required:** Yes (Steward or Admin role)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurant_id": "uuid",
    "status": "approved",
    "approved_by": {
      "id": "uuid",
      "display_name_public": "steward1"
    },
    "approved_at": "2026-08-07T12:30:00Z"
  }
}
```

---

### 8.3 Reject Restaurant

```
POST /steward/restaurants/:restaurant_id/reject
```

**Description:** Từ chối quán (Steward only)

**Auth Required:** Yes (Steward or Admin role)

**Request Body:**
```json
{
  "reason": "Thông tin không chính xác"
}
```

**Validation Rules (REVIEW_QĐ_6):**
- Phải kèm lý do từ chối
- Gửi notification cho user

**Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurant_id": "uuid",
    "status": "rejected",
    "reason": "Thông tin không chính xác",
    "resubmit_count": 0
  }
}
```

---

## 9. PARTNER APIs

### 9.1 Register as Partner

```
POST /partners
```

**Description:** Đăng ký trở thành Restaurant Partner

**Auth Required:** Yes

**Request Body:**
```json
{
  "restaurant": {
    "name": "Quán Ăn Ngon",
    "address": "123 Đường ABC",
    "latitude": 21.0290,
    "longitude": 105.8550,
    "phone": "+84-123-456-789",
    "email": "contact@quananong.vn",
    "cuisine": "vietnamese",
    "price_range": "$$",
    "opening_hours": "08:00 - 22:00",
    "website": "https://quananong.vn"
  },
  "representative": {
    "name": "Nguyễn Văn A",
    "position": "Chủ quán",
    "phone": "+84-987-654-321"
  },
  "documents": ["<file>"]
}
```

**Validation Rules (PROFILE_QĐ_4):**
- Thông tin bắt buộc: Tên, Địa chỉ, GPS, Phone, Email, Loại ẩm thực
- Trạng thái: pending → approved/suspended

**Response (201):**
```json
{
  "success": true,
  "data": {
    "partner_id": "uuid",
    "restaurant_id": "uuid",
    "status": "pending",
    "message": "Application submitted for review"
  }
}
```

---

### 9.2 Get Partner Dashboard

```
GET /partners/me
```

**Description:** Lấy dashboard của Partner

**Auth Required:** Yes (Partner role)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "partner_id": "uuid",
    "status": "active",
    "restaurant": { ... },
    "stats": {
      "total_views": 1250,
      "total_checkins": 340,
      "total_reviews": 28,
      "average_rating": 4.2,
      "this_month_views": 150,
      "this_month_checkins": 45
    },
    "recent_reviews": [ ... ]
  }
}
```

---

### 9.3 Update Restaurant (Partner)

```
PATCH /partners/me/restaurant
```

**Description:** Cập nhật thông tin quán (Partner)

**Auth Required:** Yes (Partner role, own restaurant only)

**Request Body:**
```json
{
  "phone": "+84-111-222-333",
  "opening_hours": "07:00 - 23:00",
  "is_active": true
}
```

**Validation Rules (PROFILE_QĐ_5):**
- Partner chỉ quản lý quán đã approved
- Thay đổi địa chỉ cần re-verify

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 9.4 Get Partner Analytics

```
GET /partners/me/analytics
```

**Description:** Lấy analytics chi tiết

**Auth Required:** Yes (Partner role)

**Query Params:**
- `period`: `week` | `month` | `quarter` | `year` (default: month)
- `from_date`: ISO date (optional)
- `to_date`: ISO date (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "views": {
      "total": 450,
      "daily": [
        { "date": "2026-08-01", "count": 15 },
        ...
      ]
    },
    "checkins": {
      "total": 120,
      "daily": [ ... ]
    },
    "reviews": {
      "total": 8,
      "average_rating": 4.5
    }
  }
}
```

---

### 9.5 Get Partner Billing History

```
GET /partners/me/billing
```

**Description:** Lấy lịch sử thanh toán

**Auth Required:** Yes (Partner role)

**Query Params:**
- `page`: int
- `per_page`: int

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 99000,
      "currency": "VND",
      "description": "Phí đăng ký tháng 8/2026",
      "status": "paid",
      "created_at": "2026-08-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

## 10. NOTIFICATION APIs

### 10.1 Get Notifications

```
GET /notifications
```

**Description:** Lấy danh sách thông báo

**Auth Required:** Yes

**Query Params:**
- `page`: int
- `per_page`: int
- `is_read`: Boolean (optional)
- `type`: Filter by type (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "friend_request",
      "title": "Yêu cầu kết bạn mới",
      "body": "Min muốn kết bạn với bạn",
      "data": {
        "user_id": "uuid",
        "friendship_id": "uuid"
      },
      "is_read": false,
      "created_at": "2026-08-07T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### 10.2 Mark Notification as Read

```
POST /notifications/:notification_id/read
```

**Description:** Đánh dấu đã đọc

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_read": true
  }
}
```

---

### 10.3 Mark All Notifications as Read

```
POST /notifications/read-all
```

**Description:** Đánh dấu tất cả đã đọc

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 10.4 Delete Notification

```
DELETE /notifications/:notification_id
```

**Description:** Xóa thông báo

**Auth Required:** Yes

**Response (204):** No Content

---

### 10.5 Register Push Token

```
POST /notifications/push-token
```

**Description:** Đăng ký push notification token

**Auth Required:** Yes

**Request Body:**
```json
{
  "token": "fcm_or_apns_token",
  "platform": "ios"  // "ios" | "android"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Push token registered"
}
```

---

## 11. SYSTEM APIs

### 11.1 Health Check

```
GET /health
```

**Description:** Kiểm tra trạng thái hệ thống

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-08-07T12:00:00Z",
    "services": {
      "database": "up",
      "cache": "up",
      "storage": "up"
    }
  }
}
```

---

### 11.2 Get System Config

```
GET /config
```

**Description:** Lấy cấu hình hệ thống (public)

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "app": {
      "name": "Food Roulette",
      "version": "1.0.0",
      "min_app_version": "1.0.0"
    },
    "spin": {
      "max_respins": 3,
      "respin_cooldown_seconds": 10,
      "group_max_members": 20,
      "group_expiry_minutes": 30,
      "vote_timeout_seconds": 60
    },
    "locket": {
      "max_file_size_mb": 10,
      "allowed_formats": ["jpg", "png"],
      "max_note_length": 280
    },
    "review": {
      "max_photos": 5,
      "max_text_length": 2000,
      "edit_period_days": 30
    }
  }
}
```

---

### 11.3 Get Cuisines (cached)

```
GET /cuisines
```

**Description:** Lấy danh sách loại ẩm thực (cached)

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "vietnamese", "name": "Việt Nam", "icon": "🍜" },
    { "id": "italian", "name": "Ý", "icon": "🍕" },
    ...
  ]
}
```

---

### 11.4 Get Price Ranges

```
GET /price-ranges
```

**Description:** Lấy danh sách mức giá

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "$", "name": "Bình dân", "max_amount": 50000 },
    { "id": "$$", "name": "Trung bình", "max_amount": 150000 },
    { "id": "$$$", "name": "Hơi sang", "max_amount": 500000 },
    { "id": "$$$$", "name": "Sang trọng", "max_amount": null }
  ]
}
```

---

## 12. WEBSOCKET APIs

### 12.1 Connection

```
wss://api.foodroulette.app/ws
```

**Authentication:** Via query param or first message

```
wss://api.foodroulette.app/ws?token=<jwt_token>
```

### 12.2 Message Format

```json
{
  "type": "event_type",
  "data": { ... },
  "timestamp": "2026-08-07T12:00:00Z"
}
```

### 12.3 Connection & Heartbeat

**Connection Lifecycle:**
1. Client connects with JWT token
2. Server validates token
3. If valid: send `connection.established` event
4. If invalid: send `connection.error` and close

**Heartbeat Protocol:**
- Client sends `ping` every 30 seconds
- Server responds with `pong` within 5 seconds
- If no `pong` received for 45 seconds: server closes connection
- If no `ping` received for 60 seconds: server sends `ping` to client

```json
// Client -> Server
{
  "type": "ping",
  "timestamp": "2026-08-07T12:00:00Z"
}

// Server -> Client
{
  "type": "pong",
  "timestamp": "2026-08-07T12:00:00Z"
}
```

**Reconnection Strategy:**
- On disconnect: wait 1s, 2s, 4s, 8s, 16s (exponential backoff, max 5 retries)
- Send last cursor/timestamp on reconnect to resume from last position

### 12.4 Event Types

#### Group Spin Events

**`group.spin_started`**
```json
{
  "type": "group.spin_started",
  "data": {
    "group_id": "uuid",
    "initiated_by": "uuid"
  }
}
```

**`group.result`**
```json
{
  "type": "group.result",
  "data": {
    "group_id": "uuid",
    "restaurant": { ... },
    "vote_deadline": "2026-08-07T12:05:00Z"
  }
}
```

**`group.vote_update`**
```json
{
  "type": "group.vote_update",
  "data": {
    "group_id": "uuid",
    "votes": {
      "accept": 3,
      "respin": 1
    },
    "total_members": 5
  }
}
```

**`group.decision`**
```json
{
  "type": "group.decision",
  "data": {
    "group_id": "uuid",
    "decision": "accept",
    "final_restaurant": { ... }
  }
}
```

**`group.member_joined`**
```json
{
  "type": "group.member_joined",
  "data": {
    "group_id": "uuid",
    "member": { ... }
  }
}
```

**`group.member_left`**
```json
{
  "type": "group.member_left",
  "data": {
    "group_id": "uuid",
    "user_id": "uuid"
  }
}
```

#### Notification Events

**`notification.new`**
```json
{
  "type": "notification.new",
  "data": {
    "notification": { ... }
  }
}
```

---

## PHỤ LỤC

### A. Error Code Reference

| Code | HTTP Status | Description |
|------|------------|-------------|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Token expired |
| `AUTH_003` | 401 | Google OAuth failed |
| `AUTH_004` | 403 | Account suspended |
| `AUTH_005` | 400 | Invalid verification token |
| `AUTH_006` | 400 | Verification token expired |
| `AUTH_007` | 400 | Email already verified |
| `AUTH_008` | 400 | Invalid password for account deletion |
| `AUTH_009` | 400 | Confirmation text mismatch |
| `USER_001` | 404 | User not found |
| `USER_002` | 409 | Already friends |
| `USER_003` | 409 | Request already sent |
| `USER_004` | 422 | Friend limit reached |
| `SPIN_001` | 422 | No restaurant in range |
| `SPIN_002` | 422 | Respin limit exceeded |
| `SPIN_003` | 422 | Respin cooldown not elapsed |
| `LOCKET_001` | 403 | Camera permission denied |
| `LOCKET_002` | 403 | Invalid image source |
| `LOCKET_003` | 403 | GPS permission denied |
| `LOCKET_004` | 400 | Invalid captured_at timestamp |
| `REVIEW_001` | 404 | Restaurant not found |
| `REVIEW_002` | 409 | Duplicate review |
| `REVIEW_003` | 422 | Edit period expired |
| `GROUP_001` | 422 | Group full |
| `GROUP_002` | 410 | Invite code expired |
| `GROUP_003` | 403 | Not friends with inviter |
| `GROUP_004` | 409 | Already in active group |
| `GROUP_005` | 422 | Cannot leave during spin |
| `GROUP_006` | 422 | Cannot cancel after spin started |

### B. Rate Limiting

| Endpoint Pattern | Limit |
|-----------------|-------|
| `/auth/*` | 10 requests/minute |
| `/spins` | 30 requests/hour |
| `/lockets` | 10 uploads/hour |
| `/reviews` | 20 reviews/day |
| `/users/search` | 30 requests/minute |

### C. File Upload Limits

| Type | Max Size | Formats |
|------|----------|---------|
| Avatar | 5MB | jpg, png |
| Locket | 10MB | jpg, png |
| Review Photo | 5MB each, max 5 | jpg, png |
| Restaurant Photo | 5MB each, max 5 | jpg, png |
| Document (Partner) | 10MB | pdf, jpg, png |

---

*Document Version: 1.2*
*Created: 2026-08-07*  
*Updated: 2026-08-09*
*Author: Food Roulette Team*
