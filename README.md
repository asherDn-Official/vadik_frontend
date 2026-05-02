# Vadik AI Frontend

Vadik AI is a frontend-only React application for retailer customer engagement, retention, and business performance management. The app acts as a business dashboard where retailers and staff can manage customer profiles, analyze customer behavior, create engagement activities, send WhatsApp campaigns, configure integrations, manage subscription usage, and track performance metrics.

This repository contains only the client application. Backend services, database models, authentication APIs, payment verification, WhatsApp delivery, AI recommendations, and analytics calculations are expected to be provided by external APIs configured through environment variables.

## Tech Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS, custom CSS
- **HTTP Client:** Axios
- **State Management:** React Context and local component state
- **Forms and Validation:** React Hook Form, Yup
- **Charts and Analytics UI:** Chart.js, React Chart.js 2, Recharts
- **Dates and Calendars:** Day.js, Moment, React Datepicker, React Calendar
- **Tables and Imports:** XLSX for Excel import/export flows
- **Notifications:** React Toastify
- **Icons:** Lucide React, React Icons
- **Campaign/Gamification UI:** Scratch card libraries, custom quiz/spin-wheel/scratch-card components
- **Build Tooling:** Vite, ESLint, PostCSS, Autoprefixer

## Application Overview

The application is designed for retail businesses that want to centralize customer data and use that data to improve retention. It supports two login modes:

- **Business Admin / Retailer:** Full access to retailer account setup, settings, subscriptions, integrations, and all modules.
- **Team / Staff:** Permission-based access controlled by module-level read permissions returned from the backend.

At a high level, the frontend supports:

- Retailer login and onboarding
- Customer profile creation, editing, search, pagination, and bulk import
- Customer insight filtering and Excel export
- Dashboard metrics for retention, churn, engagement, opt-in/out, satisfaction, and profile completion
- Customer activities such as quizzes, spin wheels, scratch cards, coupons, and WhatsApp-based campaign sharing
- WhatsApp-based customer rhythm workflows, including templates, campaigns, live chat, automation, and reporting
- Integration management for WhatsApp and Google Place Review
- Quick customer/coupon search
- Performance tracking for interactions, CLV, cart statistics, campaign analytics, and revenue-style metrics
- Settings for profile, customer fields, roles, permissions, coupons, loyalty points, retry automation, and subscription plans
- Notifications, reminders, greeting workflows, and WhatsApp failure alerts

## Frontend Architecture

The app follows a route-driven React architecture. Page components in `src/pages` represent major screens, while feature-specific components live under `src/components`. Shared application state is handled with React Context providers, and API access is centralized through an Axios instance.

### Entry Point

`src/main.jsx` mounts the React app and wraps it with global providers:

- `AuthContext` for authenticated user/session state
- `UnsavedChangesProvider` for navigation guards
- `PlanProvider` for subscription and credit usage state
- `ToastContainer` for global toast notifications

### Root Application

`src/App.jsx` defines the route tree and guards access based on:

- Authentication status from `useAuth()`
- Onboarding completion from `/api/auth/validate-token`
- WhatsApp ownership status for the Customer Rhythm module

Public routes include login, password reset, registration, and completion screens. Authenticated routes are nested inside the shared `Layout` component.

### Shared Layout

`src/components/common/Layout.jsx` provides the authenticated shell:

- Persistent sidebar navigation
- Main content outlet via React Router's `<Outlet />`
- Demo tour modal support
- Subscription popup when no active plan exists
- WhatsApp failure alert popup
- Security popup context provider

`src/components/common/Sidebar.jsx` controls module navigation, logout behavior, unsaved-change prompts, and staff permission filtering.

## Folder Structure

