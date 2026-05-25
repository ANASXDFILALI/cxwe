/*
  # Comprehensive FMCG Product Schema Update

  ## Changes:
  1. Adds brand and supplier tables
  2. Extends products table with full B2B FMCG attributes
  3. Adds media, pricing tiers, lots, and dimensions tables
  4. Adds proper RLS for all new tables
  5. Maintains backward compatibility with existing data

  ## New Tables:
  - brands: Brand information
  - suppliers: Supplier/vendor information
  - media: Centralized media management (photos, videos)
  - product_pricing_tiers: Price-quantity breakpoints
  - product_lots: Batch/lot tracking with expiry
  - Extends products with full specification fields
*/

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage brands" ON brands FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  contact_name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  country text DEFAULT '',
  description text DEFAULT '',
  logo_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active suppliers" ON suppliers FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Media table for centralized asset management
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_text text DEFAULT '',
  media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert media" ON media FOR INSERT TO authenticated WITH CHECK (true);

-- Price tiers for volume-based pricing
CREATE TABLE IF NOT EXISTS product_pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  min_quantity integer NOT NULL,
  price numeric(12,2) NOT NULL,
  currency text DEFAULT 'EUR',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS product_pricing_tiers_product_id_idx ON product_pricing_tiers(product_id);

CREATE POLICY "Anyone can view product pricing" ON product_pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage pricing" ON product_pricing_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Product lots / batches for inventory tracking
CREATE TABLE IF NOT EXISTS product_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  batch_number text UNIQUE NOT NULL,
  quantity integer NOT NULL,
  expiry_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_lots ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS product_lots_product_id_idx ON product_lots(product_id);

CREATE POLICY "Authenticated users can view lots" ON product_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage lots" ON product_lots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Extend products table with comprehensive B2B FMCG fields
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'marque_id') THEN
    ALTER TABLE products ADD COLUMN marque_id uuid REFERENCES brands(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fournisseur_id') THEN
    ALTER TABLE products ADD COLUMN fournisseur_id uuid REFERENCES suppliers(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ean') THEN
    ALTER TABLE products ADD COLUMN ean text UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'hs_code') THEN
    ALTER TABLE products ADD COLUMN hs_code text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sous_categories_ids') THEN
    ALTER TABLE products ADD COLUMN sous_categories_ids uuid[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'temperature') THEN
    ALTER TABLE products ADD COLUMN temperature text DEFAULT 'Ambiante' CHECK (temperature IN ('Ambiante', 'Réfrigéré', 'Frais', 'Surgelé'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'photos_unite') THEN
    ALTER TABLE products ADD COLUMN photos_unite uuid[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'photos_carton') THEN
    ALTER TABLE products ADD COLUMN photos_carton uuid[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'videos') THEN
    ALTER TABLE products ADD COLUMN videos uuid[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commande_min') THEN
    ALTER TABLE products ADD COLUMN commande_min integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colisage') THEN
    ALTER TABLE products ADD COLUMN colisage integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'palettisation') THEN
    ALTER TABLE products ADD COLUMN palettisation jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions_unite') THEN
    ALTER TABLE products ADD COLUMN dimensions_unite jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions_carton') THEN
    ALTER TABLE products ADD COLUMN dimensions_carton jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions_palette') THEN
    ALTER TABLE products ADD COLUMN dimensions_palette jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'devise') THEN
    ALTER TABLE products ADD COLUMN devise text DEFAULT 'EUR';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'incoterms_dispo') THEN
    ALTER TABLE products ADD COLUMN incoterms_dispo text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ingredients_texte') THEN
    ALTER TABLE products ADD COLUMN ingredients_texte text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ingredients_photo_id') THEN
    ALTER TABLE products ADD COLUMN ingredients_photo_id uuid REFERENCES media(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nutrition_texte') THEN
    ALTER TABLE products ADD COLUMN nutrition_texte text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nutrition_photo_id') THEN
    ALTER TABLE products ADD COLUMN nutrition_photo_id uuid REFERENCES media(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'allergenes') THEN
    ALTER TABLE products ADD COLUMN allergenes text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'regimes') THEN
    ALTER TABLE products ADD COLUMN regimes text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'duree_conservation') THEN
    ALTER TABLE products ADD COLUMN duree_conservation integer DEFAULT 365;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pays_origine') THEN
    ALTER TABLE products ADD COLUMN pays_origine text DEFAULT 'Morocco';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pays_export_autorises') THEN
    ALTER TABLE products ADD COLUMN pays_export_autorises text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'certifications') THEN
    ALTER TABLE products ADD COLUMN certifications text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'note_moyenne') THEN
    ALTER TABLE products ADD COLUMN note_moyenne numeric(3,2) DEFAULT 0 CHECK (note_moyenne >= 0 AND note_moyenne <= 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nb_avis') THEN
    ALTER TABLE products ADD COLUMN nb_avis integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN
    ALTER TABLE products ADD COLUMN is_new boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_promo') THEN
    ALTER TABLE products ADD COLUMN is_promo boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'est_sponsored') THEN
    ALTER TABLE products ADD COLUMN est_sponsored boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'statut') THEN
    ALTER TABLE products ADD COLUMN statut text DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'brouillon', 'archivé'));
  END IF;

END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS products_marque_id_idx ON products(marque_id);
CREATE INDEX IF NOT EXISTS products_fournisseur_id_idx ON products(fournisseur_id);
CREATE INDEX IF NOT EXISTS products_ean_idx ON products(ean);
CREATE INDEX IF NOT EXISTS products_statut_idx ON products(statut);
CREATE INDEX IF NOT EXISTS products_is_new_idx ON products(is_new);
CREATE INDEX IF NOT EXISTS products_is_promo_idx ON products(is_promo);
