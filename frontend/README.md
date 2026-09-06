# 🏢 Urban Furniture — ERP & Customer Portal Frontend

A modern, responsive, high-performance web interface for the **Urban Furniture Enterprise Accounting & ERP Suite**, built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## 📑 Table of Contents

- [✨ Feature Highlights](#-feature-highlights)
- [💳 Razorpay Checkout & Dynamic UPI QR Modal](#-razorpay-checkout--dynamic-upi-qr-modal)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📜 Available Scripts](#-available-scripts)

---

## ✨ Feature Highlights

### 📊 1. Executive Analytics & KPI Dashboard
- **Real-Time Financial Metrics**: Revenue, Expenses, Net Profit Margin %, Outstanding Receivables (Debtors), and Outstanding Payables (Creditors).
- **Interactive Recharts Visualizations**:
  - **Financial Trends**: Historical monthly income vs. expense area chart.
  - **Operating Cash Flow**: Monthly inflows vs. outflows bar chart.
  - **Receivables Aging**: Overdue aging breakdown pie/bar chart.
  - **Departmental Budget Utilization**: Target vs. actual spend progress.
  - **Top Debtors Ranking**: Ranked leaderboard of clients with highest unpaid balances.
  - **Recent Activity Audit Feed**: Live chronological transaction logs.

### 💳 2. Razorpay Payment Gateway & UPI QR Checkout
- **Interactive Multi-Tab Payment Modal**:
  - **Dynamic SVG UPI QR Code**: Live QR code generated with standard `upi://pay` URI, live countdown timer, and popular UPI app badges (Google Pay, PhonePe, Paytm, BHIM).
  - **One-Click Instant Scan Simulator**: Test complete payment settlement instantly without real funds.
  - **UPI VPA / ID**: Support for custom VPA addresses (e.g., `customer@okaxis`).
  - **Credit / Debit Cards**: Card checkout with quick test card autofill (`4111 1111 1111 1111`).
  - **NetBanking**: Integrated bank selection across major Indian banks.
- **Auto-Reconciliation**: Automatically receives verification tokens and triggers balanced double-entry ledger postings.

### 👥 3. Customer & Vendor Self-Service Portal
- Scoped portal views tailored specifically for client contacts.
- Real-time invoice listing with status badges (`PAID`, `PARTIAL`, `POSTED`).
- One-click payment initiation and downloadable payment receipts.

### ⚖️ 4. Accounting & General Ledger
- Chart of Accounts (COA) lookup with categorized account codes.
- Journal entries viewer with debit/credit balance verification.
- Real-time **Profit & Loss (P&L)** statements and **Balance Sheet** generation.

### 🔄 5. Order & Procurement Pipelines
- **Sales Order Management**: Create draft orders, confirm quotations, and generate customer invoices.
- **Purchase Order Management**: Create POs with budget warning alerts and generate vendor bills.
- **Payment Registration**: Multi-journal payment capture (Bank, Cash, Online Gateway).

### 🔐 6. Authentication & User Management
- Secure JWT-based session management with automatic route guards.
- **6-Digit OTP Password Reset**: Full multi-step OTP request, verification, and password update flow.
- **User Management Dashboard**: Admin interface for creating and managing staff and customer accounts.

---

## 💳 Razorpay Checkout & Dynamic UPI QR Modal

The frontend includes an interactive checkout modal (`src/features/portal/components/RazorpayCheckoutModal.tsx` and `src/lib/razorpay.ts`) that supports both real Razorpay checkout and zero-money sandbox mode:

- **Live Mode**: Dynamically loads Razorpay's official checkout script (`checkout.razorpay.com/v1/checkout.js`) and opens the native Razorpay popup.
- **Sandbox Mode**: Renders a dedicated modal with:
  1. **Dynamic SVG UPI QR Code** with live timer countdown.
  2. **Instant Test Scan Button** for 100% zero-money end-to-end evaluation.
  3. **UPI VPA / Card / NetBanking** tabs.
  4. Automatic payment status synchronization and receipt generation.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Build Tool**: [Vite](https://vitejs.dev/) with HMR
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS custom design system
- **Charts & Graphs**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Folder Structure

```text
frontend/src/
├── app/                        # Main router and top-level navigation
├── assets/                     # Static images, brand logos, and SVGs
├── components/                 # Shared UI elements (Modals, Badges, Tables, Inputs)
├── features/                   # Modular business feature suites
│   ├── accounting/             # General Ledger, Chart of Accounts, Journals
│   ├── accounts/               # Account master management
│   ├── analytics/              # Analytic cost & revenue centers
│   ├── auth/                   # Login, Register, OTP Password Reset, User Management
│   ├── budgets/                # Budget planning, revisions & utilization
│   ├── contacts/               # Customer & Vendor directory
│   ├── dashboard/              # Executive KPI dashboard & Recharts analytics
│   ├── documents/              # Invoice & Bill PDF/print layouts
│   ├── journals/               # Accounting journals configuration
│   ├── orders/                 # Sales Orders & Purchase Orders
│   ├── payments/               # Payment registration & receipt views
│   ├── portal/                 # Customer self-service portal & Razorpay checkout
│   ├── products/               # Product catalogue
│   ├── reports/                # Profit & Loss, Balance Sheet, Aging
│   ├── settings/               # System & gateway settings
│   └── stock/                  # Inventory & stock views
├── layouts/                    # App layouts (DashboardLayout & PortalLayout)
├── lib/                        # API client, HTTP interceptors & Razorpay helper
├── styles/                     # Global CSS stylesheets
├── types/                      # Shared TypeScript interface definitions
├── index.css                   # Core Tailwind and design tokens
└── main.tsx                    # React application root
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.x and **npm**
- Backend API running at `http://localhost:5000`

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Setup Environment Variables
Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `http://localhost:5000/api` | Base REST API URL pointing to the Express backend |

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the local Vite development server with Hot Module Replacement |
| `npm run build` | Type-check TypeScript and build optimized production assets |
| `npm run preview` | Locally preview the production build output |
