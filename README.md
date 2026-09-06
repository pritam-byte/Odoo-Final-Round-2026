# 🏢 Urban Furniture — Enterprise Accounting, ERP & Customer Portal Suite

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791.svg)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Gateway_Integrated-02042B.svg)](https://razorpay.com/)

An enterprise-grade, full-stack Accounting, ERP, and Customer Portal management suite tailored for modern business operations. Built with a high-performance **React + Vite** frontend, a scalable **Node.js + Express + TypeScript** backend, and a robust **PostgreSQL** database powered by **Prisma ORM**. Features automated double-entry ledger posting, real-time executive dashboards, budgeting with analytic distribution, and an interactive **Razorpay Payment Gateway with Dynamic UPI QR Code checkout**.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [💳 Razorpay Gateway & Dynamic UPI QR System](#-razorpay-gateway--dynamic-upi-qr-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Database GUI (Prisma Studio)](#3-database-gui-prisma-studio)
- [🧪 Zero-Money Testing & Gateway Sandbox](#-zero-money-testing--gateway-sandbox)
- [🔐 Default Demo Credentials](#-default-demo-credentials)
- [⚙️ Environment Variables Reference](#️-environment-variables-reference)
- [📡 Complete API Routes Reference](#-complete-api-routes-reference)
- [🔒 Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [📜 Available Scripts](#-available-scripts)

---

## ✨ Key Features

### 📊 1. Executive KPI Dashboard & Financial Insights
- **KPI Metrics**: Real-time aggregation of Total Revenue, Total Expenses, Net Margin %, Outstanding Receivables (Debtors), and Outstanding Payables (Creditors).
- **Interactive Visualizations**:
  - **Financial Trend Line Chart**: Monthly Revenue vs. Expenses with Net Margin trajectories.
  - **Operating Cash Flow Bar Chart**: Inflows vs. Outflows per period.
  - **Receivables Aging**: Overdue buckets (`Current`, `1-30 Days`, `31-60 Days`, `61-90 Days`, `90+ Days`).
  - **Departmental Budget Utilization**: Target vs. Actual expenditure tracking.
  - **Top Debtors Ranking**: Instant visibility of highest unpaid customer balances.
  - **Real-Time Audit Trail**: Chronological event logs of system-wide transactions.

### 💳 2. Razorpay Payment Gateway & Dynamic UPI QR Checkout
- **Multi-Method Online Checkout**:
  - **Dynamic UPI QR Code**: Live visual SVG QR code generated with standard `upi://pay` protocol, active countdown timer, popular UPI app icons (GPay, PhonePe, Paytm, BHIM), and a **One-Click Instant Scan Simulator** for testing.
  - **UPI VPA / ID**: Support for custom VPA addresses (e.g., `customer@okaxis`, `demo@upi`).
  - **Credit & Debit Cards**: Card checkout with test card autofill (`4111 1111 1111 1111`).
  - **NetBanking**: Integrated bank selection dropdown across major financial institutions.
- **Automated Settlement & Reconciliation**:
  - Server-side HMAC-SHA256 signature verification.
  - Webhook listener for external gateway confirmations.
  - Instant double-entry journal entry generation (`Bank (Dr)` / `Debtors (Cr)`).
  - Updates invoice/bill payment status to `PAID` or `PARTIAL` in real time.
- **Zero-Money Sandbox Mode**: Seamless testing without requiring real credit cards, bank accounts, or paid API keys.

### ⚖️ 3. Double-Entry Accounting Engine
- **Mathematical Integrity**: Enforces strict balance constraint on every journal entry:
  $$\sum \text{Debit} = \sum \text{Credit}$$
- **Automated Journal Mappings**:
  - **Customer Invoice Confirmation**: `Debtors (Dr)` / `Sales Income (Cr)`
  - **Vendor Bill Confirmation**: `Purchase Expense (Dr)` / `Creditors (Cr)`
  - **Payment Receipt**: `Bank or Cash (Dr)` / `Debtors (Cr)`
  - **Vendor Outgoing Payment**: `Creditors (Dr)` / `Bank or Cash (Cr)`
- **Full Chart of Accounts (COA)** & Specialized Journals (Sales, Purchase, Bank, Cash, General Operations).

### 🔄 4. Procurement & Sales Order Pipelines
- **Sales Flow**: Sales Quotation $\rightarrow$ Confirmed Sales Order (SO) $\rightarrow$ Customer Invoice $\rightarrow$ Payment Reconciliation.
- **Purchase Flow**: Request for Quotation $\rightarrow$ Confirmed Purchase Order (PO) with Budget Warning Check $\rightarrow$ Vendor Bill $\rightarrow$ Supplier Payment.
- **Multi-Line Item Pricing**: Dynamic subtotal, sales tax, unit cost, and discount computations.

### 🎯 5. Budgeting & Analytic Distribution
- **Analytic Cost Centers**: Link revenue and expense lines to departments or projects (e.g., *Manufacturing*, *Marketing*, *Showroom Logistics*).
- **Variance Tracking**: Real-time computation of **Achieved Amount**, **Achievement %**, and **Remaining Funds**.
- **Audit-Proof Revisions**: Creating a budget revision automatically archives the prior version as `REVISED` and establishes a linked revision tree.

### 📈 6. Real-Time Financial Statements
- **Profit & Loss (P&L)**: Aggregates posted income and operational expenses across any custom date range.
- **Balance Sheet**: Categorizes Assets, Liabilities, and Equity balances up to any target date.

### 👥 7. Self-Service Customer & Vendor Portal
- Secure client portal for customers to inspect their invoices, view order history, download payment receipts, and execute instant online payments via Razorpay.

### 🔐 8. Enterprise Authentication & Security
- **Role-Based Access Control (RBAC)**: Fine-grained permissions separating `ADMIN`, `ACCOUNTANT`, and `PORTAL_USER` roles.
- **Password Reset with 6-digit OTP**: Secure email delivery via Gmail SMTP (`nodemailer`) with local fallback mode.
- **User Management**: Administrative interface to create, update, and manage staff and portal accounts.

---

## 💳 Razorpay Gateway & Dynamic UPI QR System

The application features a built-in Razorpay payment workflow designed for high security and seamless testing:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Portal Customer
    participant UI as React Checkout Modal
    participant API as Express API Server
    participant Gateway as Razorpay / Sandbox Service
    participant Engine as Accounting Engine (Ledger)

    Customer->>UI: Clicks "Pay Now" on Outstanding Invoice
    UI->>API: POST /api/payments/razorpay/create-order
    API->>Gateway: Create Order (INR Amount, Receipt ID)
    Gateway-->>API: Returns { orderId, amount, currency, keyId }
    API-->>UI: Order Details & Checkout Configuration
    UI->>Customer: Displays Dynamic UPI QR, Card & NetBanking Options
    Customer->>UI: Scans QR / Enters Card & Confirms Payment
    UI->>API: POST /api/payments/razorpay/verify (Signature & Payment ID)
    API->>Gateway: Verify HMAC-SHA256 Signature
    Gateway-->>API: Signature Verified OK
    API->>Engine: Post Balanced Journal Entry (Bank Dr / Debtors Cr)
    API->>API: Mark Invoice as PAID & Generate Payment Record
    API-->>UI: Payment Success Confirmation
    UI->>Customer: Shows Payment Receipt & Updated Balance
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) with Hot Module Replacement (HMR)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Tailwind CSS & Vanilla CSS custom design tokens

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/) (v18+) & [Express 5](https://expressjs.com/)
- **Language**: TypeScript (strict mode)
- **ORM & DB Tooling**: [Prisma ORM 6](https://www.prisma.io/)
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt` password hashing
- **Email / OTP**: [Nodemailer](https://nodemailer.com/) (Gmail SMTP integration)
- **Validation**: [Zod](https://zod.dev/)

### Database
- **Database Engine**: [PostgreSQL 14+](https://www.postgresql.org/) (Local, Supabase, Neon, or Railway)

---

## 📁 Project Architecture & Directory Structure

```text
odoo-f/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Database migration history
│   │   ├── schema.prisma           # Prisma Data Models & Relations
│   │   └── seed.ts                 # Database seeding script (COA, Admin, Demo Data)
│   ├── src/
│   │   ├── config/
│   │   │   └── constants.ts        # App constants & environment loaders
│   │   ├── controllers/            # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── budget.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── master.controller.ts
│   │   │   ├── payment-gateway.controller.ts
│   │   │   ├── portal.controller.ts
│   │   │   ├── reporting.controller.ts
│   │   │   └── transaction.controller.ts
│   │   ├── lib/
│   │   │   └── prisma.ts           # Prisma Client singleton
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # JWT verification & RBAC guards
│   │   ├── routes/                 # Express sub-routers
│   │   │   ├── auth.routes.ts
│   │   │   ├── budget.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── master.routes.ts
│   │   │   ├── payment-gateway.routes.ts
│   │   │   ├── portal.routes.ts
│   │   │   ├── reporting.routes.ts
│   │   │   └── transaction.routes.ts
│   │   ├── services/               # Core business logic layer
│   │   │   ├── accounting.service.ts  # Double-entry ledger engine
│   │   │   ├── budget.service.ts      # Budget variance & revision engine
│   │   │   ├── mail.service.ts        # Nodemailer OTP email dispatch
│   │   │   ├── master.service.ts      # Master data management
│   │   │   ├── razorpay.service.ts    # Razorpay SDK & sandbox simulator
│   │   │   ├── reporting.service.ts   # P&L and Balance sheet computation
│   │   │   └── transaction.service.ts # Sales, purchase & invoice processing
│   │   └── server.ts               # Application entry point & middleware chain
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                    # Main app navigation & root views
│   │   ├── components/             # Reusable UI components & modals
│   │   ├── features/               # Modular business feature suites
│   │   │   ├── accounting/         # General ledger & journal views
│   │   │   ├── auth/               # Login, register, OTP reset & user management
│   │   │   ├── budgets/            # Budget planning & variance tracking
│   │   │   ├── contacts/           # Customer & vendor directory
│   │   │   ├── dashboard/          # Executive dashboard & Recharts widgets
│   │   │   ├── documents/          # Printable invoice & bill layouts
│   │   │   ├── journals/           # Accounting journal configuration
│   │   │   ├── orders/             # Sales & Purchase order pipelines
│   │   │   ├── payments/           # Staff payment registration & receipt views
│   │   │   ├── portal/             # Customer self-service portal & Razorpay checkout
│   │   │   ├── products/           # Product catalogue management
│   │   │   └── reports/            # P&L, Balance Sheet, and Trial Balance
│   │   ├── layouts/                # Staff dashboard & Portal layouts
│   │   ├── lib/                    # API client & Razorpay frontend helper
│   │   └── main.tsx                # Frontend application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
1. **[Node.js](https://nodejs.org/)** (v18.x or higher) and **npm**
2. **[PostgreSQL](https://www.postgresql.org/)** (v14+ running locally or hosted on Supabase / Neon / Railway)
3. **[Git](https://git-scm.com/)**

---

## 🚀 Quick Start Guide

### 1. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies (automatically runs `prisma generate`):
   ```bash
   npm install
   ```

3. Create your `backend/.env` file:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/odoo_db?schema=public"
   JWT_SECRET="hackathon_urban_furniture_super_secret_key"

   # (Optional) Razorpay Gateway Credentials — Leave empty to use Sandbox Simulation Mode
   RAZORPAY_KEY_ID=""
   RAZORPAY_KEY_SECRET=""
   RAZORPAY_WEBHOOK_SECRET=""

   # (Optional) Gmail SMTP Configuration for OTP Password Reset
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER=""
   SMTP_PASS=""
   ```

4. Push the database schema and seed default master data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   > 🚀 API will be running at `http://localhost:5000` (Health Check: `http://localhost:5000/health`).

---

### 2. Frontend Setup

1. Open a new terminal tab and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > 🌐 Open your browser and navigate to **`http://localhost:5173`**.

---

### 3. Database GUI (Prisma Studio)

To visually inspect and manage your PostgreSQL tables, relations, and records:
```bash
cd backend
npm run studio
```
> 🗄️ Prisma Studio will be accessible at **`http://localhost:5555`**.

---

## 🧪 Zero-Money Testing & Gateway Sandbox

You do **not** need a live Razorpay business account or real money to test the complete payment experience:

1. **Automatic Sandbox Mode**: When `RAZORPAY_KEY_ID` is empty or not configured in `.env`, the system automatically activates the **Sandbox Simulator**.
2. **UPI QR Code Flow**:
   - Log into the **Customer Portal** (`portal@urbanfurniture.com` / `Portal@1234`).
   - Go to **Invoices** and click **"Pay Online (Razorpay)"** or **"Pay Now"**.
   - The checkout modal opens with a live **Dynamic SVG UPI QR Code** and countdown timer.
   - Click the green **"⚡ Instant Scan & Pay (Test Mode)"** button.
   - The simulated payment is processed, signature verified, and double-entry ledger is updated automatically!
3. **Card Payment Flow**:
   - Select the **"Card"** tab in the checkout modal.
   - Click **"Use Test Card"** to autofill `4111 1111 1111 1111`.
   - Click **"Pay ₹..."** to simulate an immediate successful card authorization.

---

## 🔐 Default Demo Credentials

The database seed script (`backend/prisma/seed.ts`) automatically populates standard demo accounts:

| Role | Email / Login ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin01` / `admin@urbanfurniture.com` | `Admin@1234` | Full access to all ERP modules, settings & users |
| **Accountant** | `accountant01` / `accountant@urbanfurniture.com` | `Accountant@1234` | General ledger, transactions, orders & reports |
| **Portal User** | `portal@urbanfurniture.com` | `Portal@1234` | Customer self-service invoices, receipts & Razorpay checkout |

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Port number for Express server |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign and verify JWT authentication tokens |
| `RAZORPAY_KEY_ID` | No | `rzp_test_urbanfurniture` | Razorpay Key ID. Uses Sandbox Simulator if omitted. |
| `RAZORPAY_KEY_SECRET`| No | — | Razorpay Key Secret for HMAC-SHA256 signature verification |
| `RAZORPAY_WEBHOOK_SECRET`| No| — | Razorpay Webhook Secret for webhook signature validation |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP host for OTP password reset emails |
| `SMTP_PORT` | No | `587` | SMTP port (e.g., `587` for STARTTLS, `465` for SSL) |
| `SMTP_USER` | No | — | SMTP username / Gmail address |
| `SMTP_PASS` | No | — | SMTP password / Gmail App Password |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `http://localhost:5000/api` | Base URL pointing to backend REST API |

---

## 📡 Complete API Routes Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Request 6-digit OTP password reset email |
| `POST` | `/api/auth/verify-otp` | Public | Validate received OTP token |
| `POST` | `/api/auth/reset-password` | Public | Update password using verified OTP |
| `GET` | `/api/auth/users` | Admin | Retrieve all system users |
| `PUT` | `/api/auth/users/:id` | Admin | Update user details or role |
| `DELETE`| `/api/auth/users/:id` | Admin | Delete a user account |

### 📊 Executive Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Admin / Accountant | Revenue, expenses, net profit & debtor/creditor totals |
| `GET` | `/api/dashboard/financial-trend` | Admin / Accountant | Monthly revenue vs. expense historical trend |
| `GET` | `/api/dashboard/cash-flow` | Admin / Accountant | Operating cash inflows vs. outflows |
| `GET` | `/api/dashboard/receivables-aging` | Admin / Accountant | Receivables breakdown by aging brackets |
| `GET` | `/api/dashboard/budget-utilization` | Admin / Accountant | Departmental budget allocated vs. actual spend |
| `GET` | `/api/dashboard/top-debtors` | Admin / Accountant | Top debtors sorted by outstanding receivable balance |
| `GET` | `/api/dashboard/recent-activity` | Admin / Accountant | Real-time audit log of system events |

### 💳 Payment Gateway (`/api/payments/razorpay` & `/api/gateway`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments/razorpay/config` | Public | Fetch gateway mode (`test`/`live`) and Key ID |
| `POST` | `/api/payments/razorpay/create-order` | Authenticated | Create a Razorpay order for an invoice |
| `POST` | `/api/payments/razorpay/verify` | Authenticated | Verify signature and post balanced ledger entry |
| `POST` | `/api/payments/razorpay/webhook` | Public | Razorpay webhook listener for asynchronous event capture |

### 🏢 Master Data (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contacts` | Authenticated | List customers and vendors |
| `POST` | `/api/contacts` | Admin / Accountant | Create customer or vendor record |
| `GET` | `/api/products` | Authenticated | List product catalogue |
| `POST` | `/api/products` | Admin / Accountant | Create product or service item |
| `GET` | `/api/analytics` | Admin / Accountant | List analytic accounts (cost/revenue centers) |
| `POST` | `/api/analytics` | Admin / Accountant | Create analytic account |
| `GET` | `/api/accounts` | Admin / Accountant | Fetch Chart of Accounts list |
| `GET` | `/api/journals` | Admin / Accountant | Fetch configured Accounting Journals |

### 🔄 Transactions & Invoicing (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/purchase-orders` | Admin / Accountant | List purchase orders |
| `POST` | `/api/purchase-orders` | Admin / Accountant | Create draft purchase order |
| `POST` | `/api/purchase-orders/:id/confirm` | Admin / Accountant | Confirm PO with budget warning check |
| `GET` | `/api/vendor-bills` | Admin / Accountant | List vendor bills |
| `POST` | `/api/vendor-bills` | Admin / Accountant | Create vendor bill |
| `POST` | `/api/vendor-bills/:id/confirm` | Admin / Accountant | Confirm bill and post double-entry journal entry |
| `GET` | `/api/sales-orders` | Admin / Accountant | List sales orders |
| `POST` | `/api/sales-orders` | Admin / Accountant | Create draft sales order |
| `GET` | `/api/customer-invoices` | Admin / Accountant | List customer invoices |
| `POST` | `/api/customer-invoices` | Admin / Accountant | Create customer invoice |
| `POST` | `/api/customer-invoices/:id/confirm` | Admin / Accountant | Confirm invoice and post double-entry journal entry |
| `GET` | `/api/payments` | Authenticated | List payment transactions |
| `POST` | `/api/payments` | Authenticated | Register payment and auto-reconcile balance |
| `GET` | `/api/journal-entries` | Admin / Accountant | View posted balanced general ledger entries |

### 🎯 Budgets & Analytical Accounting (`/api/budgets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budgets` | Admin / Accountant | List budgets with real-time achieved and remaining balance |
| `POST` | `/api/budgets` | Admin / Accountant | Create budget linked to analytic account |
| `POST` | `/api/budgets/:id/confirm` | Admin / Accountant | Confirm / approve budget |
| `POST` | `/api/budgets/:id/cancel` | Admin / Accountant | Cancel budget |
| `POST` | `/api/budgets/:id/revise` | Admin / Accountant | Create budget revision (archives parent as `REVISED`) |

### 📈 Financial Reporting (`/api/reporting`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reporting/profit-and-loss` | Admin / Accountant | P&L Statement with Revenue, Expenses & Net Profit |
| `GET` | `/api/reporting/balance-sheet` | Admin / Accountant | Balance Sheet with Assets, Liabilities & Capital balances |

### 👥 Customer & Vendor Portal (`/api/portal`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portal/invoices` | Portal User / Admin | Fetch scoped customer invoices |
| `POST` | `/api/portal/invoices/:id/pay` | Portal User / Admin | Pay invoice with automated ledger reconciliation |
| `GET` | `/api/portal/bills` | Portal User / Admin | Fetch scoped vendor bills |
| `POST` | `/api/portal/bills/:id/pay` | Portal User / Admin | Settle vendor bill |
| `GET` | `/api/portal/payments` | Portal User / Admin | Fetch scoped payment history & receipts |

---

## 🔒 Role-Based Access Control (RBAC)

| Feature / Module | `ADMIN` | `ACCOUNTANT` | `PORTAL_USER` |
| :--- | :---: | :---: | :---: |
| **Executive KPI Dashboard & Charts** | ✅ | ✅ | ❌ |
| **User Management & Security** | ✅ | ❌ | ❌ |
| **Chart of Accounts & Journals Master** | ✅ | ✅ | ❌ |
| **Contacts & Product Catalogue** | ✅ Full CRUD | ✅ Full CRUD | 👁️ Read Only |
| **Sales & Purchase Order Workflows** | ✅ Full CRUD | ✅ Full CRUD | ❌ |
| **Invoicing & Vendor Bill Processing** | ✅ Full CRUD | ✅ Full CRUD | ❌ |
| **General Ledger & Journal Entries** | ✅ Full CRUD | ✅ Full CRUD | ❌ |
| **Budget Planning & Revisions** | ✅ Full CRUD | ✅ Full CRUD | ❌ |
| **Financial Statements (P&L, Balance Sheet)** | ✅ Full Access | ✅ Full Access | ❌ |
| **Customer Portal (Self-Service Invoices)** | ✅ | ❌ | ✅ (Scoped) |
| **Razorpay Online Payments & Dynamic UPI QR** | ✅ | ✅ | ✅ |

---

## 📜 Available Scripts

### Backend (`/backend`)
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Start development server with hot-reloading via `tsx watch` |
| `build` | `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `start` | `npm run start` | Run compiled production build from `dist/server.js` |
| `studio` | `npm run studio` | Launch Prisma Studio GUI at `http://localhost:5555` |
| `prisma:db:push` | `npx prisma db push` | Push schema changes directly to PostgreSQL |
| `prisma:db:seed` | `npx prisma db seed` | Populate database with accounts, journals, and demo users |

### Frontend (`/frontend`)
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Start Vite development server with HMR at `http://localhost:5173` |
| `build` | `npm run build` | Type-check and compile production-ready bundle |
| `preview` | `npm run preview` | Locally preview production build |

---

## 📄 License

This project is developed for the **Odoo Hackathon Final Round 2026** under the **ISC License**.
