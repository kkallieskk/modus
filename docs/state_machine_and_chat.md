# Modus Backend Architecture: State Machine & Real-Time Collaboration

This document defines the core workflow logic and real-time communication infrastructure that ensures data integrity and high-fidelity collaboration between Creators and Brands.

## 1. The Workflow State Machine (Campaign Lifecycle)

To prevent logic errors and "state-jumping," the backend implements a strict state machine. Every action (e.g., submitting a draft, releasing payment) is validated against the current campaign status.

### Status Transition Map

| Status | Allowed Action | Next Status |
| :--- | :--- | :--- |
| **Accepted** | Brand Funds Escrow | **Escrow_Funded** |
| **Escrow_Funded** | Creator Uploads Draft | **In_Review** |
| **In_Review** | Brand Requests Revision | **Revision_Requested** |
| **In_Review** | Brand Approves Draft | **Pending_Post** |
| **Revision_Requested** | Creator Re-uploads | **In_Review** |
| **Pending_Post** | Creator Submits Live Link | **Completed** |
| **Completed** | Release Funds to Wallet | **Finalized** |

### Enforcement Logic
*   **Source of Truth**: The server calculates all payouts based on the `campaign_offers` contract. The client never tells the server how much to pay.
*   **Validation Middleware**: Before any update, the server checks: `IF (requested_action == 'SUBMIT_DRAFT' AND current_status != 'Escrow_Funded') -> REJECT`.

## 2. Real-Time Chat Engine (WebSockets)

Modus uses **WebSockets (Supabase Realtime)** to facilitate instant, low-latency collaboration.

*   **Instant Feedback**: When a brand leaves a comment or requests a revision, the Creator's app receives a `BROADCAST` event via WebSockets, triggering an immediate UI update and push notification.
*   **Message Persistence**: Every message is stored in the `collaboration_messages` table with:
    *   `offer_id`: Links message to the specific collaboration.
    *   `sender_id`: The user sending the message.
    *   `content_encrypted`: The message body, encrypted at rest to protect sensitive campaign launch details.
*   **Audit Trail**: Chat history is immutable and preserved for dispute resolution by the Modus Support team.

## 3. Media Transcoding Worker (Preview Engine)

To handle 4K videos without degrading app performance, the backend implements an automated transcoding pipeline.

1.  **Upload**: Creator uploads the raw high-res file (up to 2GB) directly to the **Vault** bucket via a Pre-signed URL.
2.  **Trigger**: A `Storage.Object.Created` event triggers a **Supabase Edge Function**.
3.  **Transcode**: The function sends the raw file path to a Transcoding Worker (FFmpeg-based).
    *   **Output A**: A 720p H.264 "Preview" version optimized for mobile streaming.
    *   **Output B**: A high-res "Master" version kept for the Brand's final download.
4.  **Update**: The backend updates the `campaign_offers` record with the `preview_url`, allowing the Brand to review the content instantly without buffering.

## 4. Atomic Wallet Transactions (ACID Compliance)

Financial integrity is maintained through atomic PostgreSQL transactions.

*   **Atomic Payout Logic**:
    ```sql
    BEGIN;
      -- 1. Deduct from Pending Escrow
      UPDATE wallets SET escrow_balance = escrow_balance - 500 WHERE user_id = 'creator_uuid';
      -- 2. Add to Available Balance
      UPDATE wallets SET available_balance = available_balance + 500 WHERE user_id = 'creator_uuid';
      -- 3. Record Audit Log
      INSERT INTO transactions (user_id, amount, type, status) VALUES ('creator_uuid', 500, 'payout', 'completed');
    COMMIT;
    ```
*   **Rollback Safety**: If Step 2 or 3 fails (e.g., server timeout), the database performs a **Rollback**, ensuring the creator's money is never "stuck" between states or lost.

## 5. Security Guardrails

*   **Encryption at Rest**: All sensitive communication and financial records are encrypted using AES-256.
*   **Server-Side Valuation**: Payout amounts are derived directly from the database contract, never from client-side parameters, preventing "Man-in-the-Middle" payment tampering.
