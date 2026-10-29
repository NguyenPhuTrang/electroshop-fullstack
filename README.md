# Electroshop

Electroshop is a full-stack e-commerce web application. Customers can browse products, manage a shopping cart and place orders. Administrators manage the store through a dedicated dashboard.

## Features

**Customer storefront**
- Browse and search the product catalog
- Filter by category, brand and price range; sort and paginate results
- View product images, variants, colors and technical specifications
- Add to cart with a fly-to-cart animation and a live cart badge
- Checkout flow and order tracking
- Product reviews
- Multi-language interface: English, Vietnamese and Traditional Chinese
- Responsive layout for mobile, tablet and desktop

**Admin dashboard**
- Metrics for users, products, orders, revenue, stock and reviews
- Product management: images, variants, colors and specifications
- Order management: search, filter, view details and update status
- User management: search and filter by role or account status
- Review management: filter by rating and reply to customers

## Tech Stack

| Frontend | Next.js, React, TypeScript, Tailwind CSS, Axios, next-intl, motion, Sonner |
| Backend | Node.js, TypeScript, Prisma ORM |


## Project Structure

```
frontend/
├── src/
│   ├── app/          # Pages and routes
│   ├── features/     # cart, product, order, review, user, brand, category
│   ├── hooks/        # Shared hooks
│   ├── i18n/         # Localization config
│   └── lib/          # API client and utilities
└── messages/         # Translation files

backend/
├── src/
│   ├── config/       # Configuration and Prisma setup
│   ├── services/     # Business logic
│   ├── validations/  # Input validation
│   └── utils/        # Utilities and error handling
└── prisma/           # Schema and migrations
```

## Getting Started

### Prerequisites

- Node.js (see `package.json` for the supported version)
- npm, pnpm or yarn
- A database supported by Prisma

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

### 2. Install dependencies

Run in both `frontend/` and `backend/`:

```bash
npm install
```

### 3. Configure environment variables

Backend (`backend/.env`):

```env
DATABASE_URL="<YOUR_DATABASE_CONNECTION_STRING>"
PORT=5000
```

Frontend (`frontend/.env.local`):

```env
BACKEND_URL="http://localhost:5000"
```

> Never commit real credentials. Never put secrets in `NEXT_PUBLIC_` variables.

### 4. Set up the database

From `backend/`:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the app

Start the backend and the frontend in two separate terminals:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Data Integrity

- Prices and stock are always calculated and checked on the backend
- Order creation uses database transactions
- Order status transitions are validated
- Users can only access their own orders (admins can access all)

## Roadmap

- [ ] Automated tests (unit, integration, end-to-end)
- [ ] API documentation
- [ ] Online payment gateway integration
- [ ] Production deployment guide

## Demo
Live demo: https://electroshop-fullstack.vercel.app/vi

Demo admin account (for testing only):
- Email: admin@gmail.com  
- Password: 123456
