# ShopCore

## Overview

ShopCore is an online store web application with separated admin and customer workflows. The project includes a
PostgreSQL-backed API, role-based access, and a web storefront.

## Features

### Auth

- User registration and login.
- Session refresh and logout.
- Role-based access for admin and user.

### Admin

- Dashboard with summary metrics.
- CRUD for categories, products, and suppliers.
- Delivery registration.
- Orders management.
- Shipment and payment status operations.
- Reports for sold products and top categories.

### Storefront

- Product catalog with search and category filter.
- Product details page.
- Cart stored in localStorage.
- Checkout and order creation.
- My orders page.
- Payment simulation.

## Tech stack

- Next.js
- TypeScript
- PostgreSQL
- Tailwind CSS
- next-intl
- React Query
- Zustand
- Formik/Yup
- Radix UI primitives
- lucide-react

## Architecture

```txt
src/app                      - page routes and route handlers
src/domains                  - client domains (auth/admin/store)
src/page-components          - page-level UI components
src/server                   - server services and repositories
src/shared                   - shared UI, API utilities, i18n, providers
scripts                      - local utility scripts (reset/seed)
```

## Database

Main entities:

- auth_users
- user_roles
- user_sessions
- customers
- categories
- products
- suppliers
- deliveries
- supply_item
- orders
- order_items
- payments
- shipment

Key business rules:

- A product must belong to a category.
- stock_quantity cannot be negative.
- Sales decrease stock.
- Deliveries increase stock.
- Order total is calculated from order_items.
- Duplicate payment for the same order is not allowed.
- An order cannot exist without customer and items.
- Operational dates are constrained by current_date.

## API

Main groups:

- /api/auth/\*\*
- /api/admin/\*\*
- /api/store/\*\*

Key endpoints:

- Auth: POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh, POST /api/auth/logout, GET
  /api/auth/session
- Admin: /api/admin/categories, /api/admin/products, /api/admin/suppliers, /api/admin/deliveries, /api/admin/orders,
  /api/admin/reports/\*
- Store: GET /api/store/categories, GET /api/store/products, GET /api/store/products/[productId], POST
  /api/store/orders, GET /api/store/orders, GET /api/store/orders/[orderId], POST /api/store/orders/[orderId]/payment

## Local setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

## Environment variables

Example .env.local:

```env
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
SHOPCORE_ADMIN_EMAIL=admin@example.com
SHOPCORE_ADMIN_PASSWORD=change-me
SHOPCORE_ADMIN_FULL_NAME=ShopCore Admin

# Optional: product images (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=shopcore/products
```

## Cloudinary

- Product images are uploaded manually by admin via Admin -> Products.
- The app supports one image per product (upload, replace, remove).
- If image is missing, UI fallback is shown.
- If Cloudinary variables are missing, image upload is disabled and existing image URLs still render.
- Automatic image loading from external sources is not used.

## Seed/reset

- Local DB reset/seed entrypoint is scripts/db-reset-seed.mjs.
- Database schema is reproducible from the current baseline schema file: db-migration/schema/shopcore_base_schema.sql.
- db:reset-seed creates only the admin auth account from SHOPCORE_ADMIN_EMAIL, SHOPCORE_ADMIN_PASSWORD,
  SHOPCORE_ADMIN_FULL_NAME.
- Regular user auth bootstrap is intentionally not created; users can register via UI.

Command:

```bash
SHOPCORE_ALLOW_DB_RESET=true npm run db:reset-seed
```

Safety notes:

- The script is destructive: it truncates ShopCore tables or recreates public schema when base schema exists.
- The script is blocked in production.
- For non-local DB host, explicit confirmation is required via SHOPCORE_ALLOW_REMOTE_DB_RESET=true.
- Use this script only in local/dev environments.

## Test accounts

`npm run db:reset-seed` creates the admin account from env variables only.

- Required:
  - SHOPCORE_ADMIN_EMAIL
  - SHOPCORE_ADMIN_PASSWORD
  - SHOPCORE_ADMIN_FULL_NAME
- No default regular user account is created automatically.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Note:

- The project uses next/font/google (Geist).
- In restricted network environments, build may fail due to external font fetching limits.

## Known limitations

- No real payment provider integration.
- Cart is frontend-only (state/localStorage), not persisted in DB.
- Payment is simulated through DB records.
- No reviews/favorites/coupons.
- One image per product.
