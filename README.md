# Manufacturing ERP - Backend

## Tech Stack
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update `DATABASE_URL`:
```bash
cp .env.example .env
```

3. Generate Prisma client & run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start dev server:
```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
4. Add build command: `npx prisma generate && tsc`
5. The `vercel.json` routes all `/api/*` to the serverless function

## API Endpoints

| Module | Endpoint |
|--------|----------|
| Auth | POST `/api/auth/register`, `/api/auth/login`, GET `/api/auth/me` |
| Companies | GET/POST `/api/companies`, GET/PUT/DELETE `/api/companies/:id` |
| Contacts | GET/POST `/api/contacts`, GET/PUT/DELETE `/api/contacts/:id` |
| Products | GET/POST `/api/products`, GET/PUT/DELETE `/api/products/:id` |
| Orders | GET/POST `/api/orders`, GET/PUT/DELETE `/api/orders/:id` |
| Inventory | GET/POST `/api/inventory`, PUT `/api/inventory/:id` |
| Work Orders | GET/POST `/api/work-orders`, PUT `/api/work-orders/:id` |
| Vendors | GET/POST `/api/vendors`, GET/PUT/DELETE `/api/vendors/:id` |
| Purchase Orders | GET/POST `/api/purchase-orders`, PUT `/api/purchase-orders/:id` |
| Invoices | GET/POST `/api/invoices`, PUT `/api/invoices/:id` |
| Payments | GET/POST `/api/payments` |
| Dispatches | GET/POST `/api/dispatches`, PUT `/api/dispatches/:id` |
| Dashboard | GET `/api/dashboard/stats` |
| Notifications | GET `/api/notifications`, PUT `/api/notifications/:id/read` |