```text
src/
  api/
    apiconfig.js
  components/
    common/
    customerInsigth/
    customeroppertunites/
    customerProfile/
    customerRhythm/
    dashboard/
    integration/
    KYC/
    PerformanceTracking/
    registration/
    settings/
  context/
    AuthContext.jsx
    PlanContext.jsx
    SecurityPopupContext.jsx
    UnsavedChangesContext.jsx
  data/
    data.js
    mockData.jsx
  pages/
    Dashboard.jsx
    CustomerList.jsx
    CustomerAdd.jsx
    CustomerPersonalisation.jsx
    CustomerOpportunities.jsx
    CustomerRhythm.jsx
    IntegrationPage.jsx
    kyc.jsx
    Login.jsx
    ForgotPassword.jsx
    Register.jsx
    Notification.jsx
    PerformanceTracking.tsx
    SettingsPage.jsx
    Subscription.jsx
  utils/
    billingUtils.js
    customerDataUtils.js
    getModulePath.js
    Loader.jsx
    ToastNotification.js
    whatsappErrorCodes.js
```

### Key Root Files

- `index.html` is the Vite HTML entry file.
- `vite.config.js` configures the Vite React build.
- `tailwind.config.js` configures Tailwind scanning and theme extensions.
- `postcss.config.js` configures PostCSS/Tailwind processing.
- `public/_redirects` enables SPA fallback routing for static hosting.
- `.env.example` documents required runtime environment variables.
- `.github/workflows/frontend-deploy.yml` contains deployment automation.

## Module Breakdown

### Authentication and Onboarding

Relevant files:

- `src/pages/Login.jsx`
- `src/pages/ForgotPassword.jsx`
- `src/pages/Register.jsx`
- `src/components/registration/*`
- `src/context/AuthContext.jsx`

The login screen supports retailer and staff login. Retailers authenticate through `api/auth/retailerLogin`; staff authenticate through `api/auth/staffLogin`. Tokens and identity metadata are stored in `localStorage`, then validated through `/api/auth/validate-token`.

Registration is a multi-step onboarding flow:

1. Basic information
2. Store information
3. Additional business details
4. Completion

Form progress is preserved in `localStorage` under `formData`.

### Dashboard

Relevant files:

- `src/pages/Dashboard.jsx`
- `src/components/dashboard/*`

The dashboard presents business health widgets including customer profile collection, profile overview, retention rate, churn rate, engagement score, opt-in/out rate, and satisfaction score. These components call dashboard API endpoints and render metric cards/charts.

### Customer Profile Management

Relevant files:

- `src/pages/CustomerList.jsx`
- `src/pages/CustomerAdd.jsx`
- `src/components/customerProfile/*`

This module handles customer list search, filtering, pagination, customer creation, detail views, editing, profile sections, data-source management, and bulk import.

Expected backend interactions include:

- `GET /api/customers`
- `GET /api/customers/:customerId`
- `POST /api/customers`
- `PATCH /api/customers/:customerId`
- `POST /api/customers/bulk-upload`
- `GET /api/customers/bulk-upload/template`
- `GET /api/retailer/getSource`
- `PATCH /api/retailer/getSource`

### Customer Insight

Relevant files:

- `src/pages/CustomerPersonalisation.jsx`
- `src/components/customerInsigth/*`

This module filters customers by demographic, behavioral, preference, and time-period criteria. It posts filter payloads to `/api/personilizationInsights`, renders paginated customer results, supports customer selection, and can export filtered data to Excel.

### Customer Activity and Opportunities

Relevant files:

- `src/pages/CustomerOpportunities.jsx`
- `src/components/customeroppertunites/*`

This module groups campaign and engagement tools. It includes:

- Activity creation
- Quiz creation and listing
- Spin wheel creation, listing, preview, and sharing
- Scratch card creation and listing
- Coupon management popup
- Campaign sending
- Purchase history
- AI/customer recommendation placeholders

The frontend suggests that the backend supports activity configuration, campaign dispatch, coupon lookup, customer matching, and sharing activities through WhatsApp.

### Customer Rhythm

Relevant files:

- `src/pages/CustomerRhythm.jsx`
- `src/components/customerRhythm/*`
- `src/components/settings/Template.jsx`

Customer Rhythm is available only when the authenticated account has `isUsingOwnWhatsapp` enabled. It contains:

- Live Chat
- WhatsApp template dashboard
- Template builder
- Send campaign workflow
- Automation template mapping
- Rhythm/engagement report

