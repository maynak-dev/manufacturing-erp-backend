import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Middleware
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

// ── v1 routes (original flat routes — kept for backward compatibility) ──
import authRoutesV1 from "./routes/auth";
import companyRoutesV1 from "./routes/companies";
import contactRoutesV1 from "./routes/contacts";
import productRoutesV1 from "./routes/products";
import orderRoutesV1 from "./routes/orders";
import inventoryRoutesV1 from "./routes/inventory";
import workOrderRoutesV1 from "./routes/workOrders";
import vendorRoutesV1 from "./routes/vendors";
import purchaseOrderRoutesV1 from "./routes/purchaseOrders";
import invoiceRoutesV1 from "./routes/invoices";
import paymentRoutesV1 from "./routes/payments";
import dispatchRoutesV1 from "./routes/dispatches";
import dashboardRoutesV1 from "./routes/dashboard";
import notificationRoutesV1 from "./routes/notifications";

// ── v2 routes (controller + service architecture) ──
import authRoutesV2 from "./routes/v2/auth";
import companyRoutesV2 from "./routes/v2/companies";
import contactRoutesV2 from "./routes/v2/contacts";
import productRoutesV2 from "./routes/v2/products";
import orderRoutesV2 from "./routes/v2/orders";
import inventoryRoutesV2 from "./routes/v2/inventory";
import workOrderRoutesV2 from "./routes/v2/workOrders";
import vendorRoutesV2 from "./routes/v2/vendors";
import purchaseOrderRoutesV2 from "./routes/v2/purchaseOrders";
import invoiceRoutesV2 from "./routes/v2/invoices";
import paymentRoutesV2 from "./routes/v2/payments";
import dispatchRoutesV2 from "./routes/v2/dispatches";
import dashboardRoutesV2 from "./routes/v2/dashboard";
import notificationRoutesV2 from "./routes/v2/notifications";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ──
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(requestLogger);
app.use("/api", apiLimiter);

// ── v1 Routes (original — backward compatible) ──
app.use("/api/auth", authRoutesV1);
app.use("/api/companies", companyRoutesV1);
app.use("/api/contacts", contactRoutesV1);
app.use("/api/products", productRoutesV1);
app.use("/api/orders", orderRoutesV1);
app.use("/api/inventory", inventoryRoutesV1);
app.use("/api/work-orders", workOrderRoutesV1);
app.use("/api/vendors", vendorRoutesV1);
app.use("/api/purchase-orders", purchaseOrderRoutesV1);
app.use("/api/invoices", invoiceRoutesV1);
app.use("/api/payments", paymentRoutesV1);
app.use("/api/dispatches", dispatchRoutesV1);
app.use("/api/dashboard", dashboardRoutesV1);
app.use("/api/notifications", notificationRoutesV1);

// ── v2 Routes (controller/service architecture + activity logging) ──
app.use("/api/v2/auth", authRoutesV2);
app.use("/api/v2/companies", companyRoutesV2);
app.use("/api/v2/contacts", contactRoutesV2);
app.use("/api/v2/products", productRoutesV2);
app.use("/api/v2/orders", orderRoutesV2);
app.use("/api/v2/inventory", inventoryRoutesV2);
app.use("/api/v2/work-orders", workOrderRoutesV2);
app.use("/api/v2/vendors", vendorRoutesV2);
app.use("/api/v2/purchase-orders", purchaseOrderRoutesV2);
app.use("/api/v2/invoices", invoiceRoutesV2);
app.use("/api/v2/payments", paymentRoutesV2);
app.use("/api/v2/dispatches", dispatchRoutesV2);
app.use("/api/v2/dashboard", dashboardRoutesV2);
app.use("/api/v2/notifications", notificationRoutesV2);

// ── Health check ──
app.get("/api/health", (_, res) => res.json({ status: "ok", version: "2.0" }));

// ── 404 + Error handlers (must be last) ──
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
