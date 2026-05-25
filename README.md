# Morocco Food Export — B2B Export Catalogue

A full-stack B2B catalogue platform for exporting authentic Moroccan food products to international markets. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

---

## Features

### Public-facing
- **Home** — video hero with Moroccan geometric pattern overlays, stats, category grid, features section
- **Catalogue** — browse by category or by brand, with live search and slideshow previews on hover
- **Category page** — product grid with brand/supplier filters
- **Brand page** — all products for a given brand with category/supplier filters
- **Product detail** — full specifications: logistics dimensions, pricing tiers, certifications, nutritional info, allergens
- **Quote request** — 4-step proforma form (buyer identity → products → commercial terms → requirements) with product search by name, brand, or supplier
- **Partner / Collaborate** — 3-step form for producers who want to join the export network

### Admin panel (`/admin`)
- **Dashboard** — key metrics overview
- **Categories** — create, edit, reorder, toggle visibility
- **Products** — full CRUD with image upload, pricing tiers, dimensions, certifications
- **Brands** — manage brand profiles and logos
- **Suppliers / Wholesalers** — manage supplier directory
- **Quote requests** — view incoming proforma requests, generate `.docx` proforma invoice, respond by email or WhatsApp
- **Partnership requests** — manage producer collaboration submissions with status pipeline

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Document generation | `docx` + `file-saver` |
| Icons | Lucide React |
| Deployment | Netlify (configured) |

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx              # Fixed navbar with mobile hamburger menu
│   ├── Footer.tsx              # Footer with contact info and links
│   ├── CategoryCard.tsx        # Card with image slideshow on hover
│   ├── BrandCard.tsx           # Brand card with product slideshow on hover
│   ├── ProductCard.tsx         # Product card with quote CTA
│   └── admin/
│       └── ResponseModal.tsx   # Admin modal: generate .docx + email/WhatsApp response
├── pages/
│   ├── Home.tsx                # Landing page with video hero and Moroccan SVG patterns
│   ├── Catalog.tsx             # Category / Brand toggle catalogue view
│   ├── CategoryPage.tsx        # Products filtered by category
│   ├── BrandPage.tsx           # Products filtered by brand
│   ├── ProductDetail.tsx       # Full product specification page
│   ├── QuoteRequest.tsx        # 4-step proforma request form
│   ├── Partner.tsx             # Producer partnership application form
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminLayout.tsx
│       ├── Dashboard.tsx
│       ├── Categories.tsx
│       ├── Products.tsx
│       ├── Brands.tsx
│       ├── Suppliers.tsx
│       ├── Quotes.tsx
│       └── Partners.tsx
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── generateProforma.ts     # .docx proforma invoice generator
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── App.tsx                     # Route definitions
```

---

## Database Schema

All migrations are in `supabase/migrations/`. Apply them in order in the Supabase SQL editor.

### Tables

| Table | Description |
|---|---|
| `categories` | Product categories (name, slug, image, sort order) |
| `products` | Full product specs — dimensions, pricing tiers, certifications, allergens, logistics |
| `brands` | Brand profiles with logo |
| `suppliers` | Supplier / wholesaler directory |
| `product_pricing_tiers` | Quantity-price breakpoints per product |
| `product_lots` | Batch tracking with expiry dates |
| `quote_requests` | Incoming proforma requests from buyers |
| `collaboration_requests` | Producer partnership applications |

### Row Level Security

- **Public** — read active categories, products, brands, suppliers; insert quote/collaboration requests
- **Authenticated admins** — full CRUD on all tables

### Quote request fields

```
buyer identity        company_name, contact_name, email, phone, country
billing address       buyer_address, buyer_city, buyer_postal_code
delivery              delivery_address, delivery_country
products              products_interested (text), quantity_notes
commercial terms      incoterm, port_loading, port_destination, currency,
                      payment_terms, container_type, delivery_date, order_frequency
requirements          required_certifications[], labeling_requirements,
                      private_label, sample_request
```

### Collaboration request fields

```
company identity      company_name, contact_name, email, phone, country, city, website
product info          product_name, product_category, product_description,
                      annual_capacity, certifications[], packaging_types
export profile        already_exporting, current_markets, target_markets
status pipeline       new → contacted → en_discussion → partenaire → refusé
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/morocco-food-export.git
cd morocco-food-export
npm install
```

### 2. Configure environment variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these values in your Supabase dashboard under **Project Settings → API**.

### 3. Set up the database

Run the migrations in order in the Supabase **SQL Editor**:

1. `supabase/migrations/20260525011107_create_catalog_schema.sql`
2. `supabase/migrations/20260525022213_update_product_schema_comprehensive.sql`
3. `supabase/migrations/20260525_update_quote_requests_comprehensive.sql`
4. `supabase/migrations/20260525_create_collaboration_requests.sql`

### 4. Create an admin user

In Supabase → **Authentication → Users → Invite user**, add your admin email. This account is used to log in to `/admin`.

### 5. Add static assets

Place the following files in the `public/` directory:

| File | Description |
|---|---|
| `public/logo.png` | Circular brand logo (shown in navbar, footer, admin panel) |
| `public/hero.mp4` | Hero section background video |

### 6. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Deployment

### Netlify (recommended)

The `netlify.toml` at the project root is already configured with the correct build command and SPA redirect rule.

1. Push the repository to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Select your repository — Netlify auto-detects the config
4. Add environment variables under **Site settings → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

Add the same two environment variables in the Vercel dashboard.

### Manual build

```bash
npm run build      # outputs to dist/
npm run preview    # local preview of production build
```

---

## Admin Panel

Access at `/admin`. Log in with the Supabase Auth account created during setup.

### Quote workflow

1. Buyer submits the proforma form on `/quote`
2. Admin receives the request in `/admin/quotes`
3. Admin opens the response modal:
   - Downloads a pre-filled `.docx` proforma invoice
   - Sends a response via email (`mailto:`) or WhatsApp (`wa.me`)
4. Status updated: `new → in_review → responded → closed`

### Partnership workflow

1. Producer submits the form on `/partner`
2. Admin reviews in `/admin/partners`
3. Status pipeline: `new → contacted → en_discussion → partenaire → refusé`

---

## Contact

**Co-founder:** Anas Filali
- Email: [filalianas0001@gmail.com](mailto:filalianas0001@gmail.com)
- Phone: +212 605 268 946
- LinkedIn: [linkedin.com/in/anasfilali01](https://www.linkedin.com/in/anasfilali01/)

---

## License

Private — all rights reserved. Morocco Food Export.
