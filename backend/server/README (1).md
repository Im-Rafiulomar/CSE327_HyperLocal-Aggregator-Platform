# HyperLocal API — Express + MongoDB

REST backend for the HyperLocal Aggregator Platform: JWT authentication with
refresh-token rotation, buyer and seller roles, catalogue, multi-vendor cart,
orders with tracking, reviews with fake-review detection, rewards and the
AI assistant / visual & voice search endpoints.

## Requirements

- Node.js 18+
- MongoDB 6+ running locally, or a MongoDB Atlas connection string

## Setup

```bash
cd server
cp .env.example .env      # then edit MONGO_URI and the two JWT secrets
npm install
npm run seed              # loads demo catalogue + demo accounts
npm run dev               # http://localhost:5000
```

Seeded logins (password `Password123`):

| Email | Role |
| --- | --- |
| buyer@hyperlocal.test | buyer |
| seller@hyperlocal.test | seller |

## Connecting the frontend

In the project root create `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

`src/lib/api.ts` is the typed client and `src/lib/auth.tsx` the auth context
(`useAuth()`); `/login` and `/register` are already wired to them. If the API
is not running, the UI falls back to the bundled mock data.

## Architecture

```text
server/src
├── index.js              Express app, security middleware, route mounting
├── config/db.js          Mongoose connection
├── models/               User, Seller, Product, Review, Cart, Order, Coupon, Notification
├── middleware/           auth (JWT + roles), validate (zod), error handler
├── services/             fakeReview, recommendations, assistant
├── routes/               *.routes.js — one router per resource
└── seed.js               demo data loader
```

## Security

- Passwords hashed with bcrypt (cost 12) and never selected by default.
- Short-lived access token (15m) in memory + rotating refresh token in an
  httpOnly cookie scoped to `/api/auth`.
- Roles read from the database, never from request bodies.
- Every body/query validated with zod; helmet, CORS allowlist and rate limits
  on all routes (stricter on `/api/auth`).
- Ownership checks on orders, reviews, addresses and seller resources.

## Endpoints

### Auth — `/api/auth`
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/register` | buyer or seller (creates the Seller profile) |
| POST | `/login` | returns access token + sets refresh cookie |
| POST | `/refresh` | rotates the refresh token |
| POST | `/logout` | revokes the refresh token |
| GET | `/me` | current user (auth) |

### Products — `/api/products`
`GET /` (q, category, maxPrice, minRating, localOnly, sort, page, limit) ·
`GET /categories` · `GET /recommendations` · `GET /:slug` (product + reviews +
AI summary) · `PATCH /:slug/offer` (seller)

### Reviews — `/api/reviews`
`POST /` (auth; scored by the fake-review detector) · `DELETE /:id`

### Cart — `/api/cart` (auth)
`GET /` · `POST /items` · `PATCH /items` · `DELETE /`

### Orders — `/api/orders` (auth)
`GET /` · `GET /:code` · `POST /checkout` (stock check, coin redemption, coin
earning, tracking timeline) · `PATCH /:code/status` (seller/admin)

### Users — `/api/users` (auth)
`PATCH /me` · addresses · wishlist · notifications

### Rewards — `/api/rewards`
`GET /coupons` · `GET /me` · `POST /redeem/:code`

### Sellers — `/api/sellers`
`GET /` · `GET /:slug` · `GET /me/dashboard` (metrics + AI insights) ·
`GET /me/orders`

### AI — `/api/ai`
`POST /assistant` · `POST /visual-search` · `POST /voice-search`
