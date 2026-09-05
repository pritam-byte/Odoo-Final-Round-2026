import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import masterRoutes from "./routes/master.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import { PORT } from "./config/constants";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", masterRoutes);
app.use("/api", transactionRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Urban Furniture API" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});