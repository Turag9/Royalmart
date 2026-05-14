# Royalmart Backend API

Production-ready REST API for the Royalmart e-commerce platform. The backend is built with Express, Prisma, PostgreSQL, JWT authentication, and role-based admin access.

## Live API

- Health check: `https://royalmart-backend.vercel.app/api/health`
- Base URL: `https://royalmart-backend.vercel.app/api`

## Features

- Customer registration, login, logout, and profile endpoints
- JWT authentication with secure HTTP-only cookies
- Admin role protection for dashboard and management routes
- Product, category, order, review, wishlist, user, and dashboard modules
- PostgreSQL schema managed through Prisma migrations
- Production CORS configuration for the deployed frontend

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens
- bcrypt
- Vercel Serverless Functions

## Project Structure

```text
Royalmart-Backend/
|-- api/
|   `-- index.js              # Vercel serverless entry point
|-- prisma/
|   |-- migrations/           # Database migrations
|   `-- schema.prisma         # Database schema
|-- src/
|   |-- config/               # Prisma client
|   |-- middleware/           # Auth and error middleware
|   |-- modules/              # Feature modules
|   |-- app.js                # Express app setup
|   `-- server.js             # Local server entry point
|-- package.json
`-- vercel.json
```

## Environment Variables

Create a `.env` file locally:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/royalmart?schema=public"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
```

For production, set these in the hosting dashboard:

```env
DATABASE_URL="your-production-postgres-url"
JWT_SECRET="your-production-jwt-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://royalmart-frontend.vercel.app"
NODE_ENV="production"
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are only required when running `npm run db:seed`.

## Local Development

```bash
npm install
npm run db:migrate
npm run dev
```

The API will run on:

```text
http://localhost:5000/api
```

## Available Scripts

```bash
npm run dev        # Start local development server
npm run build      # Generate Prisma client
npm start          # Run migrations and start production server
npm run db:migrate # Create/apply local migrations
npm run db:seed    # Seed sample data
npm run db:reset   # Reset local database
```

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| POST | `/api/auth/register` | Create a customer account |
| POST | `/api/auth/login` | Login and set auth cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/profile` | Get current authenticated user |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get product details |
| GET | `/api/categories` | List categories |
| POST | `/api/orders/customer` | Place an order |
| GET | `/api/orders/my-orders` | Get customer orders |
| GET | `/api/wishlist` | Get customer wishlist |
| GET | `/api/dashboard` | Admin dashboard data |

## Deployment

The backend is deployed to Vercel as a Node serverless function.

Important deployment files:

- `api/index.js` exports the Express app for Vercel.
- `vercel.json` routes all requests to the serverless API entry.
- `postinstall` runs `prisma generate` so the Prisma client is available in the deployed bundle.

## Security Notes

- Do not commit `.env`, `.env.local`, `.vercel`, or database credentials.
- Use a long random value for `JWT_SECRET`.
- Keep `CORS_ORIGIN` limited to the production frontend URL.
