# 🏢 Urban Furniture — Enterprise Accounting & ERP Backend Services

A scalable, production-ready double-entry accounting, ERP, and payment gateway backend built with **Node.js**, **Express 5**, **TypeScript**, and **Prisma ORM** with **PostgreSQL**.

---

## 📑 Table of Contents

- [🚀 Architecture & Tech Stack](#-architecture--tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Getting Started](#️-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [🗄️ Database Management & Prisma Studio](#️-database-management--prisma-studio)
- [💳 Razorpay Payment Gateway & Sandbox Engine](#-razorpay-payment-gateway--sandbox-engine)
- [📧 OTP Password Reset & Email Service](#-otp-password-reset--email-service)
- [⚖️ Double-Entry Accounting Engine Rules](#️-double-entry-accounting-engine-rules)
- [📡 Complete API Route Catalog](#-complete-api-route-catalog)
- [🔒 Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [🛠️ Scripts Reference](#️-scripts-reference)

---

## 🚀 Architecture & Tech Stack

- **Runtime**: Node.js (v18+)
- **Web Framework**: Express 5 (with native async error handling)
- **Language**: TypeScript (strict mode)
- **Database & ORM**: PostgreSQL with Prisma ORM 6
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt` password hashing
- **Payments**: Razorpay Node.js SDK & HMAC-SHA256 signature verification + Zero-Money Sandbox Simulator
- **Email / OTP**: Nodemailer with Gmail SMTP STARTTLS
- **Validation**: Zod request schema validation
- **Dev Runner**: `tsx watch` for hot-reloading

---

## 📁 Project Structure

```text
backend/
├── prisma/
│   ├── migrations/                 # Formal Prisma migration logs
│   ├── schema.prisma               # Prisma DB schema & relational models
│   └── seed.ts                     # Master data seeding script (Accounts, Journals, Admin)
├── src/
│   ├── config/
│   │   └── constants.ts            # Environment constants & defaults
│   ├── controllers/                # HTTP request & response handlers
│   │   ├── auth.controller.ts      # Login, registration, OTP reset & user management
│   │   ├── budget.controller.ts    # Budget creation, approval & revision
│   │   ├── dashboard.controller.ts # Executive KPI aggregates & trend charts
│   │   ├── master.controller.ts    # Contacts, products, COA, analytics
│   │   ├── payment-gateway.controller.ts # Razorpay order creation & HMAC verification
│   │   ├── portal.controller.ts    # Customer self-service invoices & payments
│   │   ├── reporting.controller.ts # Profit & Loss and Balance Sheet generation
│   │   └── transaction.controller.ts # PO, SO, Vendor Bills, Invoices, Payments
│   ├── lib/
│   │   └── prisma.ts               # Prisma Client singleton
│   ├── middlewares/
│   │   └── auth.middleware.ts      # JWT authentication & RBAC authorization
│   ├── routes/                     # Express route endpoints
│   │   ├── auth.routes.ts          # /api/auth/*
│   │   ├── budget.routes.ts        # /api/budgets/*
│   │   ├── dashboard.routes.ts     # /api/dashboard/*
│   │   ├── master.routes.ts        # /api/contacts, /api/products, etc.
│   │   ├── payment-gateway.routes.ts # /api/payments/razorpay/* & /api/gateway/*
│   │   ├── portal.routes.ts        # /api/portal/*
│   │   ├── reporting.routes.ts     # /api/reporting/*
│   │   └── transaction.routes.ts   # /api/purchase-orders, /api/customer-invoices, etc.
│   ├── services/                   # Core business & accounting logic
│   │   ├── accounting.service.ts   # Double-entry ledger journal entry engine
│   │   ├── budget.service.ts       # Budget variance, utilization & revision logic
│   │   ├── mail.service.ts         # Nodemailer OTP email dispatcher & fallback
│   │   ├── master.service.ts       # Contacts, products, analytics logic
│   │   ├── razorpay.service.ts     # Razorpay API client & zero-money simulator
│   │   ├── reporting.service.ts    # P&L and Balance Sheet aggregation algorithms
│   │   └── transaction.service.ts  # Transaction pipeline & invoice settlement
│   ├── validations/                # Zod schemas for payload validation
│   │   ├── auth.validation.ts
│   │   ├── budget.validation.ts
│   │   ├── master.validation.ts
│   │   └── transaction.validation.ts
│   └── server.ts                   # Application entry point & router mounting
├── .env                            # Environment variables (create from .env.example)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** >= 18.x
- **PostgreSQL Database** running locally or hosted on cloud (Supabase, Neon, AWS RDS, Railway)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urban_furniture?schema=public"
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

### 4. Database Setup & Seeding
```bash
# Push schema to database
npx prisma db push

# Seed master accounts, journals, and demo users
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
API server will start at `http://localhost:5000` (Health Check: `http://localhost:5000/health`).

---

## 🗄️ Database Management & Prisma Studio

The backend includes a visual web GUI for browsing, filtering, and modifying database records:

```bash
npm run studio
```
Access the interactive dashboard at **`http://localhost:5555`**.

---

## 💳 Razorpay Payment Gateway & Sandbox Engine

The `RazorpayService` (`src/services/razorpay.service.ts`) provides full payment processing:

1. **Live Mode**: When valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are provided, orders are created via the official Razorpay API and verified via HMAC-SHA256 signature matching.
2. **Sandbox Simulator**: When credentials are not provided or set to test mode:
   - Order creation generates a unique test `order_sim_...` identifier.
   - Dynamic SVG UPI QR codes are rendered with standard `upi://pay` protocol parameters.
   - One-click instant scan simulations and test card numbers (`4111 1111 1111 1111`) are accepted.
   - Ledger posting and invoice settlement execute identically to live mode.
3. **Double-Entry Reconciliation**:
   Upon verification of payment (whether live or simulated):
   - Generates a balanced `JournalEntry` under the **Bank Journal**:
     - **Debit**: Bank Account
     - **Credit**: Debtors Account (Accounts Receivable)
   - Deducts the paid amount from invoice `amountDue`.
   - Sets `paymentState` to `PAID` (or `PARTIAL`).

---

## 📧 OTP Password Reset & Email Service

The `MailService` (`src/services/mail.service.ts`) handles password recovery:
1. Generates a secure, time-limited 6-digit numeric OTP.
2. If `SMTP_USER` and `SMTP_PASS` are configured, dispatches an HTML email via Gmail SMTP with modern design tokens.
3. If SMTP is not configured, logs the OTP to the console/terminal for instant local testing.

---

## ⚖️ Double-Entry Accounting Engine Rules

The built-in `AccountingEngine` (`src/services/accounting.service.ts`) enforces strict financial consistency:

1. **Zero-Imbalance Constraint**:
   $$\sum \text{Debit} = \sum \text{Credit}$$
2. **Automated Journal Posting Rules**:
   - **Customer Invoice Confirmed**:
     - `Debtors (Accounts Receivable)` $\rightarrow$ **DEBIT**
     - `Sales Income` $\rightarrow$ **CREDIT**
   - **Vendor Bill Confirmed**:
     - `Purchase Expense` $\rightarrow$ **DEBIT**
     - `Creditors (Accounts Payable)` $\rightarrow$ **CREDIT**
   - **Customer Payment Received (Online / Razorpay / Cash)**:
     - `Bank / Cash Account` $\rightarrow$ **DEBIT**
     - `Debtors (Accounts Receivable)` $\rightarrow$ **CREDIT**
   - **Vendor Outgoing Payment Sent**:
     - `Creditors (Accounts Payable)` $\rightarrow$ **DEBIT**
     - `Bank / Cash Account` $\rightarrow$ **CREDIT**

---

## 📡 Complete API Route Catalog

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```

### 1. Authentication & Users (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Send 6-digit OTP password reset email |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP code |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified OTP |
| `GET` | `/api/auth/users` | Admin | List all registered system users |
| `POST` | `/api/auth/users` | Admin | Create user account directly |
| `PUT` | `/api/auth/users/:id` | Admin | Update user details or assign role |
| `DELETE`| `/api/auth/users/:id` | Admin | Remove user account |

### 2. Executive Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Admin, Accountant | Key metric KPIs (Revenue, Expenses, Net Margin, Receivables, Payables) |
| `GET` | `/api/dashboard/financial-trend` | Admin, Accountant | Monthly revenue vs. expense historical trend |
| `GET` | `/api/dashboard/cash-flow` | Admin, Accountant | Operating cash inflows vs. outflows |
| `GET` | `/api/dashboard/receivables-aging` | Admin, Accountant | Overdue aging buckets (Current, 1-30d, 31-60d, 61-90d, 90d+) |
| `GET` | `/api/dashboard/budget-utilization` | Admin, Accountant | Departmental budget utilization vs. actuals |
| `GET` | `/api/dashboard/top-debtors` | Admin, Accountant | Top customers ranked by outstanding balance |
| `GET` | `/api/dashboard/recent-activity` | Admin, Accountant | System-wide audit log of recent transactions |

### 3. Payment Gateway & Razorpay (`/api/payments/razorpay` & `/api/gateway`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments/razorpay/config` | Public | Get gateway mode (`test`/`live`) and Key ID |
| `POST` | `/api/payments/razorpay/create-order` | Authenticated | Create Razorpay order for an invoice |
| `POST` | `/api/payments/razorpay/verify` | Authenticated | Verify HMAC signature & post double-entry ledger |
| `POST` | `/api/payments/razorpay/webhook` | Public | Asynchronous webhook event receiver |

### 4. Master Data (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contacts` | Authenticated | List customers & vendors with filters |
| `POST` | `/api/contacts` | Admin, Accountant | Create customer or vendor |
| `GET` | `/api/products` | Authenticated | List product catalogue |
| `POST` | `/api/products` | Admin, Accountant | Create product or service item |
| `GET` | `/api/analytics` | Admin, Accountant | List analytic cost / revenue accounts |
| `POST` | `/api/analytics` | Admin, Accountant | Create analytic account |
| `GET` | `/api/accounts` | Admin, Accountant | Chart of Accounts listing |
| `GET` | `/api/journals` | Admin, Accountant | Configured Accounting Journals list |

### 5. Transactions & Invoicing (`/api`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/purchase-orders` | Admin, Accountant | List Purchase Orders |
| `POST` | `/api/purchase-orders` | Admin, Accountant | Create draft PO |
| `POST` | `/api/purchase-orders/:id/confirm` | Admin, Accountant | Confirm PO with budget warning check |
| `GET` | `/api/vendor-bills` | Admin, Accountant | List Vendor Bills |
| `POST` | `/api/vendor-bills` | Admin, Accountant | Create Vendor Bill |
| `POST` | `/api/vendor-bills/:id/confirm` | Admin, Accountant | Confirm bill and post balanced journal entry |
| `GET` | `/api/sales-orders` | Admin, Accountant | List Sales Orders |
| `POST` | `/api/sales-orders` | Admin, Accountant | Create draft Sales Order |
| `GET` | `/api/customer-invoices` | Admin, Accountant | List Customer Invoices |
| `POST` | `/api/customer-invoices` | Admin, Accountant | Create Customer Invoice |
| `POST` | `/api/customer-invoices/:id/confirm` | Admin, Accountant | Confirm invoice and post balanced journal entry |
| `GET` | `/api/payments` | Authenticated | List payment receipts |
| `POST` | `/api/payments` | Authenticated | Register payment and auto-reconcile invoice/bill |
| `GET` | `/api/journal-entries` | Admin, Accountant | General Ledger balanced journal entries |

### 6. Budgets & Analytical Accounting (`/api/budgets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/budgets` | Admin, Accountant | List all budgets with computed achieved amount & % |
| `POST` | `/api/budgets` | Admin, Accountant | Create a new analytic budget |
| `POST` | `/api/budgets/:id/confirm` | Admin, Accountant | Confirm / approve budget |
| `POST` | `/api/budgets/:id/cancel` | Admin, Accountant | Cancel budget |
| `POST` | `/api/budgets/:id/revise` | Admin, Accountant | Revise budget amount (archives prior as `REVISED`) |

### 7. Financial Reporting (`/api/reporting`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reporting/profit-and-loss` | Admin, Accountant | P&L Statement with Revenue, Expenses & Net Profit |
| `GET` | `/api/reporting/balance-sheet` | Admin, Accountant | Balance Sheet with Assets, Liabilities & Capital balances |

### 8. Customer & Vendor Portal (`/api/portal`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portal/invoices` | Portal User, Admin | Scoped invoices for linked customer contact |
| `POST` | `/api/portal/invoices/:id/pay` | Portal User, Admin | Pay invoice with automated ledger reconciliation |
| `GET` | `/api/portal/bills` | Portal User, Admin | Scoped vendor bills |
| `POST` | `/api/portal/bills/:id/pay` | Portal User, Admin | Settle vendor bill |
| `GET` | `/api/portal/payments` | Portal User, Admin | Scoped payment history and downloadable receipts |

---

## 🔒 Role-Based Access Control (RBAC)

| Resource / Endpoint Scope | `ADMIN` | `ACCOUNTANT` | `PORTAL_USER` |
| :--- | :---: | :---: | :---: |
| `/api/auth/users/*` (User Management) | ✅ | ❌ | ❌ |
| `/api/dashboard/*` (KPIs & Trends) | ✅ | ✅ | ❌ |
| `/api/accounts`, `/api/journals` | ✅ | ✅ | ❌ |
| `/api/contacts`, `/api/products` (Write) | ✅ | ✅ | ❌ |
| `/api/contacts`, `/api/products` (Read) | ✅ | ✅ | ✅ |
| `/api/purchase-orders/*`, `/api/vendor-bills/*` | ✅ | ✅ | ❌ |
| `/api/sales-orders/*`, `/api/customer-invoices/*` | ✅ | ✅ | ❌ |
| `/api/journal-entries` (General Ledger) | ✅ | ✅ | ❌ |
| `/api/budgets/*` (Budgets & Revisions) | ✅ | ✅ | ❌ |
| `/api/reporting/*` (P&L, Balance Sheet) | ✅ | ✅ | ❌ |
| `/api/portal/*` (Self-Service Lookup & Pay) | ✅ | ❌ | ✅ (Scoped) |
| `/api/payments/razorpay/*` (Gateway Pay) | ✅ | ✅ | ✅ |

---

## 🛠️ Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts development server with live watch using `tsx` |
| `npm run build` | Compiles TypeScript source to `dist/` |
| `npm start` | Runs compiled production server with `node dist/server.js` |
| `npm run studio` | Launches Prisma Studio visual database editor at `http://localhost:5555` |
| `npx prisma db push` | Synchronizes Prisma schema directly with PostgreSQL |
| `npx prisma db seed` | Executes initial seed script to create COA and demo accounts |
