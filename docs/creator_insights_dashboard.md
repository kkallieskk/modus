# Modus Architecture: Creator Insights & Success Engine

This document defines the infrastructure for internal performance tracking, automated urgency nudges, and privacy-first discovery controls for the creator ecosystem.

## 1. Marketplace Visibility Metrics

Modus provides creators with direct insight into how the "Brand World" perceives their profile.

*   **View Tracking**: The backend logs every unique Brand view in the `profile_views` table (anonymized to protect brand intent).
*   **Weekly Traffic**: Creators see a high-fidelity count of "Profile Impressions" from the last 7 days.
*   **The Conversion Hook**: The app implements a logic layer to offer strategic advice:
    *   *Condition*: `IF (Weekly_Views > 50 AND Monthly_Hires < 1)`
    *   *Prompt*: "Your profile is trending! Brands are looking, but not booking yet. Try updating your 'Pinned Portfolio' to showcase your latest style."

## 2. Pitch Performance Intelligence

To help creators move from "Volume" to "Quality," the dashboard provides a private win-rate analysis.

*   **Success Tracker**: Calculates the percentage of `campaign_pitches` that transitioned from `Submitted` to `Accepted`.
*   **Positive Framing**: Data is presented as professional growth targets. Instead of showing "Rejections," the system highlights "Competitive Fit":
    *   *Presentation*: "Your pitches are a 15% fit for current brand requirements. Brands in the [Niche] category are currently looking for more [Tag] styles—consider tailoring your next pitch!"

## 3. Automated "Urgency" Guardrails (The Nudge Engine)

The backend acts as a virtual manager to protect the creator's platform reputation and star rating.

*   **Deadline Nudges**: A background worker (CRON) scans for active jobs every 6 hours.
*   **The Critical Window**:
    *   *Trigger*: `IF (Status == 'Escrow_Funded' AND Deadline < 24h AND Deliverable == NULL)`
    *   *Action*: Send a high-priority push: "Final Stretch! Upload your draft now to meet your deadline and keep your 5-star rating shining."
*   **Spam Protection**: The `automated_nudges` table tracks every system-sent ping. The engine is capped at **one nudge per user, per day** to maintain effectiveness without becoming intrusive.

## 4. The Discovery Toggle (Work-Life Balance)

Modus respects creator availability and professional boundaries through a centralized privacy switch.

*   **`is_discoverable` Flag**: A simple toggle in the Creator's Settings.
*   **The Search Gate**:
    *   When set to `OFF`, the creator's ID is instantly excluded from all Brand Search Roster queries (`WHERE role = 'creator' AND is_discoverable = true`).
*   **Status Persistence**: Creators remain "Hidden" from new discovery while maintaining full access to their "Active Jobs" and "Chat" for existing commitments.

## 5. Security & Performance Guardrails

*   **Privacy Isolation**: Brands cannot see their own "View" logs in the creator's dashboard—data is aggregated to maintain marketplace neutrality.
*   **Modus-Specific Data**: The dashboard strictly excludes external social media metrics (likes/comments), focusing entirely on platform performance to keep creators focused on the Modus economy.
*   **Cache-First Insights**: Visibility and win-rate metrics are pre-calculated daily in the background to ensure the "Insights" tab loads instantly without expensive real-time database joins.