Expected backend interactions include WhatsApp template sync, media upload, campaign creation, campaign sending, message logs, live chat intervention/resolve actions, retry automation statistics, and timeline reporting.

### Integration Management

Relevant files:

- `src/pages/IntegrationPage.jsx`
- `src/components/integration/*`

This module manages external integrations. Current implemented integrations include:

- Google Place Review
- WhatsApp Business / Meta integration

Additional platforms such as Google Sheets and Meta campaign integrations are represented as coming-soon or placeholder experiences.

### Quick Search / KYC

Relevant files:

- `src/pages/kyc.jsx`
- `src/components/KYC/*`

The Quick Search module searches customers and coupon claims. It appears designed for fast customer lookup by phone, coupon, or related identifiers, with support for marking coupon claims as used.

### Performance Tracking

Relevant files:

- `src/pages/PerformanceTracking.tsx`
- `src/components/PerformanceTracking/*`

This module displays interaction rate, WhatsApp opens, click rate, response rate, campaign analytics, conversion trends, cart value statistics, and CLV summaries.

Expected backend interactions include:

- `GET /api/performanceTracking/interactionRate`
- `GET /api/performanceTracking/clvSummary`
- `GET /api/performanceTracking/campaingAnalytics`
- `GET /api/performanceTracking/cartStatistics`

### Settings

Relevant files:

- `src/pages/SettingsPage.jsx`
- `src/components/settings/*`

Settings are organized as internal tabs:

- My Profile
- Customer Preferences
- Roles & Permissions
- Coupons
- Loyalty Points
- Retry Automation

Some settings components also reference inventory, daily billing, daily order sheets, templates, user management, and imports, indicating a broader operational settings area.

### Subscription and Credits

Relevant files:

- `src/pages/Subscription.jsx`
- `src/components/settings/subscription/*`

Subscription screens manage active plans, addons, billing details, trial activation, payment order preparation, payment verification, WhatsApp credit balance, top-ups, and usage history.

The frontend expects payment-related API support and uses `VITE_RAZORPAY_KEY_ID` for Razorpay integration.

### Notifications

Relevant files:

- `src/pages/Notification.jsx`
- `src/components/common/WhatsAppAlertPopup.jsx`

Notification workflows include settings, unread alerts, stats, calendar events, reminders, archived notifications, greeting sends, loyal customer lists, high-CLV-at-risk customers, and WhatsApp failure alerts.

## Routing

The application uses `BrowserRouter`, `Routes`, nested routes, and route redirects.

### Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Login screen |
| `/forgot-password` | Password reset flow |
| `/register/*` | Multi-step onboarding |
| `/completion` | Registration completion |

### Authenticated Routes

All authenticated routes render inside `Layout`.

| Route | Page |
| --- | --- |
| `/dashboard` | Dashboard |
| `/customers` | Customer list |
| `/customers/add` | Add customer |
| `/customers/customer-profile/:customerId` | Customer profile detail |
| `/personalisation` | Customer insight |
| `/customeropportunities` | Customer activity |
| `/customerrhythm` | WhatsApp rhythm module |
| `/performance` | Performance tracking |
| `/integration` | Integration management |
| `/quicksearch` | Quick search / KYC |
| `/settings` | Settings default tab |
| `/settings/:tab` | Settings tab route |
| `/subscription` | Subscription page |
| `/notifications` | Notifications |

## Data Flow

The frontend uses a predictable flow:

1. A user logs in through retailer or staff login.
2. The backend returns a token and user metadata.
3. The token, retailer ID, email, and selected integration IDs are stored in `localStorage`.
4. `AuthContext` validates the token through `/api/auth/validate-token`.
5. `App.jsx` decides whether to show authenticated routes, redirect to onboarding, or return to login.
6. Authenticated pages call APIs through the shared Axios client in `src/api/apiconfig.js`.
7. The Axios interceptor reads the latest token from `localStorage` before every request and attaches it as the `Authorization` header.
8. Components store API responses in local state and update tables, charts, cards, forms, modals, or tabs.
9. Mutations such as creating customers, updating coupons, sending campaigns, or changing settings trigger API requests and then refresh the relevant local state.
10. Global contexts handle cross-cutting behavior such as plan availability, authentication status, unsaved-change protection, and popup state.

