# Royalmart Backend API

A production-ready RESTful API for the Royalmart e-commerce platform built with Express.js, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT (httpOnly cookies)
- **Password Hashing:** bcrypt

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL installed and running locally

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Start development server
npm run dev
```

The server will start at `http://localhost:5000`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `PORT` | Server port | `5000` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |

## Project Structure

```
src/
├── config/
│   └── db.js              # Prisma client instance
├── middleware/
│   ├── auth.js            # JWT authentication & role guards
│   └── errorHandler.js    # Global error handler
├── modules/
│   ├── auth/              # Registration, login, logout, profile
│   ├── products/          # Product CRUD with filtering & pagination
│   ├── categories/        # Category management
│   ├── orders/            # Order placement & lifecycle
│   ├── reviews/           # Product reviews & ratings
│   ├── wishlist/          # User wishlist management
│   └── admin/             # Admin dashboard & management
├── app.js                 # Express app configuration
└── server.js              # Server entry point
```

## Database Schema

### Models

- **User** — Customer and admin accounts with role-based access
- **Product** — Store products with pricing, stock, and media
- **ProductVariant** — Size/color variants with individual stock tracking
- **Category** — Hierarchical product categories
- **Order** — Customer orders with status tracking
- **OrderItem** — Individual items within an order
- **Review** — Product ratings and comments
- **Wishlist** — User's saved products
- **Address** — Multiple saved shipping addresses per user

### Entity Relationships

```
User ──┬── Orders ──── OrderItems ──── Product
       ├── Reviews ────────────────── Product
       ├── Wishlist ───────────────── Product
       └── Addresses

Product ──┬── ProductVariants
          ├── Reviews
          └── Category
```

## API Reference

### Authentication

All protected routes require a valid JWT cookie (automatically set on login/register).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create new account |
| POST | `/api/auth/login` | No | Login and receive token |
| POST | `/api/auth/logout` | No | Clear auth cookie |
| GET | `/api/auth/profile` | Yes | Get current user profile |

**Register Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | List products (paginated) |
| GET | `/api/products/:id` | No | Get single product with reviews |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

**Query Parameters for listing:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `search` | string | Search by title |
| `category` | string | Filter by category slug (comma-separated) |
| `brand` | string | Filter by brand (comma-separated) |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sort` | string | `price_asc`, `price_desc`, or `rating` |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | List all categories with product count |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/customer` | Yes | Place a new order |
| GET | `/api/orders/my-orders` | Yes | Get user's order history |
| PATCH | `/api/orders/cancel/:orderNumber` | Yes | Cancel an order |
| DELETE | `/api/orders/remove/:orderNumber` | Yes | Remove order from history |
| PATCH | `/api/orders/status/:id` | Admin | Update order status |

**Place Order Request:**
```json
{
  "totalAmount": 1299.99,
  "paymentMethod": "cod",
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Dhaka",
    "area": "Mirpur"
  },
  "itemsSummary": "iPhone Case, USB Cable"
}
```

**Order Statuses:** `pending` → `confirmed` → `shipped` → `delivered` | `cancelled`

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/product/:productId` | No | Get reviews for a product |
| POST | `/api/reviews` | Yes | Add a review |

**Add Review Request:**
```json
{
  "productId": "uuid-here",
  "rating": 5,
  "comment": "Excellent product!"
}
```

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | Yes | Get user's wishlist |
| POST | `/api/wishlist/toggle` | Yes | Add/remove from wishlist |
| DELETE | `/api/wishlist/:productId` | Yes | Remove from wishlist |

### Admin

All admin routes require authentication with `ADMIN` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats (users, products, orders, revenue) |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| DELETE | `/api/admin/users/:id` | Delete a user |

## Payment Methods

| Code | Description |
|------|-------------|
| `cod` | Cash on Delivery |
| `bkash` | bKash Mobile Banking |
| `nagad` | Nagad Mobile Banking |
| `rocket` | Rocket Mobile Banking |
| `card` | Credit/Debit Card |
| `bank` | Bank Transfer |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (drops all data) |

## Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

Successful responses:

```json
{
  "success": true,
  "data": { ... }
}
```

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT stored in httpOnly cookies (not accessible via JavaScript)
- CORS configured for specific frontend origin
- Role-based access control (USER / ADMIN)
- Input validation on all endpoints

## License

MIT
