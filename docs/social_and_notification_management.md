# Modus Architecture: Multi-Handle Management & Engagement Logic

This document defines the infrastructure for multi-platform social management, granular notification control, and the "Modus Health Score" system.

## 1. Multi-Handle Management (The Social Hub)

Modus allows creators to consolidate their entire influence across multiple platforms into a single unified profile.

*   **Social Accounts Schema**:
    *   Stored in the `social_accounts` table (normalized, one row per handle).
    *   Fields: `id`, `user_id`, `platform` (enum: tiktok, instagram, youtube), `handle`, `follower_count`, `tokens` (encrypted).
*   **Per-Job Pitching**: When a creator submits a pitch, the backend now requires a `selected_social_account_id`. This ensures the Brand knows exactly where the content will be posted (e.g., "This pitch is for my TikTok audience").
*   **Frictionless Unlinking**: A simple `DELETE` action on the `social_accounts` row instantly revokes the token and removes the handle, giving creators total control over their privacy and connected assets.

## 2. Granular Notification Control (DND Engine)

To respect creator focus and prevent notification fatigue, the platform provides deep control over alerts.

*   **Preference Matrix**:
    *   `new_opportunities`: Alerts for the global job board.
    *   `direct_invites`: Alerts for private, high-value brand deals.
    *   `payment_updates`: Critical alerts for escrow funding and payout releases.
    *   `chat_messages`: Real-time collaboration pings.
*   **Quiet Hours (DND)**:
    *   Creators can set a `quiet_hours_range` (e.g., 10:00 PM - 8:00 AM).
    *   During this window, the backend suppresses all non-critical notifications (New Jobs, Chat), buffering them for a "Morning Digest" at 8:01 AM.
*   **Deep-Linking Integration**: All push notifications (FCM) include a `data` payload with routing parameters.
    *   Example: A "New Message" ping contains `{ "screen": "Chat", "offerId": "uuid" }`. The app uses this to bypass the home screen and land the creator directly in the relevant conversation.

## 3. The "Modus Health Score" (Reliability Metric)

This private, backend-only metric rewards professional creators with higher visibility in brand rosters.

*   **Components**:
    1.  **Response Velocity**: Calculated as the average time between a brand message and a creator's reply.
    2.  **Completion Reliability**: The percentage of accepted jobs that reached the `Completed` status without disputes or cancellations.
*   **Algorithmic Weighting**:
    *   `Health Score = (Response_Weight * Velocity) + (Completion_Weight * Reliability)`.
*   **Impact**: Creators with a Health Score > 90 are automatically flagged as "Top Tier" in brand search results, creating a merit-based marketplace that self-regulates for quality.

## 4. Implementation Safeguards

*   **Token Isolation**: Social tokens are stored in an encrypted vault. Each platform integration is isolated, ensuring that unlinking a TikTok account never affects the Instagram connection.
*   **Atomic Notifications**: Preference checks happen at the worker level. The notification engine queries the `notification_settings` table before every outbound ping to ensure user preferences are honored in real-time.
*   **Deep-Link Validation**: The app verifies that the user has permission to view the deep-linked screen before navigating, maintaining the platform's RBAC (Role-Based Access Control) security.
