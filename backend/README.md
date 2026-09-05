# Urban Furniture Accounting & ERP Backend API

A production-ready double-entry accounting and ERP backend built with **Node.js**, **Express 5**, **TypeScript**, and **Prisma ORM** with **PostgreSQL**.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
  - [1. Authentication](#1-authentication)
  - [2. Master Data](#2-master-data)
  - [3. Transaction Pipeline](#3-transaction-pipeline)
  - [4. Budgets & Analytical Accounting](#4-budgets--analytical-accounting)
  - [5. Financial Reporting](#5-financial-reporting)
  - [6. Customer Portal](#6-customer-portal)
- [Double-Entry Accounting Rules](#-double-entry-accounting-rules)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Scripts Reference](#-scripts-reference)

---

## 🚀 Architecture & Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express 5
- **Language**: TypeScript with strict mode
- **ORM & Database**: Prisma ORM 6 with PostgreSQL
- **Validation**: Zod
- **Security & Auth**: JWT (`jsonwebtoken`), Password Hashing (`bcrypt`), CORS
- **Dev Runner**: `tsx` (TypeScript Execute & Watch)

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Database schema & models
│   └── seed.ts                    # Initial seed (Accounts, Journals, Admin User)
├── src/
│   ├── config/
│   │   └── constants.ts           # Environment variables & constants
│   ├── controllers/               # Request & response handlers
│   │   ├── auth.controller.ts
│   │   ├── budget.controller.ts
│   │   ├── master.controller.ts
│   │   ├── portal.controller.ts
│   │   ├── reporting.controller.ts
│   │   └── transaction.controller.ts
│   ├── lib/
│   │   └── prisma.ts              # Prisma Client singleton
│   ├── middlewares/
│   │   └── auth.middleware.ts     # JWT authentication & RBAC authorization
│   ├── routes/                    # Express route definitions
│   │   ├── auth.routes.ts
│   │   ├── budget.routes.ts
│   │   ├── master.routes.ts
│   │   ├── portal.routes.ts
│   │   ├── reporting.routes.ts
│   │   └── transaction.routes.ts
│   ├── services/                  # Business & accounting logic
│   │   ├── accounting.service.ts  # Double-entry ledger journal entry engine
│   │   ├── budget.service.ts      # Budget calculations & revisions
│   │   ├── master.service.ts      # Contacts, Products, Analytics
│   │   ├── reporting.service.ts   # P&L and Balance Sheet aggregation
│   │   └── transaction.service.ts # PO, SO, Bills, Invoices, Payments
│   ├── validations/               # Zod request payload schemas
│   │   ├── auth.validation.ts
│   │   ├── budget.validation.ts
│   │   ├── master.validation.ts
│   │   └── transaction.validation.ts
│   └── server.ts                  # Application entry point
├── .env                           # Environment configuration
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** >= 18.x
- **PostgreSQL Database** running locally or in cloud (Supabase, Neon, AWS RDS, etc.)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/urban_furniture?schema=public"
JWT_SECRET="hackathon_urban_furniture_super_secret_key"
PORT=5000
```

---

## 🗄️ Database Migrations & Seeding

### 1. Push Schema to Database / Run Migration
```bash
# Push schema directly
npx prisma db push

# Or create a formal migration
npx prisma migrate dev --name init_schema
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Seed Master Data & Default Admin
```bash
npx prisma db seed
```
> **Default Admin Account:**
> - **Login ID**: `admin01`
> - **Password**: `Admin@1234`
> - **Role**: `ADMIN`

---

## 📡 API Documentation & Endpoints

All protected endpoints require the header:
```http
Authorization: Bearer <JWT_TOKEN>
```

### 1. Authentication
Base Path: `/api/auth`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`ADMIN`, `ACCOUNTANT`, `PORTAL_USER`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token (12h expiry) |

#### Sample Login Payload:
```json
{
  "loginId": "admin01",
  "password": "Admin@1234"
}
```

---

### 2. Master Data
Base Path: `/api` (Requires `ADMIN` or `ACCOUNTANT`)

| Method | Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contacts` | `?search=&type=CUSTOMER\|VENDOR\|BOTH` | List & filter contacts |
| `POST` | `/api/contacts` | `{ name, type, email, phone, address, city, state, pincode }` | Create contact |
| `GET` | `/api/products` | `?search=` | List all products / services |
| `POST` | `/api/products` | `{ name, category, salesPrice, cost, type: GOODS\|SERVICE\|COMBO }` | Create product |
| `GET` | `/api/analytics` | `?type=INCOME\|EXPENSE` | List analytic cost / revenue centers |
| `POST` | `/api/analytics` | `{ name, type: INCOME\|EXPENSE }` | Create analytic account |
| `GET` | `/api/accounts` | - | Lookup Chart of Accounts list |
| `GET` | `/api/journals` | - | Lookup Accounting Journals |

---

### 3. Transaction Pipeline
Base Path: `/api` (Requires `ADMIN` or `ACCOUNTANT`)

#### Purchase Flow:
- `POST /api/purchase-orders`: Create draft Purchase Order.
- `POST /api/purchase-orders/:id/confirm`: Confirm PO *(Performs non-blocking budget warning check)*.
- `POST /api/vendor-bills`: Create Vendor Bill linked to PO or standalone.
- `POST /api/vendor-bills/:id/confirm`: Confirms bill and **automatically generates balanced journal entry** (`Purchase Expense (Dr)` / `Creditors (Cr)`).

#### Sales Flow:
- `POST /api/sales-orders`: Create draft Sales Order.
- `POST /api/customer-invoices`: Create Customer Invoice linked to SO or standalone.
- `POST /api/customer-invoices/:id/confirm`: Confirms invoice and **automatically generates balanced journal entry** (`Debtors (Dr)` / `Sales Income (Cr)`).

#### Payment Flow:
- `POST /api/payments`: Register Send / Receive payment for Bill or Invoice.
  - Generates balanced payment Journal Entry.
  - Updates remaining `amountDue` and sets `paymentState` (`PARTIAL` or `PAID`).

---

### 4. Budgets & Analytical Accounting
Base Path: `/api/budgets` (Requires `ADMIN` or `ACCOUNTANT`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/budgets` | Fetch all budgets with computed **Achieved Amount**, **Achieved %**, and **Remaining** |
| `POST` | `/api/budgets` | Create a new budget linked to an Analytic account |
| `POST` | `/api/budgets/:id/confirm` | Confirm / approve budget |
| `POST` | `/api/budgets/:id/cancel` | Cancel budget |
| `POST` | `/api/budgets/:id/revise` | Revise budget amount (Archives previous as `REVISED` and creates linked child budget) |

---

### 5. Financial Reporting
Base Path: `/api/reporting` (Requires `ADMIN` or `ACCOUNTANT`)

| Method | Endpoint | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reporting/profit-and-loss` | `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Aggregates all posted Income vs Expense journal items to compute Net Profit / Loss |
| `GET` | `/api/reporting/balance-sheet` | `?asOfDate=YYYY-MM-DD` | Aggregates Assets, Liabilities, and Capital accounts up to a target date |

---

### 6. Customer Portal
Base Path: `/api/portal` (Requires `PORTAL_USER` or `ADMIN`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/portal/invoices` | Scoped invoices belonging only to the authenticated portal user's linked contact |
| `POST` | `/api/portal/invoices/:invoiceId/pay` | Self-service payment of invoice with automated balance reconciliation |

---

## ⚖️ Double-Entry Accounting Rules

The built-in `AccountingEngine` enforces strict accounting integrity:
1. **Zero-Imbalance Constraint**: A `JournalEntry` cannot be posted unless:
   $$\sum \text{Debit} = \sum \text{Credit}$$
2. **Automated Journal Mappings**:
   - **Vendor Bill Confirmation**:
     - `Purchase Expense` $\rightarrow$ **DEBIT**
     - `Creditors (Accounts Payable)` $\rightarrow$ **CREDIT**
   - **Customer Invoice Confirmation**:
     - `Debtors (Accounts Receivable)` $\rightarrow$ **DEBIT**
     - `Sales Income` $\rightarrow$ **CREDIT**
   - **Vendor Bill Payment (SEND)**:
     - `Creditors` $\rightarrow$ **DEBIT**
     - `Bank / Cash` $\rightarrow$ **CREDIT**
   - **Customer Invoice Payment (RECEIVE)**:
     - `Bank / Cash` $\rightarrow$ **DEBIT**
     - `Debtors` $\rightarrow$ **CREDIT**

---

## 🔒 Role-Based Access Control (RBAC)

| Feature Area | `ADMIN` | `ACCOUNTANT` | `PORTAL_USER` |
| :--- | :---: | :---: | :---: |
| User Management | ✅ | ❌ | ❌ |
| Master Data (Contacts, Products, COA) | ✅ | ✅ | ❌ |
| Transaction Operations (PO, SO, Bills, Invoices) | ✅ | ✅ | ❌ |
| Ledger & Journal Entries | ✅ | ✅ | ❌ |
| Budget Management & Revisions | ✅ | ✅ | ❌ |
| Financial Reports (P&L, Balance Sheet) | ✅ | ✅ | ❌ |
| Self-Service Portal Invoices & Payment | ✅ | ❌ | ✅ (Scoped to self) |

---

## 🛠️ Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Start development server with live reload via `tsx watch` |
| `build` | `npm run build` | Compile TypeScript source into `dist/` |
| `start` | `npm run start` | Run compiled production bundle with `node dist/server.js` |
| `prisma:generate` | `npx prisma generate` | Regenerate Prisma Client types |
| `prisma:seed` | `npx prisma db seed` | Seed default accounts, journals, and admin user |
| `prisma:studio` | `npx prisma studio` | Launch visual database GUI in browser |
