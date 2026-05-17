# Modus Security: Single-Session Device Authentication

This document outlines the architecture for securing creator accounts through device-level session management, preventing unauthorized account sharing and protecting sensitive financial data.

## 1. Device-Identity Fingerprinting

To uniquely identify a creator's hardware without compromising privacy:
*   **Hashed Identifiers**: The mobile app captures a unique device UUID (e.g., `vendorId` or `secureStoreId`).
*   **Server-Side Storage**: The backend hashes this identifier (e.g., SHA-256 with a per-user salt) and stores it in the `user_sessions` table.
*   **Compliance**: Hardware IDs are never stored in plain text, ensuring compliance with App Store and Play Store privacy guidelines.

## 2. The "Auto-Invalidate" Workflow (The Kick-Out)

Modus prioritizes security without introducing friction. We implement a "Latest Login Wins" policy.

1.  **New Login**: A creator logs in on a new device.
2.  **Session Lookup**: The backend checks for any existing active sessions for that `user_id`.
3.  **Invalidation**: If an existing session is found on a different device:
    *   The old session's `refresh_token` is immediately revoked in the database.
    *   The old device's `is_active` flag is set to `false`.
4.  **Success**: The new device receives a fresh set of Access and Refresh tokens.

## 3. Dual-Token Security Model

We utilize a short-lived access token and a device-bound refresh token.

*   **Access Token (JWT)**:
    *   **Expiry**: 15 Minutes.
    *   **Usage**: Used for all standard API requests.
*   **Refresh Token**:
    *   **Expiry**: 30 Days (sliding).
    *   **Device Bound**: The refresh token is strictly tied to the hashed `device_id`. A refresh token stolen from an iPhone will not work on an Android device because the fingerprints won't match.

## 4. Frontend Resilience (401 Interception)

The mobile app includes a global error handler to handle the "Session Expired" state gracefully.

*   **The Trigger**: If a creator uses an "old" device after being kicked out, their next token refresh or API call will return a `401 Unauthorized` with a specific error code: `SESSION_REPLACED`.
*   **The Reaction**:
    1.  The app instantly clears the local token storage.
    2.  The user is redirected to the **Login Screen**.
    3.  A premium notification banner appears: **"Session Expired: You have been logged in on another device. Please sign in again to continue."**

## 5. Backend Session Schema

```sql
CREATE TABLE public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    device_hash TEXT NOT NULL, -- Hashed hardware ID
    refresh_token_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for high-speed session lookups
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id) WHERE is_active = true;
```

## 6. Implementation Guardrails

*   **No Hard Blocks**: Creators can switch devices as often as needed; the platform simply ensures only one is "In Command" at a time.
*   **Atomic Revocation**: Session invalidation happens within a single database transaction to prevent "split-brain" states where multiple devices might temporarily remain logged in.