## API Configuration

`src/api/apiconfig.js` creates the shared Axios client:

```js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

Every API request is relative to `VITE_API_BASE_URL`. The app expects the backend to accept the token in the `Authorization` header.

Required environment variables are documented in `.env.example`:

```env
VITE_API_BASE_URL=https://your-api-url-here
VITE_RAZORPAY_KEY_ID=your-test-key-here
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Backend Interactions Inferred From Frontend

Although no backend code is included, the frontend expects backend services for:

- Authentication and token validation
- Retailer onboarding and profile management
- Staff login, roles, and permissions
- Customer CRUD and bulk upload
- Customer preference field configuration
- Customer segmentation and personalization insights
- Dashboard metrics and analytics
- Coupons, coupon claims, loyalty rules, and reward campaigns
- Quiz, spin wheel, and scratch card management
- WhatsApp Business configuration, templates, media upload, campaigns, and live chat
- Retry automation settings, timeline, and statistics
- Notification settings, reminders, greetings, and alert feeds
- Google Place Review integration
- Inventory, order history, billing uploads, and purchase history
- Subscription plans, addons, trials, payment verification, and WhatsApp credits

The backend is also likely responsible for AI-assisted recommendations in customer activity and assistant modules.

## State Management

The project does not use Redux or a server-state library. State is managed through:

- **React Context:** authentication, plan/subscription state, security popup state, unsaved-change state
- **Component state:** filters, forms, selected tabs, pagination, loading states, modal visibility, fetched data
- **Browser storage:** token, retailer ID, email, place ID, onboarding form data, login metadata
- **URL state:** search parameters, customer IDs, settings tabs, and Customer Rhythm section query parameters

## Setup Instructions

### Prerequisites

- Node.js 18 or newer
- npm
- A running backend API that matches the expected endpoints
- Razorpay and Facebook/Meta credentials if payment or WhatsApp integration flows are used

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update the values:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_FACEBOOK_APP_ID=your_meta_app_id
```

### Run Locally

```bash
npm run dev
```

Vite will start the application and print a local development URL, usually:

```text
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment Notes

The presence of `public/_redirects` indicates the app is intended to be deployed as a single-page application on a static host such as Netlify or a similar platform. The redirect rule sends unknown paths back to `index.html`, allowing React Router to handle client-side routes.

The GitHub workflow under `.github/workflows/frontend-deploy.yml` suggests automated frontend deployment is configured or planned.

## Assumptions

- The backend is a separate service and is not part of this repository.
- The backend uses JWT or token-based authentication and accepts the token through the `Authorization` header.
- `retailerId`, `email`, and `place_id` in `localStorage` are expected by several frontend flows.
- Staff users receive module-level permissions from the auth validation API.
- Retailer users have full module access.
- Customer Rhythm is only available when the retailer has connected their own WhatsApp Business setup.
- Subscription and WhatsApp credit APIs determine whether the user should see plan or addon prompts.
- AI assistant and recommendation features are partially represented in the UI and depend on backend/AI services not included here.
- Several integrations and activity platforms are intentionally marked as coming soon.

## Future Improvements

- Add a typed API layer with endpoint-specific request and response models.
- Move all direct Axios usage to the shared `api` client for consistent auth handling.
- Introduce a server-state library such as TanStack Query for caching, retries, pagination, and mutations.
- Standardize naming for folders such as `customerInsigth` and `customeroppertunites`.
- Add TypeScript coverage consistently across the project.
- Add route-level loading and error boundaries.
- Replace hard-coded demo values with backend-driven defaults.
- Improve token handling with refresh flow and expiry-aware logout.
- Add unit tests for utilities and integration tests for core user flows.
- Add accessibility checks for modals, navigation, forms, and table interactions.
- Document backend API contracts once backend schemas are finalized.
