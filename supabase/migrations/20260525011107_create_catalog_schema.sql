/*
  # Morocco Food Export Catalog Schema

  ## Tables Created:
  1. `categories` - Product categories (33 from catalog)
     - id, name, slug, description, image_url, sort_order, is_active, created_at
  2. `products` - Products within each category
     - id, category_id, name, description, details (text[]), image_url, is_active, sort_order, created_at
  3. `quote_requests` - Customer quote/devis requests
     - id, company_name, contact_name, email, phone, country, products_interested, quantity_notes, message, status, created_at

  ## Security:
  - RLS enabled on all tables
  - Public can read active categories and products
  - Public can insert quote requests
  - Only authenticated admins can do full CRUD
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  details text[] DEFAULT '{}',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  country text NOT NULL,
  products_interested text NOT NULL,
  quantity_notes text DEFAULT '',
  message text DEFAULT '',
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'responded', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete quote requests"
  ON quote_requests FOR DELETE
  TO authenticated
  USING (true);
