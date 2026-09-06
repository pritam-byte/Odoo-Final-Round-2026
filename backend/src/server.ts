import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import masterRoutes from "./routes/master.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import reportingRoutes from "./routes/reporting.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import portalRoutes from "./routes/portal.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import paymentGatewayRoutes from "./routes/payment-gateway.routes.js";
import { PORT } from "./config/constants.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Specific and Portal/Gateway Routes first
app.use("/api/auth", authRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/payments/razorpay", paymentGatewayRoutes);
app.use("/api/gateway", paymentGatewayRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reporting", reportingRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);

// Master & General Transaction Routes
app.use("/api", masterRoutes);
app.use("/api", transactionRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Urban Furniture API" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Urban Furniture API" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});