import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import companyRoutes from "./routes/companies";
import contactRoutes from "./routes/contacts";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import inventoryRoutes from "./routes/inventory";
import workOrderRoutes from "./routes/workOrders";
import vendorRoutes from "./routes/vendors";
import purchaseOrderRoutes from "./routes/purchaseOrders";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import dispatchRoutes from "./routes/dispatches";
import dashboardRoutes from "./routes/dashboard";
import notificationRoutes from "./routes/notifications";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
