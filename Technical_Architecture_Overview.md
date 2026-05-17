# Modus Technical Architecture & Executive Overview

## 1. Core Technology Stack
Modus is built on a high-performance, scalable, and secure architecture designed for the creator economy.

*   **Frontend**: **React Native (Expo)** with **TypeScript**.
    *   *Why*: Allows for cross-platform (iOS/Android) parity while maintaining a single, type-safe codebase. TypeScript ensures architectural stability as the project scales.
*   **Backend & Database**: **Supabase (PostgreSQL)**.
    *   *Role*: Handles relational data, real-time subscriptions, and enterprise-grade security.
*   **Authentication**: **Supabase Auth (including Google OAuth)**.
    *   *Role*: Provides frictionless onboarding for brands and creators with secure session management.
*   **Storage**: **Supabase Storage**.
    *   *Role*: Securely hosts high-resolution deliverables and creator portfolios.

---

## 2. Key Architectural Components

### A. The Campaign Builder (Wizard Engine)
We implemented a multi-step, state-driven "Wizard" for campaign creation.
*   **Technical Implementation**: Uses a progressive disclosure pattern to minimize cognitive load. State is managed locally during creation and synced to PostgreSQL only upon finalization.
*   **Visibility Logic**: A custom `visibility` attribute ('private' | 'public') was implemented at the core of the campaign schema to enforce strict data privacy.

### B. "Manage Candidates" Hub (Dual-Channel Recruitment)
A sophisticated candidate management system that distinguishes between inbound applications and outbound invites.
*   **Real-time Data Joins**: Complex SQL queries link `campaign_offers` with `profiles` to provide real-time status updates (e.g., "Awaiting Creator Response").
*   **UX Distinction**: Features a tabbed architecture that dynamically hides or shows recruitment channels based on the campaign's privacy settings.

### C. Creator "Opportunities" Board (Public Marketplace)
A discovery feed for creators to find and apply to projects.
*   **Security Filtering**: Implements database-level filtering to ensure "Private" campaigns never leak into the public discovery layer.
*   **The "No Free Work" Protocol**: The pitch modal is restricted to text-only inputs, preventing brands from requesting unpaid creative assets before hiring.

### D. Vault Escrow & Asset Management (Security Layer)
A digital safe for campaign funds and finalized content.
*   **Status Machine**: Orchestrates the transition of a campaign from `draft` -> `active` (funded) -> `submitted` -> `completed`.
*   **Digital Receipting**: Assets in the "Vault" are linked to usage rights and license agreements stored in the database.

---

## 3. Security & Scalability

*   **Row Level Security (RLS)**: We implemented strict RLS policies in PostgreSQL. This ensures that a creator can only see the campaigns they are invited to or that are public, and brands can only access their own campaign data.
*   **Normalized Schema**: The database is structured to support multi-creator campaigns (One Campaign -> Many Offers/Applications), allowing brands to hire and manage teams at scale.
*   **Optimistic UI Updates**: The app uses immediate UI feedback loops for actions like deleting campaigns or submitting pitches, with background synchronization to ensure a snappy user experience.

---

## 4. Visual & UI Logic
*   **Design Tokens**: Custom design system using HSL color scales and premium typography (Inter/System).
*   **Iconography**: Integration of **Lucide React Native** for high-fidelity, consistent visual cues.
*   **Responsive Layouts**: Utilizing `useSafeAreaInsets` and `Dimensions` to ensure a premium look on everything from iPhone SE to the latest Android flagships.

---

**Modus is not just an app; it's a secure, scalable operating system for brand-creator collaborations.**
