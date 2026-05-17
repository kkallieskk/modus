# Modus Compliance & Privacy Architecture

This document defines the final "Gatekeeper" layer for the Modus marketplace, ensuring absolute legal compliance, data privacy, and platform integrity.

## 1. KYC (Identity Verification) Bridge

To prevent fraud and maintain financial compliance (AML/KYC), Modus implements a threshold-based identity verification system.

*   **Trigger**: A creator is prompted for KYC when:
    1.  Their total earnings exceed a specific platform threshold (e.g., $500).
    2.  Before their first "Cash Out" withdrawal is permitted.
*   **Secure Handoff**: We utilize **Stripe Identity** for verification. 
    *   The creator is redirected to a secure, third-party interface to upload their government-issued ID.
    *   **The Logic**: The "Cash Out" action in the `EarningsScreen` is programmatically locked if `profiles.kyc_status != 'verified'`.
*   **Privacy**: Modus never stores the Govt ID image. We only store the `verification_status` and the `stripe_identity_id` reference.

## 2. "Delete My Account" Lifecycle

In compliance with App Store and Google Play guidelines (and GDPR/CCPA), Modus provides a clear path for account deletion.

*   **The Guardrail**: Users cannot delete their account if they have:
    *   An active campaign (Status != `Completed` or `Finalized`).
    *   Escrow funds currently locked in a production cycle.
    *   An open dispute or investigation.
*   **The Flow**:
    1.  **Request**: User taps "Delete Account" in Settings.
    2.  **Soft Delete (Deactivation)**: The account is marked `is_active: false`. The user is immediately logged out and their profile is hidden from the marketplace.
    3.  **Hard Delete (Purge)**: After a **30-day grace period**, a background worker permanently wipes personal data (email, name, social tokens), keeping only anonymized transaction history for financial auditing.

## 3. High-Priority Notification Fallbacks

To ensure "Money Events" are never missed, Modus implements a multi-channel fallback system.

*   **Event Logging**: Every critical notification (e.g., `Escrow Funded`, `Revision Requested`) is logged in the `notification_events` table.
*   **The 2-Hour Watcher**: A background worker monitors these events.
    *   **Logic**: IF (`status == 'sent'` AND `opened_at == NULL` AND `created_at < NOW() - 2 hours`):
        *   Trigger an automated **Email** (via SendGrid) or **SMS** (via Twilio) to the creator.
*   **Outcome**: This ensures creators are alerted to high-value opportunities or production deadlines even if push notifications are disabled or fail.

## 4. Version Control & Force Update

To protect users from critical bugs or security vulnerabilities, Modus includes a remote configuration check.

*   **Remote Config**: The backend maintains a `minimum_app_version` record in a global configuration table.
*   **App Boot Logic**: 
    1.  Upon launch, the app fetches the `minimum_app_version`.
    2.  **Force Update**: If `current_version < minimum_app_version`, the app displays a non-dismissible modal: *"Critical Update Required: Please update to the latest version of Modus to continue using the platform."*
*   **Graceful Updates**: For minor changes, a "Soft Update" prompt is shown, allowing the user to skip but recommending the update.

## 5. Dispute & Audit Retention

*   **Evidence Vault**: During account deletion, if an `is_disputed: true` flag exists on any campaign linked to the user, the relevant chat logs and transaction history are **exempt from deletion** until the dispute is marked as `Resolved`.
*   **Audit Compliance**: All financial transaction records are kept for 7 years in an anonymized format to comply with global tax and financial regulations.
