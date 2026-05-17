# Modus API Layer Architecture: Creator & External Integrations

This document outlines the secure, scalable integration layer for the Modus marketplace, focusing on identity verification, social data synchronization, and compliant financial routing.

## 1. Security & Role-Based Access Control (RBAC)

### Authentication Engine
*   **Provider**: Supabase Auth (JWT-based).
*   **Role Enforcement**: Every API request is intercepted by a middleware that decodes the JWT and verifies the `user_role` metadata.
*   **Isolation**: 
    *   `GET /api/creator/jobs`: Only accessible if `role == 'creator'`.
    *   `POST /api/brand/campaigns`: Only accessible if `role == 'brand'`.
    *   Attempting to cross-pollinate (e.g., a creator calling a brand's `approve` endpoint) results in an immediate `403 Forbidden`.

## 2. Social API Synchronization (Identity & Stats)

### Integration Strategy
Modus utilizes official partner APIs to ensure data stability and compliance with platform terms.

| Platform | API Used | Data Retrieved |
| :--- | :--- | :--- |
| **Instagram** | Instagram Graph API | Username, Profile Pic, Follower Count, Verified Status |
| **TikTok** | TikTok for Developers (Display API) | Display Name, Avatar, Fan Count, Video Stats |

### Automated Data Refresh (The CRON)
*   **Schedule**: Every Sunday at 00:00 UTC.
*   **Logic**: A background worker iterates through all `is_active` creator profiles, refreshes their OAuth tokens, and fetches the latest follower counts.
*   **Storage**: Updates the `follower_counts` JSONB field in the `profiles` table, maintaining an accurate marketplace "Verified Reach."

## 3. Financial Routing (Stripe Connect Integration)

### Stripe Connect (Express/Custom)
Modus acts as a platform, routing funds from brands to creators while managing the tax burden via Stripe.

*   **Onboarding Flow**:
    1.  Creator taps "Connect Bank" in Settings.
    2.  Backend calls `stripe.accounts.create()` + `stripe.accountLinks.create()`.
    3.  Creator is redirected to a secure Stripe-hosted onboarding page.
    4.  **Zero-Liability Storage**: Modus *only* stores the `stripe_account_id`. No SSNs, Tax IDs, or Bank Routing numbers ever touch our servers.

*   **Payout Execution**:
    *   Upon "Cash Out" or "Auto-Release," the backend initiates a `stripe.transfers.create()` from the platform account to the creator's connected account.

## 4. Webhook Listener Logic

### `POST /api/webhooks/payments`
The backend listens for real-time events from the payment gateway to handle edge cases gracefully.

*   **`payout.failed`**:
    *   Trigger: The creator's bank rejects the transfer (e.g., closed account).
    *   Action: Revert the transaction in the `transactions` table and re-add the funds to the creator's `available_balance`.
*   **`account.updated`**:
    *   Trigger: Creator completes their Stripe onboarding.
    *   Action: Enable the "Cash Out" button in the app UI.

## 5. Security & Compliance (The "What to Avoid")

*   **PCI Compliance**: Modus is a PCI-compliant platform by proxy, as all sensitive data is handled via **Stripe Elements** and **Connect**.
*   **Data Minimization**: We follow the principle of least privilege—if we don't need to store it to provide the service, we don't.
*   **Official Handshakes**: No scrapers. All data sync is performed via legitimate OAuth 2.0 flows, protecting creator account security and platform longevity.
