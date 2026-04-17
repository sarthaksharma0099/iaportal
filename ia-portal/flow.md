# India Accelerator Investor Portal - End-to-End Flow

This document outlines the high-level architecture and the step-by-step user journey (end-to-end flow) for the **India Accelerator Investor Portal**.

## Tech Stack
- **Frontend Framework**: React (created via `create-react-app`).
- **Routing**: Handled via simple conditional rendering in `App.jsx` checking `window.location.pathname`.
- **Database / Backend**: Supabase (PostgreSQL + Auth + API layer).
  - Handles regular queries using public anon key (`supabase`).
  - Handles privileged administrative actions using service role key (`supabaseAdmin`).
- **Styling**: Vanilla CSS (`global.css`) utilizing CSS variables for theme tokens (e.g., `--bg`, `--gold`) to implement a premium dark mode UI.

---

## Architecture Overview

The application is split into two primary domains:

1. **Investor Portal (`/`)**
   - The public/investor-facing side.
   - Purpose: Allow invited investors to view confidential pitch materials, financials, and company information.
   - Uses basic email checking against Supabase to allow access.

2. **Admin Panel (`/admin*`)**
   - The internal manager dashboard.
   - Purpose: Manage access requests, view investor analytics, and update portal content/attachments.
   - Protected by a simple password matching an environment variable.
   - Bypasses RLS by using the admin service role key for all database operations.

---

## 1. Investor Journey (End-to-End Flow)

### Step 1: The Gate (Access Control)
When a user visits the root URL `/`, they are presented with the `Gate` component (`src/pages/portal/Gate.jsx`).
- **Sign In**: The investor enters their email.
  - The app queries the `investors` table in Supabase.
  - If approved, a session token (`ia_email`) is stored in `sessionStorage`, their `last_viewed_at` timestamp is updated, an `access_log` entry is created, and they proceed to the Portal.
  - If pending or revoked, an error message informs them of their status.
- **Request Access**: If they are unauthorized or new, they can switch to the "Request Access" form.
  - Submitting their details pushes a record to the `access_requests` table with a `pending` status.

### Step 2: Main Portal Dashboard
Once authenticated, the investor sees `Portal.jsx`.
- **Data Loading**: The portal fetches layout and content from two Supabase tables:
  1. `portal_sections`: Maps to the different material categories displayed on the page (e.g., Pitch Deck, Financials, etc.).
  2. `content_blocks`: Stores dynamic textual values, stats, and URLs associated with the respective sections.
- **Hero & Financials**: Displays high-level stats and textual content populated dynamically from the database.
- **Materials Grid**: The investor sees "cards" for each category of material. Cards are marked "Live" or "Soon".

### Step 3: Viewing Documents
When the investor clicks a "Live" material card:
- The app tracks the interaction by adding a view event into the `access_log` table.
- If the section refers to the pitch deck, it launches the dedicated `PitchDeck` component.
- Otherwise, it displays an overlay modal (`PDFViewer`).
- The modal renders a list of PDF documents (urls sourced from `content_blocks`). Clicking one opens the PDF within an iframe for in-browser consumption.

---

## 2. Admin Journey (End-to-End Flow)

### Step 1: Admin Login
An administrator navigates to `/admin`.
- They are presented with the `AdminLogin.jsx` screen.
- Authentication relies on matching the user's password input against an environment variable (`REACT_APP_ADMIN_PASSWORD`).
- Upon success, an `ia_admin` flag is saved to `sessionStorage` and they enter the Admin Shell.

### Step 2: The Admin Shell
The `AdminShell.jsx` acts as the main layout wrapper equipped with a persistent sidebar. It queries the `access_requests` table to display a live notification badge of how many pending requests require action.

The shell navigates between various data-management views:
- **Dashboard**: High-level overview.
- **Sections & Content**: Forms and editors that allow admins to update `portal_sections` (order, visibility) and `content_blocks` (changing PDF urls, editing hero text).
- **Investors**: View the approved list of investors. Admins can manually add, revoke, or remove access.
- **Requests**: Review the queue in `access_requests`. The admin can "Approve" (moves the user to the `investors` table) or "Reject".
- **Analytics**: Pulls data from the `access_log` to show which investors viewed which sections and when, helping gauge engagement levels.

---

## Database Entity Relationships (Implied)
Based on the code references, the application utilizes the following Supabase tables:

1. **`investors`**: `{ email, name, status ('approved', 'revoked'), last_viewed_at }`
   - Master list of who is allowed into the portal.
2. **`access_requests`**: `{ id, name, email, firm, message, status ('pending', 'approved', 'rejected') }`
   - Inbound funnel for new investors requesting access.
3. **`access_log`**: `{ id, investor_email, event ('login', 'view'), section_key, created_at }`
   - Audit trail for analytics.
4. **`portal_sections`**: `{ id, key, title, description, icon, badge, is_visible, sort_order }`
   - Defines the structural layout of the Portal materials grid.
5. **`content_blocks`**: `{ id, section_key, block_key, value }`
   - A key-value store for all text snippets, statistics, and PDF URLs that populate the portal.
