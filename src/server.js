import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dns from "node:dns";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import clientRoutes from "./routes/client.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import invoiceDocumentRoutes from "./routes/invoiceDocument.routes.js";

import paymentRoutes from "./routes/payment.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

import { handleStripeWebhook } from "./controllers/subscriptionController.js";
import { authorize, protect } from "./middleware/auth.js";

import aiRoutes from "./routes/ai.routes.js";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

const app = express();

app.use(cors());

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(join(__dirname, "../uploads")));

app.use("/api", subscriptionRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoice-documents", invoiceDocumentRoutes);

app.use("/api/payments", paymentRoutes);

// مؤقتا لحد ما اعرف الدش بورد تخص مين
app.use(
  "/api/dashboard",
  protect,
  authorize("admin", "accountant"),
  dashboardRouter,
);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
