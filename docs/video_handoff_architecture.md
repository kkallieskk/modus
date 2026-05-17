# Modus Architecture: Pro Video Handoff & Storage Optimization

This document defines the technical infrastructure for high-reliability video delivery, legal ownership transfer, and server-side cost management.

## 1. Resilient Multipart Uploads

To ensure creators can deliver high-quality 4K videos even on unstable mobile connections:
*   **Chunking Strategy**: Large files are split into **5MB segments** on the client side.
*   **S3 Multipart API**: 
    1.  `initiateUpload`: Server returns a unique `UploadID`.
    2.  `uploadPart`: Client uploads chunks in parallel. If a part fails, only that 5MB chunk is retried.
    3.  `completeUpload`: S3 "stitches" the parts into a single, high-fidelity master file.
*   **Resumability**: The app stores the `UploadID` locally. If the connection drops at 90%, the creator resumes from the last successful chunk.

## 2. Legal Ownership Handover (The "Vesting" Logic)

Ownership of the media asset is managed through a state-driven permissions model.

*   **In-Progress (Private)**: The file is stored with an ACL (Access Control List) restricted to the platform service. Signed URLs are generated for previewing.
*   **Post-Approval (Vesting)**: Upon "Escrow Release," a backend trigger updates the object metadata:
    *   `x-amz-meta-owner-id`: Set to `brand_id`.
    *   `x-amz-meta-status`: Set to `final_delivery`.
*   **Immutability**: Once vested, the Creator is stripped of `Delete` permissions on the file. The Brand is granted permanent `Read` access via the Modus vault.

## 3. "Ghost" Storage Cleanup (Cost Management)

Content production often results in redundant files. To prevent runaway cloud storage costs:
*   **Rejected Drafts**: A background worker (CRON) runs every 24 hours.
*   **Logic**: Identifies files associated with `status: rejected` or `status: replaced` that are older than **30 days**.
*   **Cold Storage**: These files are moved from S3 Standard to **S3 Glacier (Cold Storage)**, reducing hosting costs by ~70%.
*   **Purge**: Files older than 90 days in cold storage are permanently deleted, unless flagged for an active dispute.

## 4. Worker-Based Push Notifications (The Buffer)

To ensure platform responsiveness during high-traffic spikes:
*   **Queue Architecture**: Modus uses **BullMQ (Redis-backed)** for all outbound notifications.
*   **Process**:
    1.  Status change occurs (e.g., `Job Approved`).
    2.  The main API server pushes a job to the `notification-queue`.
    3.  A pool of **Worker Nodes** consumes the queue and communicates with FCM (Firebase Cloud Messaging).
*   **Benefit**: If 1,000 jobs finish simultaneously, the workers process them in a controlled burst, preventing the main server from lagging or crashing.

## 5. Proof of Delivery (Download Tracking)

To protect creators and the platform during "Never Received" disputes:
*   **Proxied Downloads**: Brands do not download directly from a raw S3 link.
*   **Tracking Gateway**: `GET /api/download/:offer_id`
    1.  **Auth Check**: Verifies the brand is the legal owner of the file.
    2.  **Audit Log**: Records `timestamp`, `ip_address`, `device_info`, and `user_id` in the `delivery_logs` table.
    3.  **Redirect**: Generates a 60-second Signed URL for the actual download.
*   **Platform Record**: This log serves as the definitive "Proof of Delivery" for all financial and legal reconciliations.

## 6. Infrastructure Safety Guardrails

*   **Zero Local Storage**: No video files ever touch the main Modus application server. All processing is handled in-transit or via cloud-native workers.
*   **Signed URL TTL**: All media preview links have a strict Time-To-Live (TTL) of 3600 seconds (1 hour), preventing leaked links from being used indefinitely.
