# Modus Frontend Architecture: Resilient Sync & Optimistic UI

This document defines the strategies for maintaining high perceived performance, offline resilience, and real-time responsiveness within the Modus mobile application.

## 1. Optimistic UI & State Persistence

To make the app feel "instant," Modus implements an **Optimistic Update** pattern for high-frequency actions (Messaging, Bookmarking, Status Changes).

*   **The Workflow**:
    1.  **User Action**: Creator taps "Save for Later."
    2.  **Instant Feedback**: The UI immediately updates the bookmark icon to "Saved" and adds the item to the local pipeline state.
    3.  **Background Sync**: The app sends the `POST` request to the server in the background.
*   **Error Handling (The Rollback)**:
    *   If the request fails, the app uses a **state snapshot** to revert the UI.
    *   A subtle, non-blocking notification appears: *"Failed to save job. Tap to retry."*

## 2. The Offline Action Queue (Local Persistence)

Modus ensures that creator work is never lost due to a tunnel or poor signal.

*   **Local Storage**: All non-media actions (Accepting Invites, Updating Bio, Pitching) are stored in a local **SQLite** queue when the device is offline.
*   **Action Schema**: `id`, `action_type`, `payload`, `timestamp`, `status`.
*   **The Flush Logic**:
    *   The app monitors connectivity via a `NetInfo` listener.
    *   Upon reconnection, a background service "flushes" the queue to the server sequentially.
*   **Conflict Resolution**: In cases of simultaneous updates (e.g., editing profile on two devices), the **Server Timestamp** is the ultimate source of truth.

## 3. Resumable Multipart Uploads

For heavy media (videos), Modus uses a chunk-aware resume strategy.

*   **Session Tracking**: The app generates a unique hash for each video file and stores its associated `UploadID` in local storage.
*   **Chunk Awareness**: If an upload fails at 150MB of a 300MB file:
    1.  The app records that `Chunk #30` (5MB each) was the last successful part.
    2.  Upon signal recovery, the app queries the server: *"Which chunk do you have for UploadID X?"*
    3.  The upload resumes from `Chunk #31`, saving data and time.

## 4. Real-Time Presence & Heartbeats

To eliminate the "talking to a void" feeling, Modus utilizes **WebSocket Presence**.

*   **Presence Status**: When a creator enters a `ChatScreen`, they join a Supabase Realtime channel for that `offer_id`.
*   **Typing Indicators**: As a user types, a `TYPING_INDICATOR` event is broadcast every 2 seconds.
*   **Live Status**: Users see a green dot and "Online" text when their partner is actively viewing the collaboration hub.
*   **Auto-Timeout**: If a heartbeat is not received for 30 seconds, the user is marked as "Away."

## 5. Performance Guardrails (Data Hygiene)

*   **No Blocker Spinners**: We prioritize "Skeleton Screens" and background progress bars over full-screen loading wheels, allowing the creator to continue navigating while data loads.
*   **Lazy Sync**:
    *   The app only fetches the **Top 10** records for any history or feed.
    *   Historical data (>3 months) is only fetched upon an explicit "Load More" scroll, preserving battery and data.
*   **Delta Syncing**: The app requests data updates using a `last_synced_at` parameter, ensuring only new or changed records are downloaded.
