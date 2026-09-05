# 🏢 Urban Furniture — Enterprise Accounting & ERP Suite

An enterprise-grade Accounting & ERP management suite tailored for modern business operations. Built with a high-performance **React + Vite** frontend, a scalable **Node.js + Express + TypeScript** backend, and a robust **PostgreSQL** database powered by **Prisma ORM**.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [🔐 Default Credentials](#-default-credentials)
- [⚙️ Environment Variables](#️-environment-variables)
- [📡 API Routes Overview](#-api-routes-overview)
- [📜 Available Scripts](#-available-scripts)

---

## ✨ Key Features

- **Double-Entry Accounting Engine**: Complete General Ledger, Chart of Accounts, and Journal management.
- **Order & Invoice Pipeline**:
  - **Sales**: Sales Orders $\rightarrow$ Customer Invoices $\rightarrow$ Payment Reconciliations.
  - **Purchases**: Purchase Orders $\rightarrow$ Vendor Bills $\rightarrow$ Outgoing Payments.
- **Budgeting & Analytic Distribution**: Multi-department budget planning, variance tracking, and revision workflows.
- **Financial Reporting**: Real-time automated **Profit & Loss (P&L)** statements and **Balance Sheet** generation.
- **Customer & Vendor Portal**: Dedicated self-service portal for clients and suppliers to track invoices, bills, and payment statuses.
- **Role-Based Access Control (RBAC)**: Fine-grained security for `ADMIN`, `ACCOUNTANT`, and `PORTAL_USER` roles with JWT authentication.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern, responsive CSS design system

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/) with TypeScript
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt` password hashing
- **Validation**: [Zod](https://zod.dev/)

### Database
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/)

---

## 📁 Project Structure

```text
odoo-f/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # Prisma migration history
│   │   ├── schema.prisma       # Prisma DB Schema
│   │   └── seed.ts             # Initial seeding script
│   ├── src/
│   │   ├── config/             # Environment constants
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middlewares/        # Auth & Role verification middlewares
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Reusable service layer
│   │   └── server.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/                # App root & navigation
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Modular feature views (accounting, sales, budgets, etc.)
│   │   ├── layouts/            # Dashboard & portal layouts
│   │   ├── lib/                # API client & helpers
│   │   └── main.tsx            # React application root
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

---

## 📋 Prerequisites

Before setting up, ensure you have:
1. **[Node.js](https://nodejs.org/)** (v18.x or higher) and **npm** installed.
2. **[PostgreSQL](https://www.postgresql.org/)** (v14+ running locally or hosted on Supabase / Neon / Railway).

---

## 🚀 Quick Start Guide

### 1. Backend Setup

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies (this also generates Prisma Client):
   ```bash
   npm install
   ```

3. Create your `.env` configuration file in `backend/`:
   ```bash
   # On Linux/macOS:
   touch .env
   # On Windows PowerShell:
   New-Item -ItemType File -Name .env
   ```

   Add the following values into `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>?schema=public"
   JWT_SECRET="hackathon_urban_furniture_super_secret_key"
   ```
   > 💡 *Replace `<user>`, `<password>`, and `<dbname>` with your actual PostgreSQL credentials.*

4. Push the schema to your database and seed initial data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will start at **http://localhost:5000** (Health check: `http://localhost:5000/health`).*

---

### 2. Frontend Setup

1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables by creating `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The web client will be accessible at **http://localhost:5173**.*

---

## 🔐 Default Credentials

The database seed script automatically creates an initial administrator account:

| Field | Value |
| :--- | :--- |
| **Login ID** | `admin01` |
| **Password** | `Admin@1234` |
| **Email** | `admin@urbanfurniture.com` |
| **Role** | `ADMIN` |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port number the backend server runs on | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/odoo_db?schema=public` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens | `your_secure_secret_key` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000/api` |

---

## 📡 API Routes Overview

| Base Path | Description | Access Level |
| :--- | :--- | :--- |
| `/api/auth` | Login, user registration, token verification | Public / Authenticated |
| `/api/contacts` | Vendor & Customer directory management | Admin / Accountant |
| `/api/products` | Product catalogue and pricing masters | Admin / Accountant |
| `/api/accounts` | Chart of Accounts listing & lookups | Admin / Accountant |
| `/api/journals` | Sales, Purchase, Bank & Cash journal configurations | Admin / Accountant |
| `/api/purchase-orders` | Purchase order creation & confirmation | Admin / Accountant |
| `/api/vendor-bills` | Vendor bill processing & post confirmation | Admin / Accountant |
| `/api/sales-orders` | Sales order processing pipeline | Admin / Accountant |
| `/api/customer-invoices` | Customer invoice generation & verification | Admin / Accountant |
| `/api/payments` | Payment receipts and supplier settlement | Admin / Accountant |
| `/api/budgets` | Budget planning, revisions, and approval cycles | Admin / Accountant |
| `/api/reporting` | Financial statements (`/profit-and-loss`, `/balance-sheet`) | Admin / Accountant |
| `/api/portal` | Client / Vendor self-service transaction lookup | Portal User / Admin |

---

## 📜 Available Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the TypeScript development server with hot-reloading (`tsx watch`).
- `npm run build`: Compiles TypeScript files into JavaScript in `dist/`.
- `npm start`: Runs the compiled server from `dist/server.js`.
- `npx prisma studio`: Launches interactive web UI to view and edit database tables.
- `npx prisma db seed`: Runs database seed script to populate default accounts and users.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server with Hot Module Replacement.
- `npm run build`: Type-checks and builds optimized production bundles.
- `npm run preview`: Previews the production build locally.
