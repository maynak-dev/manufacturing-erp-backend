import {
  PrismaClient,
  UserRole,
  OrderStatus,
  WorkOrderStatus,
  PurchaseOrderStatus,
  InvoiceStatus,
  PaymentStatus,
  DispatchStatus,
  InventoryType,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ─── CLEANUP (safe re-run) ────────────────────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.dispatch.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.bOMItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Existing data cleared");

  // ─── USERS ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: { email: "admin@erp.com", password: passwordHash, name: "Arjun Sharma", role: UserRole.ADMIN },
    }),
    prisma.user.create({
      data: { email: "sales@erp.com", password: passwordHash, name: "Priya Mehta", role: UserRole.SALES },
    }),
    prisma.user.create({
      data: { email: "production@erp.com", password: passwordHash, name: "Ravi Kumar", role: UserRole.PRODUCTION },
    }),
    prisma.user.create({
      data: { email: "procurement@erp.com", password: passwordHash, name: "Sunita Patel", role: UserRole.PROCUREMENT },
    }),
    prisma.user.create({
      data: { email: "finance@erp.com", password: passwordHash, name: "Deepak Nair", role: UserRole.FINANCE },
    }),
  ]);
  console.log(`✅ ${users.length} users created`);

  // ─── COMPANIES ────────────────────────────────────────────────────────────
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Tata Industries Ltd",
        industry: "Manufacturing",
        gst: "27AABCT1332L1ZN",
        address: "24, Homi Mody Street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400001",
      },
    }),
    prisma.company.create({
      data: {
        name: "Infosys Solutions Pvt Ltd",
        industry: "IT Services",
        gst: "29AABCI1681G1ZX",
        address: "Electronics City",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        pincode: "560100",
      },
    }),
    prisma.company.create({
      data: {
        name: "Reliance Retail Ltd",
        industry: "Retail",
        gst: "24AAACR5055K1ZQ",
        address: "Maker Chambers IV",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400021",
      },
    }),
    prisma.company.create({
      data: {
        name: "Mahindra Logistics",
        industry: "Logistics",
        gst: "27AABCM3025F1ZH",
        address: "Gateway Building, Apollo Bunder",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400001",
      },
    }),
    prisma.company.create({
      data: {
        name: "Wipro Enterprises",
        industry: "Technology",
        gst: "29AABCW0720B1ZG",
        address: "Sarjapur Road",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        pincode: "560035",
      },
    }),
  ]);
  console.log(`✅ ${companies.length} companies created`);

  // ─── CONTACTS ─────────────────────────────────────────────────────────────
  const contacts = await Promise.all([
    prisma.contact.create({
      data: { name: "Rahul Desai", phone: "9876543210", email: "rahul.desai@tata.com", designation: "Purchase Manager", role: "Purchase Manager", companyId: companies[0].id },
    }),
    prisma.contact.create({
      data: { name: "Sneha Kapoor", phone: "9876543211", email: "sneha.k@tata.com", designation: "Finance Head", role: "Finance", companyId: companies[0].id },
    }),
    prisma.contact.create({
      data: { name: "Amit Verma", phone: "9876543212", email: "amit.v@infosys.com", designation: "Director", role: "Decision Maker", companyId: companies[1].id },
    }),
    prisma.contact.create({
      data: { name: "Neha Singh", phone: "9876543213", email: "neha.s@reliance.com", designation: "Procurement Lead", role: "Purchase Manager", companyId: companies[2].id },
    }),
    prisma.contact.create({
      data: { name: "Suresh Nambiar", phone: "9876543214", email: "suresh.n@mahindra.com", designation: "Operations Head", role: "Decision Maker", companyId: companies[3].id },
    }),
    prisma.contact.create({
      data: { name: "Pooja Iyer", phone: "9876543215", email: "pooja.i@wipro.com", designation: "Finance Manager", role: "Finance", companyId: companies[4].id },
    }),
  ]);
  console.log(`✅ ${contacts.length} contacts created`);

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: { name: "Industrial Pump A100", sku: "PUMP-A100", category: "Pumps", unit: "pcs", price: 45000, description: "Heavy-duty industrial water pump, 10HP" },
    }),
    prisma.product.create({
      data: { name: "Control Panel CP200", sku: "CP-200", category: "Electrical", unit: "pcs", price: 28000, description: "Automated control panel with PLC" },
    }),
    prisma.product.create({
      data: { name: "Steel Pipe 50mm", sku: "PIPE-50MM", category: "Pipes", unit: "mtr", price: 850, description: "Stainless steel pipe, 50mm diameter" },
    }),
    prisma.product.create({
      data: { name: "Conveyor Belt CB300", sku: "CB-300", category: "Conveyor", unit: "mtr", price: 3200, description: "Heavy-duty rubber conveyor belt, 300mm width" },
    }),
    prisma.product.create({
      data: { name: "Hydraulic Cylinder HC50", sku: "HC-50", category: "Hydraulics", unit: "pcs", price: 12500, description: "Double-acting hydraulic cylinder, 50 ton" },
    }),
    prisma.product.create({
      data: { name: "Electric Motor 5HP", sku: "MOTOR-5HP", category: "Motors", unit: "pcs", price: 18000, description: "Three-phase electric motor, 5HP, 1440RPM" },
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  // ─── BOM ITEMS ────────────────────────────────────────────────────────────
  await Promise.all([
    // Pump A100
    prisma.bOMItem.create({ data: { productId: products[0].id, materialName: "Cast Iron Casing", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[0].id, materialName: "Stainless Steel Impeller", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[0].id, materialName: "Bearing Set", quantity: 2, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[0].id, materialName: "Rubber Seal Kit", quantity: 1, unit: "set" } }),
    // Control Panel CP200
    prisma.bOMItem.create({ data: { productId: products[1].id, materialName: "Sheet Metal Enclosure", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[1].id, materialName: "PLC Module", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[1].id, materialName: "Circuit Breakers", quantity: 8, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[1].id, materialName: "Wiring Harness", quantity: 1, unit: "set" } }),
    // Hydraulic Cylinder HC50
    prisma.bOMItem.create({ data: { productId: products[4].id, materialName: "Chrome Steel Rod", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[4].id, materialName: "Hydraulic Seals", quantity: 4, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[4].id, materialName: "End Caps", quantity: 2, unit: "pcs" } }),
    // Electric Motor 5HP
    prisma.bOMItem.create({ data: { productId: products[5].id, materialName: "Copper Windings", quantity: 2.5, unit: "kg" } }),
    prisma.bOMItem.create({ data: { productId: products[5].id, materialName: "Rotor Assembly", quantity: 1, unit: "pcs" } }),
    prisma.bOMItem.create({ data: { productId: products[5].id, materialName: "Motor Bearing", quantity: 2, unit: "pcs" } }),
  ]);
  console.log("✅ BOM items created");

  // ─── INVENTORY ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.inventory.create({ data: { productId: products[0].id, type: InventoryType.FINISHED_GOOD, quantity: 15, warehouse: "WH-A", location: "Rack-A1", reorderLevel: 5 } }),
    prisma.inventory.create({ data: { productId: products[1].id, type: InventoryType.FINISHED_GOOD, quantity: 8,  warehouse: "WH-A", location: "Rack-B2", reorderLevel: 3 } }),
    prisma.inventory.create({ data: { productId: products[2].id, type: InventoryType.RAW_MATERIAL,  quantity: 500, warehouse: "WH-B", location: "Bay-C1",  reorderLevel: 100 } }),
    prisma.inventory.create({ data: { productId: products[3].id, type: InventoryType.FINISHED_GOOD, quantity: 200, warehouse: "WH-B", location: "Bay-D3",  reorderLevel: 50 } }),
    prisma.inventory.create({ data: { productId: products[4].id, type: InventoryType.FINISHED_GOOD, quantity: 12, warehouse: "WH-A", location: "Rack-E4", reorderLevel: 4 } }),
    prisma.inventory.create({ data: { productId: products[5].id, type: InventoryType.FINISHED_GOOD, quantity: 20, warehouse: "WH-A", location: "Rack-F1", reorderLevel: 5 } }),
    prisma.inventory.create({ data: { productId: products[0].id, type: InventoryType.WIP,           quantity: 3,  warehouse: "WH-PROD", location: "Floor-1", reorderLevel: 0 } }),
    // Low stock items to trigger alerts
    prisma.inventory.create({ data: { productId: products[1].id, type: InventoryType.RAW_MATERIAL,  quantity: 2,  warehouse: "WH-B", location: "Bay-A2",  reorderLevel: 10 } }),
    prisma.inventory.create({ data: { productId: products[4].id, type: InventoryType.RAW_MATERIAL,  quantity: 3,  warehouse: "WH-B", location: "Bay-B1",  reorderLevel: 8 } }),
  ]);
  console.log("✅ Inventory records created");

  // ─── VENDORS ──────────────────────────────────────────────────────────────
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { name: "Steel Craft Suppliers",   email: "orders@steelcraft.com",    phone: "9988776655", address: "MIDC, Pune",                           gst: "27AABCS4521K1ZM" } }),
    prisma.vendor.create({ data: { name: "Electro Components Ltd",  email: "sales@electrocomp.com",    phone: "9988776644", address: "Okhla Industrial Area, Delhi",          gst: "07AABCE3310F1ZP" } }),
    prisma.vendor.create({ data: { name: "Rubber & Seal India",     email: "info@rubberseals.in",      phone: "9988776633", address: "Thane, Maharashtra",                   gst: "27AABCR7842L1ZQ" } }),
    prisma.vendor.create({ data: { name: "Precision Hydraulics",    email: "contact@precisionhydro.com", phone: "9988776622", address: "Peenya Industrial Estate, Bengaluru", gst: "29AABCP6610B1ZR" } }),
  ]);
  console.log(`✅ ${vendors.length} vendors created`);

  // ─── PURCHASE ORDERS ──────────────────────────────────────────────────────
  const purchaseOrders = await Promise.all([
    prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2025-001",
        vendorId: vendors[0].id,
        status: PurchaseOrderStatus.RECEIVED,
        totalAmount: 125000,
        expectedDate: new Date("2025-02-15"),
        receivedDate: new Date("2025-02-13"),
        receivedQuantity: 50,
        notes: "Steel raw materials for Q1 production batch",
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2025-002",
        vendorId: vendors[1].id,
        status: PurchaseOrderStatus.ORDERED,
        totalAmount: 84000,
        expectedDate: new Date("2026-04-20"),
        notes: "PLC modules and circuit breakers for control panels",
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2025-003",
        vendorId: vendors[2].id,
        status: PurchaseOrderStatus.APPROVED,
        totalAmount: 32000,
        expectedDate: new Date("2026-04-10"),
        notes: "Seal kits and rubber components Q2 stock",
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2025-004",
        vendorId: vendors[3].id,
        status: PurchaseOrderStatus.DRAFT,
        totalAmount: 65000,
        expectedDate: new Date("2026-05-01"),
        notes: "Hydraulic components for HC-50 production run",
      },
    }),
  ]);
  console.log(`✅ ${purchaseOrders.length} purchase orders created`);

  // ─── ORDERS ───────────────────────────────────────────────────────────────
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "ORD-2025-001",
        companyId: companies[0].id,
        contactId: contacts[0].id,
        status: OrderStatus.DISPATCHED,
        deliveryDate: new Date("2025-03-10"),
        totalAmount: 225000,
        notes: "Urgent delivery required for plant commissioning",
        items: {
          create: [
            { productId: products[0].id, quantity: 3,  unitPrice: 45000, total: 135000 },
            { productId: products[5].id, quantity: 5,  unitPrice: 18000, total: 90000 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-2025-002",
        companyId: companies[1].id,
        contactId: contacts[2].id,
        status: OrderStatus.IN_PRODUCTION,
        deliveryDate: new Date("2026-04-30"),
        totalAmount: 274500,
        notes: "Data center infrastructure order",
        items: {
          create: [
            { productId: products[1].id, quantity: 5, unitPrice: 28000, total: 140000 },
            { productId: products[4].id, quantity: 5, unitPrice: 12500, total: 62500  },
            { productId: products[5].id, quantity: 4, unitPrice: 18000, total: 72000  },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-2025-003",
        companyId: companies[2].id,
        contactId: contacts[3].id,
        status: OrderStatus.COMPLETED,
        deliveryDate: new Date("2026-03-25"),
        totalAmount: 160000,
        notes: "Warehouse conveyor system upgrade",
        items: {
          create: [
            { productId: products[3].id, quantity: 50, unitPrice: 3200, total: 160000 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-2025-004",
        companyId: companies[3].id,
        contactId: contacts[4].id,
        status: OrderStatus.NEW,
        deliveryDate: new Date("2026-05-15"),
        totalAmount: 382950,
        notes: "Annual maintenance & new equipment supply",
        items: {
          create: [
            { productId: products[0].id, quantity: 5,   unitPrice: 45000, total: 225000 },
            { productId: products[4].id, quantity: 4,   unitPrice: 12500, total: 50000  },
            { productId: products[2].id, quantity: 127, unitPrice: 850,   total: 107950 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-2025-005",
        companyId: companies[4].id,
        contactId: contacts[5].id,
        status: OrderStatus.CANCELLED,
        deliveryDate: new Date("2026-03-01"),
        totalAmount: 56000,
        notes: "Cancelled due to budget freeze",
        items: {
          create: [
            { productId: products[1].id, quantity: 2, unitPrice: 28000, total: 56000 },
          ],
        },
      },
    }),
  ]);
  console.log(`✅ ${orders.length} orders with items created`);

  // ─── WORK ORDERS ──────────────────────────────────────────────────────────
  const workOrders = await Promise.all([
    prisma.workOrder.create({
      data: {
        workOrderNumber: "WO-2025-001",
        orderId: orders[0].id,
        productionUnit: "Unit-A Pump Assembly",
        status: WorkOrderStatus.COMPLETED,
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-03-05"),
        notes: "Completed ahead of schedule",
      },
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: "WO-2025-002",
        orderId: orders[1].id,
        productionUnit: "Unit-B Control Systems",
        status: WorkOrderStatus.IN_PROGRESS,
        startDate: new Date("2026-03-20"),
        notes: "Assembly of 5 control panels ongoing",
      },
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: "WO-2025-003",
        orderId: orders[2].id,
        productionUnit: "Unit-C Conveyor",
        status: WorkOrderStatus.COMPLETED,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-20"),
        notes: "Belt cutting and finishing done",
      },
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: "WO-2025-004",
        orderId: orders[3].id,
        productionUnit: "Unit-A Pump Assembly",
        status: WorkOrderStatus.PENDING,
        notes: "Awaiting raw material receipt from PO-2025-001",
      },
    }),
  ]);
  console.log(`✅ ${workOrders.length} work orders created`);

  // ─── INVOICES ─────────────────────────────────────────────────────────────
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-001",
        orderId: orders[0].id,
        status: InvoiceStatus.PAID,
        amount: 225000,
        dueDate: new Date("2025-04-10"),
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-002",
        orderId: orders[1].id,
        status: InvoiceStatus.SENT,
        amount: 140000,
        dueDate: new Date("2026-05-15"),
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-003",
        orderId: orders[2].id,
        status: InvoiceStatus.OVERDUE,
        amount: 160000,
        dueDate: new Date("2026-03-15"),
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-004",
        orderId: orders[3].id,
        status: InvoiceStatus.DRAFT,
        amount: 382950,
        dueDate: new Date("2026-06-01"),
      },
    }),
  ]);
  console.log(`✅ ${invoices.length} invoices created`);

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.payment.create({
      data: {
        invoiceId: invoices[0].id,
        amount: 112500,
        status: PaymentStatus.COMPLETED,
        method: "NEFT",
        reference: "NEFT2025031501",
        paidAt: new Date("2025-03-15"),
      },
    }),
    prisma.payment.create({
      data: {
        invoiceId: invoices[0].id,
        amount: 112500,
        status: PaymentStatus.COMPLETED,
        method: "NEFT",
        reference: "NEFT2025040201",
        paidAt: new Date("2025-04-02"),
      },
    }),
    prisma.payment.create({
      data: {
        invoiceId: invoices[1].id,
        amount: 70000,
        status: PaymentStatus.COMPLETED,
        method: "RTGS",
        reference: "RTGS2026040101",
        paidAt: new Date("2026-04-01"),
      },
    }),
    prisma.payment.create({
      data: {
        invoiceId: invoices[2].id,
        amount: 160000,
        status: PaymentStatus.PENDING,
        method: "Cheque",
        reference: "CHQ-887421",
      },
    }),
  ]);
  console.log("✅ Payments created");

  // ─── DISPATCHES ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.dispatch.create({
      data: {
        dispatchNumber: "DSP-2025-001",
        orderId: orders[0].id,
        status: DispatchStatus.DELIVERED,
        transportDetails: "Mahindra Logistics — Truck MH04-AB-1234",
        trackingNumber: "ML20250310001",
        dispatchDate: new Date("2025-03-08"),
        deliveryDate: new Date("2025-03-10"),
      },
    }),
    prisma.dispatch.create({
      data: {
        dispatchNumber: "DSP-2025-002",
        orderId: orders[2].id,
        status: DispatchStatus.DELIVERED,
        transportDetails: "Blue Dart Freight",
        trackingNumber: "BD26032025001",
        dispatchDate: new Date("2026-03-22"),
        deliveryDate: new Date("2026-03-25"),
      },
    }),
    prisma.dispatch.create({
      data: {
        dispatchNumber: "DSP-2025-003",
        orderId: orders[1].id,
        status: DispatchStatus.PREPARING,
        transportDetails: "Pending carrier assignment",
      },
    }),
  ]);
  console.log("✅ Dispatches created");

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.notification.create({ data: { userId: users[0].id, title: "New Order Received",    message: "Order ORD-2025-004 from Mahindra Logistics worth ₹3,82,950 has been placed.", isRead: false } }),
    prisma.notification.create({ data: { userId: users[1].id, title: "Invoice Overdue",       message: "Invoice INV-2025-003 for ₹1,60,000 is overdue. Follow up with Reliance Retail.", isRead: false } }),
    prisma.notification.create({ data: { userId: users[2].id, title: "Work Order Ready",      message: "Work order WO-2025-004 has been created and is pending your review.", isRead: true } }),
    prisma.notification.create({ data: { userId: users[3].id, title: "PO Awaiting Approval", message: "Purchase Order PO-2025-003 from Rubber & Seal India is awaiting your approval.", isRead: false } }),
    prisma.notification.create({ data: { userId: users[4].id, title: "Payment Received",      message: "Payment of ₹70,000 received for Invoice INV-2025-002 from Infosys Solutions.", isRead: true } }),
    prisma.notification.create({ data: { userId: users[0].id, title: "Low Stock Alert",       message: "2 inventory items have fallen below reorder level. Review required.", isRead: false } }),
  ]);
  console.log("✅ Notifications created");

  // ─── ACTIVITY LOGS ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.activityLog.create({ data: { userId: users[1].id, action: "CREATE", entity: "Order",         entityId: orders[3].id,         details: "Created order ORD-2025-004 for Mahindra Logistics" } }),
    prisma.activityLog.create({ data: { userId: users[0].id, action: "UPDATE", entity: "Order",         entityId: orders[0].id,         details: "Status changed from COMPLETED to DISPATCHED" } }),
    prisma.activityLog.create({ data: { userId: users[3].id, action: "CREATE", entity: "PurchaseOrder", entityId: purchaseOrders[3].id, details: "Draft PO-2025-004 created for Precision Hydraulics" } }),
    prisma.activityLog.create({ data: { userId: users[2].id, action: "UPDATE", entity: "WorkOrder",     entityId: workOrders[1].id,     details: "Status changed to IN_PROGRESS" } }),
    prisma.activityLog.create({ data: { userId: users[4].id, action: "CREATE", entity: "Payment",       details: "Recorded payment RTGS2026040101 for ₹70,000" } }),
    prisma.activityLog.create({ data: { userId: users[0].id, action: "CREATE", entity: "WorkOrder",     entityId: workOrders[3].id,     details: "Created WO-2025-004 for order ORD-2025-004" } }),
    prisma.activityLog.create({ data: { userId: users[1].id, action: "UPDATE", entity: "Invoice",       entityId: invoices[2].id,       details: "Invoice INV-2025-003 status changed to OVERDUE" } }),
  ]);
  console.log("✅ Activity logs created");

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login credentials (all use Password@123):");
  console.log("   admin@erp.com        → ADMIN");
  console.log("   sales@erp.com        → SALES");
  console.log("   production@erp.com   → PRODUCTION");
  console.log("   procurement@erp.com  → PROCUREMENT");
  console.log("   finance@erp.com      → FINANCE");
  console.log("\n📊 Seeded data summary:");
  console.log(`   Users:           ${users.length}`);
  console.log(`   Companies:       ${companies.length}`);
  console.log(`   Contacts:        ${contacts.length}`);
  console.log(`   Products:        ${products.length}`);
  console.log(`   Vendors:         ${vendors.length}`);
  console.log(`   Orders:          ${orders.length}`);
  console.log(`   Work Orders:     ${workOrders.length}`);
  console.log(`   Purchase Orders: ${purchaseOrders.length}`);
  console.log(`   Invoices:        ${invoices.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });