# MONO — Premium Streetwear E-Commerce Platform

A full-stack, database-driven e-commerce platform built for a premium streetwear brand. Editorial monochrome design system, secure admin panel, atomic order processing, size-specific inventory, coupon management, wishlist, reviews with moderation, order status timeline, real analytics, and an AI shopping assistant connected to live store data.

**[Live Demo](https://mono-ecommerce.vercel.app)** · **[API](https://mono-api.onrender.com/api/health)** · **[Screenshots](#screenshots)**

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database](#database)
- [Security](#security)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Design System](#design-system)
- [Known Limitations](#known-limitations)

---

## Overview

MONO is a complete e-commerce platform — not a landing page, not a UI mockup. Every feature is wired to a live PostgreSQL database with Row Level Security on every table. Business logic — pricing, stock validation, discount calculation, order totals — is enforced server-side, never trusted to the browser.

The storefront uses a dark, editorial monochrome aesthetic inspired by premium fashion publications: black backgrounds, off-white typography, thin 1px borders, sharp rectangular geometry with zero border-radius, and grayscale imagery that restores to color on interaction.

---

## Screenshots

> Add your screenshots here once deployed. Recommended: homepage, product detail, cart, admin dashboard, AI chatbot.

```
docs/screenshots/
├── 01-homepage.png
├── 02-product-detail.png
├── 03-cart.png
├── 04-admin-dashboard.png
└── 05-ai-chat.png
```

---

## Features

### Customer Storefront

- **Editorial homepage** — database-driven hero carousel, category grid, popular products, mission/vision sections, brand marquee, review feed, FAQ accordion
- **Product catalog** — category filters, price sorting, search, pagination
- **Product detail** — size selection with per-size stock, related products, reviews, image display
- **Search** — full-text search across product names
- **Responsive design** — mobile-first layout from 320px to wide desktop

### Cart & Checkout

- Persistent, database-backed cart tied to the authenticated user
- Size-aware cart lines — same product with different sizes stored as separate items
- Inline quantity editing and size change from cart page
- Server-side coupon validation with cart subtotal re-verification
- Atomic order creation via Postgres RPC with row locks

### Orders

- Order history with status badges
- Order detail with line items, sizes, and totals
- Order status timeline tracking every transition
- Cancelled orders shown as terminal branch without breaking the flow

### Account & Auth

- Email/password signup and login via Supabase Auth
- Session persistence across page reloads
- Protected routes for cart, profile, orders, wishlist
- Profile page with account details and order count

### Wishlist

- Save/unsave from product cards, product detail, and related products
- Dedicated wishlist page with compact horizontal layout
- Out-of-stock items remain visible with disabled actions
- Optimistic UI updates

### Reviews

- Authenticated users submit rating (1–5) and text
- One review per user per product enforced at DB level
- Default status `pending` — requires admin moderation
- Only approved reviews shown publicly

### AI Shopping Assistant

- Floating MONO AI button on storefront
- Backend-mediated chat via Groq's OpenAI-compatible API
- Function-calling architecture with 12 predefined server tools
- Can search products, check size/stock availability, view/edit cart, list orders
- Ownership enforced from JWT — never trusts client-supplied user IDs
- Rate limited to 15 messages/minute per IP

### Admin Panel

- Dedicated `/admin/login` — no public link
- Role verification via `profiles.role = 'admin'`
- 14 CRUD modules: Dashboard, Products, Categories, Sizes, Orders, Users, Reviews, Hero Slider, Why Choose Us, Brands, FAQs, Social Links, Mission & Vision, Coupons, Settings
- Mobile-responsive sidebar drawer with focus trap
- CSV export for user list

### Analytics Dashboard

- Real-time KPIs: net revenue, gross revenue, AOV, discount given, orders, users, low stock
- Revenue and orders chart with 7D / 30D / 90D / 1Y ranges
- Order status distribution
- Top products by units and revenue
- Category performance chart
- Low-stock alerts across products and sizes
- All metrics from real `orders` and `order_items` data

### Coupons

- Percentage and fixed-amount discount types
- Min order amount, max discount cap, start/expiry dates
- Total usage limit and per-user limit
- Server-authoritative validation via Postgres function
- Concurrency-safe with row locking
- Order snapshots preserve discount even if coupon is later modified

### Content Management

- Hero slider, mission/vision, why choose us, brands, FAQs, social links — all database-driven
- Image uploads to Supabase Storage
- Display ordering and active/inactive toggles per item

### SEO

- `react-helmet-async` for per-page titles, descriptions, canonical URLs, Open Graph
- JSON-LD structured data for Organization, Product, FAQPage
- `robots.txt` disallowing admin/cart/profile/auth routes
- Dynamic sitemap endpoint including all active products and categories

### Accessibility

- Skip-to-content links
- Focus trap in modals and mobile menus
- `aria-current`, `aria-expanded`, `aria-pressed`, `aria-busy`, `aria-live` on interactive elements
- Keyboard navigation throughout
- Reduced-motion media query honored

---

## Tech Stack

**Frontend**
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- Recharts (analytics charts)
- react-hook-form
- react-helmet-async
- Sonner (toasts)
- Zod (client-side validation)

**Backend**
- Node.js
- Express.js
- Zod (API validation)
- Helmet
- express-rate-limit

**Database & Services**
- Supabase
  - PostgreSQL 15
  - Supabase Auth
  - Supabase Storage
  - Row Level Security

**AI**
- Groq API (`openai/gpt-oss-120b` primary, `llama-3.3-70b-versatile` fallback)
- OpenAI Node SDK (used with Groq's OpenAI-compatible endpoint)

**Deployment**
- GitHub (source)
- Vercel (frontend)
- Render (backend)
- Supabase Cloud (database, auth, storage)

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                       CUSTOMER BROWSER                        │
│                                                               │
│  React SPA (Vite)                                             │
│  ├─ React Router (lazy-loaded routes)                         │
│  ├─ AuthContext, CartContext, WishlistContext                 │
│  ├─ Direct Supabase calls (RLS-protected data)                │
│  └─ Fetch calls to Express API (server-authoritative ops)     │
└───────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   SUPABASE           │              │   EXPRESS API            │
│                      │              │                          │
│  ├─ PostgreSQL       │              │  ├─ /api/orders          │
│  │   + RLS           │              │  ├─ /api/coupons/validate│
│  ├─ Auth             │              │  ├─ /api/sizes           │
│  ├─ Storage          │◄─────────────┤  ├─ /api/ai/chat         │
│  └─ Realtime         │   service    │  ├─ /api/products/:id/   │
│                      │   role       │  │   related             │
└──────────────────────┘              │  └─ /api/admin/analytics │
                                      │                          │
                                      │  Env:                    │
                                      │  ├─ SUPABASE_SERVICE_KEY │
                                      │  └─ GROQ_API_KEY         │
                                      └──────────────────────────┘
                                                  │
                                                  ▼
                                      ┌──────────────────────────┐
                                      │      GROQ API            │
                                      │  (AI function calling)   │
                                      └──────────────────────────┘
```

**Why two backends:** Supabase handles authentication, most CRUD, and storage because RLS enforces security at the data layer. Express handles operations that require server-side secrets (AI key), transactional guarantees (order creation), or heavy aggregation (analytics) — operations that would either leak secrets or be too slow if done client-side.

---

## Database

### Tables (20 total)

| Table | Purpose |
|---|---|
| `profiles` | User profile mirror of `auth.users` — name, email, role |
| `categories` | Product categories |
| `products` | Product catalog with pricing and stock |
| `sizes` | Size options (S, M, L, XL, etc.) |
| `product_sizes` | Product-size variants with per-size stock |
| `brands` | Brand logos for homepage marquee |
| `hero_slides` | Homepage hero carousel |
| `why_choose_us` | Homepage trust badges |
| `content_sections` | Mission, vision, and other editorial blocks |
| `reviews` | Product reviews with moderation status |
| `faqs` | Frequently asked questions |
| `social_links` | Footer social links |
| `cart_items` | Per-user cart (size-aware) |
| `orders` | Order headers with coupon snapshot |
| `order_items` | Order line items with price/name snapshot |
| `order_status_history` | Append-only order status log |
| `wishlist_items` | Per-user wishlist |
| `coupons` | Discount codes |
| `coupon_usages` | Coupon usage log per order |
| `storage.objects` | Supabase-managed file metadata |

### Key Relationships

```
profiles ─┬─► orders ─┬─► order_items ──► products ──► categories
          │           │                    │
          │           │                    └─► product_sizes ──► sizes
          │           │
          │           ├─► order_status_history (append-only)
          │           └─► coupon_usages ──► coupons
          │
          ├─► cart_items ──► products ──► sizes
          ├─► wishlist_items ──► products
          └─► reviews ──► products
```

### Critical Database Functions

- **`create_order_from_cart(user_id, coupon_code)`** — Atomically locks product rows with `SELECT ... FOR UPDATE`, validates stock, snapshots prices and names, decrements inventory, validates and applies coupon, records usage, clears cart. All in one transaction.

- **`validate_coupon(code, subtotal, user_id)`** — Checks existence, active status, date range, minimum order, usage limit, per-user limit. Returns discount amount capped by subtotal.

- **`log_order_created()`** and **`log_order_status_change()`** — Trigger functions that append to `order_status_history`.

- **`handle_new_user()`** — Trigger that creates a `profiles` row on signup.

- **`is_admin()`** — SECURITY DEFINER function used in RLS policies.

### Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `product-images` | Yes | Product photos |
| `category-images` | Yes | Category covers |
| `hero-images` | Yes | Homepage hero slides |
| `brand-images` | Yes | Brand logos |
| `profile-images` | No | User avatars (owner-scoped) |

---

## Security

### Row Level Security

Every table has RLS enabled. Policies fall into three groups:

- **Public read** — active content only (categories, products, brands, hero slides, FAQs, content sections, social links)
- **Owner-scoped** — authenticated users can only access their own cart, orders, wishlist, profile
- **Admin-only write** — `public.is_admin()` check on every content mutation

### Server-Side Authorization

- `requireAuth` middleware verifies the JWT and extracts `req.user`
- `requireAdmin` re-checks `profiles.role` on every admin endpoint
- No admin operation trusts the client to claim admin status

### Input Validation

- Zod schemas on every API endpoint (order creation, coupon validation, AI chat)
- Database `CHECK` constraints on email format, slug format, URL format, price/stock ranges
- File upload validation on MIME type and size

### Rate Limiting

- Global: 120 requests/min per IP
- Order creation: 10/min
- Coupon validation: 20/min
- AI chat: 15/min
- Auth endpoints: 10/min with `skipSuccessfulRequests`

### Order Integrity

- All prices, discounts, and totals computed server-side
- Frontend sends only product IDs, size IDs, quantities, and coupon codes
- `order_items` snapshots product name, size name, and unit price at purchase time
- Concurrent orders cannot oversell — row locks prevent simultaneous reads of the same stock

### AI Tool Sandboxing

- The AI can only call predefined server functions
- Every cart/order tool filters by `req.user.id` from the verified JWT
- No raw SQL, no arbitrary code execution
- System instruction forbids inventing prices, stock, or confirming orders without user confirmation

---

## Project Structure

```
mono-ecommerce/
├── client/                          # React SPA
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable primitives
│   │   │   ├── layout/              # Navbar, Footer, Layouts
│   │   │   ├── product/             # ProductCard, SizeSelector, etc.
│   │   │   ├── cart/                # CartLine, CartSummary
│   │   │   ├── order/               # OrderCard, OrderTimeline
│   │   │   ├── reviews/             # ReviewCard, ReviewForm
│   │   │   ├── wishlist/            # WishlistCard
│   │   │   ├── admin/               # ResourceManager, ResourceForm
│   │   │   ├── analytics/           # Chart components
│   │   │   ├── ai/                  # AIChatbot, ChatMessage
│   │   │   ├── home/                # Hero, WhyChooseUs, BrandStrip
│   │   │   ├── category/            # CategoryCard
│   │   │   ├── skeletons/           # Skeleton library
│   │   │   └── seo/                 # SEO component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   ├── hooks/
│   │   │   ├── useFocusTrap.js
│   │   │   └── useAdminResource.js
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   ├── api.js
│   │   │   ├── orders.js
│   │   │   ├── cart.js
│   │   │   ├── reviews.js
│   │   │   ├── wishlist.js
│   │   │   ├── coupons.js
│   │   │   ├── sizes.js
│   │   │   ├── analytics.js
│   │   │   ├── admin.js
│   │   │   └── ai.js
│   │   ├── pages/
│   │   │   ├── admin/               # 14 admin pages
│   │   │   └── *.jsx                # 16 public pages
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── config/
│   │   │   └── brand.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                          # Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── orders.js
│   │   │   ├── sizes.js
│   │   │   ├── coupons.js
│   │   │   ├── ai.js
│   │   │   ├── products.js
│   │   │   └── analytics.js
│   │   ├── services/
│   │   │   ├── gemini.js            # AI service (Groq-backed)
│   │   │   └── aiTools.js           # Tool definitions + executor
│   │   ├── schemas/
│   │   │   ├── orders.js
│   │   │   ├── sizes.js
│   │   │   ├── coupons.js
│   │   │   └── ai.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   └── rateLimit.js
│   │   ├── lib/
│   │   │   └── supabase.js          # Service-role client
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql
│       ├── 002_rls.sql
│       ├── 003_storage.sql
│       ├── ...
│       ├── 011_order_status_history.sql
│       ├── 012_wishlist.sql
│       ├── 013_coupons.sql
│       └── 014_analytics_indexes.sql
│
├── .gitignore
├── README.md
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account ([supabase.com](https://supabase.com))
- Groq API key ([console.groq.com/keys](https://console.groq.com/keys)) — free tier

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/mono-ecommerce.git
cd mono-ecommerce
```

### 2. Install

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Environment

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in both files — see [Environment Variables](#environment-variables).

### 4. Database

Run every migration in order in your Supabase SQL Editor — see [Database Setup](#database-setup).

### 5. Start

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

### 6. Create an admin account

1. Sign up at http://localhost:5173/signup using the email you want as admin
2. In Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

3. Sign in at http://localhost:5173/admin/login

---

## Environment Variables

### `client/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGci...` |
| `VITE_API_URL` | Backend API URL (no trailing slash) | `http://localhost:5000` |
| `VITE_ADMIN_EMAIL` | Admin email (used as a UI hint only) | `admin@example.com` |

### `server/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | API port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only**, bypasses RLS | `eyJhbGci...` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:5173` |
| `ADMIN_EMAIL` | Fallback admin email | `admin@example.com` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `AI_MODEL` | Primary AI model | `openai/gpt-oss-120b` |

**Never commit `.env` files.** They are `.gitignore`'d. Never put `SUPABASE_SERVICE_ROLE_KEY` or `GROQ_API_KEY` in the client.

---

## Database Setup

Run these migrations in Supabase SQL Editor **in order**:

```
001_schema.sql               — Tables, enums, indexes, triggers
002_rls.sql                  — Row Level Security policies
003_storage.sql              — Storage buckets + policies
004_orders.sql               — Atomic order creation RPC (updated later)
005_reviews.sql              — Review constraints
006_admin_bootstrap.sql      — Admin role bootstrap helper
007_hardening.sql            — Email/slug/URL CHECK constraints
008_content_sections.sql     — Mission/Vision content blocks
009_sizes.sql                — Sizes table + product_sizes
010_sizes_rls.sql            — Sizes RLS + default seed data
011_order_status_history.sql — Order status log + triggers
012_wishlist.sql             — Wishlist table + policies
013_coupons.sql              — Coupons + validation function + updated order RPC
014_analytics_indexes.sql    — Analytics performance indexes
```

To verify RLS is applied everywhere:

```sql
select tablename
from pg_tables
where schemaname = 'public' and rowsecurity = false;
```

Expected: zero rows.

---

## Available Scripts

### Client (`cd client`)

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |

### Server (`cd server`)

| Script | Purpose |
|---|---|
| `npm run dev` | Start with `--watch` (auto-restart) |
| `npm start` | Start production (used by Render) |

---

## API Reference

All endpoints under `/api`. Authenticated endpoints require `Authorization: Bearer <supabase-jwt>`.

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/sizes` | List active sizes |
| GET | `/api/sizes/product/:productId` | Sizes for a specific product |
| GET | `/api/products/:id/related?limit=4` | Related products |

### Customer (authenticated)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create order from cart (optional `coupon_code`) |
| GET | `/api/orders/:id` | Get own order |
| POST | `/api/coupons/validate` | Validate coupon against current cart |
| POST | `/api/ai/chat` | AI chat (rate limited) |

### Admin (authenticated + role = admin)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sizes/all` | All sizes including inactive |
| POST | `/api/sizes` | Create size |
| PATCH | `/api/sizes/:id` | Update size |
| DELETE | `/api/sizes/:id` | Delete size |
| PUT | `/api/sizes/product/:productId` | Set product sizes and stock |
| GET | `/api/admin/stats` | Legacy dashboard stats |
| GET | `/api/admin/analytics/overview?range=30d` | KPI overview |
| GET | `/api/admin/analytics/sales?range=30d` | Revenue/orders daily series |
| GET | `/api/admin/analytics/status?range=30d` | Orders by status |
| GET | `/api/admin/analytics/products?range=30d` | Top products |
| GET | `/api/admin/analytics/categories?range=30d` | Category performance |
| GET | `/api/admin/analytics/low-stock?threshold=5` | Low stock alerts |

### Error Responses

```json
{ "error": "AUTH_REQUIRED" }
{ "error": "FORBIDDEN" }
{ "error": "NOT_FOUND" }
{ "error": "INVALID_INPUT", "field": "email", "message": "..." }
{ "error": "RATE_LIMITED" }
{ "error": "AI_UNAVAILABLE" }
```

---

## Deployment

Full deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (or see the deployment section in your local notes).

**Quick summary:**

1. **GitHub** — push the repo. Ensure `.env` files are not tracked.
2. **Supabase** — run all migrations in production project. Verify RLS.
3. **Render** — create a Web Service:
   - Root directory: `server`
   - Build: `npm install`
   - Start: `npm start`
   - Add all `server/.env` variables (service role key, Groq key)
4. **Vercel** — create a project:
   - Root directory: `client`
   - Framework: Vite
   - Add all `client/.env` variables with `VITE_` prefix
   - Ensure `client/vercel.json` has the SPA rewrite rule
5. **Wire them up** — update `CORS_ORIGIN` on Render to the Vercel URL, update `VITE_API_URL` on Vercel to the Render URL.
6. **Test end-to-end** — signup, login, cart, order, admin panel, AI chat.

---

## Design System

### Color Palette

| Hex | Name | Usage |
|---|---|---|
| `#000000` | Primary Black | Main background |
| `#0A0A0A` | Deep Surface | Secondary areas |
| `#131313` | Dark Card | Product cards, modals |
| `#2E2C2C` | Charcoal | Borders, dividers |
| `#5F5F5E` | Dark Gray | Muted text |
| `#7F7B7A` | Medium Gray | Supporting text |
| `#B0AEB0` | Light Gray | Subtle highlights |
| `#D5D5D6` | Off White | Body text |
| `#F5F5F5` | White | Headings, CTAs |
| `#FFFFFF` | Pure White | High priority only |

The palette is strictly monochrome. No color accents, no gradients, no neon.

### Typography

- **Display:** Archivo (headings, editorial titles)
- **Body:** Inter (supporting text)

Headings use tight letter-spacing and uppercase treatment. Prices use tabular numerals for column alignment.

### Component Patterns

- Zero border-radius on interactive elements
- 1px borders using `#2E2C2C`
- Editorial numbered sequences (`01 / 02 / 03`)
- Thin rule lines above eyebrow text
- Grayscale-to-color hover reveal on images
- Bottom-slide hover bars on product cards
- Skeleton shimmer using `#131313` base and `#2E2C2C` highlight

---

## Known Limitations

- **No payment gateway.** Cash on delivery and bank transfer are the intended flows; no Stripe/JazzCash integration.
- **No transactional email.** Order confirmations, shipping updates, and password resets are not emailed. Supabase's default auth emails work for signup confirmation only.
- **AI free tier.** Groq's free tier is generous (1000+ requests/day) but not unlimited. Production traffic would need a paid plan.
- **Render cold starts.** The free tier spins down after 15 minutes idle. First request takes 30–60 seconds to wake up.
- **No tests.** Automated testing (Vitest unit tests, Playwright E2E) is planned but not yet implemented.
- **Single currency.** Prices stored and displayed in PKR only. Multi-currency would require exchange rate management.
- **No variant attributes beyond size.** Color, material, and other attributes are not yet modeled.
- **Coupon eligibility is cart-wide.** No per-product or per-category coupon restrictions.

---

## License

MIT

---

Built by [Muhammad Areesh Rashid](https://github.com/Areesh-dev/)
