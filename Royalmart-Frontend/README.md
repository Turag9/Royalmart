# Royalmart Frontend

Modern React frontend for the Royalmart e-commerce platform. The app includes a customer shopping experience, authentication flow, cart, wishlist, checkout, order history, and an admin dashboard.

## Live Site

- Frontend: `https://royalmart-frontend.vercel.app`
- Backend API: `https://royalmart-backend.vercel.app/api`

## Features

- Responsive customer storefront
- Product browsing, search, category filtering, and pagination
- Cart and wishlist management
- Login, signup, protected profile, and order history
- Checkout and order success flow
- Admin login and protected dashboard
- Admin product, category, customer, order, analytics, and settings pages
- Toast notifications and reusable UI components

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- Recharts
- React Icons
- CSS
- Vercel Hosting

## Project Structure

```text
royal mart react/
|-- public/
|-- src/
|   |-- admin/                # Admin dashboard pages, layout, context, services
|   |-- assets/               # Images, data, and styles
|   |-- components/           # Shared customer-facing components
|   |-- hooks/                # Custom React hooks
|   |-- pages/                # Main customer pages
|   |-- store/                # Global store/context
|   |-- utils/                # API helpers, constants, and utilities
|   |-- App.jsx
|   `-- main.jsx
|-- package.json
|-- vercel.json
`-- vite.config.js
```

## Environment Variables

Create a `.env` file locally:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_BASE_URL=https://royalmart-backend.vercel.app/api
```

## Local Development

```bash
npm install
npm run dev
```

The app will run on:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev     # Start Vite development server
npm run build   # Build production assets
npm run preview # Preview production build locally
```

## Backend Connection

The frontend reads the API URL from `VITE_API_BASE_URL`. In production, this is configured to use:

```text
https://royalmart-backend.vercel.app/api
```

Authenticated requests use cookies, so the backend must allow the deployed frontend origin in `CORS_ORIGIN`.

## Deployment

The frontend is deployed to Vercel.

Recommended settings:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL`

The included `vercel.json` rewrites all routes to `index.html` so React Router pages work on refresh.
