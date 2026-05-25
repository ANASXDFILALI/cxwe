/*
  # Comprehensive Quote Request Schema Update
  Adds fields required to generate a formal international trade quotation
  following Incoterms 2020 and standard B2B export document norms.
*/

DO $$
BEGIN

  -- Buyer legal identity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='buyer_vat_number') THEN
    ALTER TABLE quote_requests ADD COLUMN buyer_vat_number text;
  END IF;

  -- Buyer full address
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='buyer_address') THEN
    ALTER TABLE quote_requests ADD COLUMN buyer_address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='buyer_city') THEN
    ALTER TABLE quote_requests ADD COLUMN buyer_city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='buyer_postal_code') THEN
    ALTER TABLE quote_requests ADD COLUMN buyer_postal_code text;
  END IF;

  -- Delivery address (if different)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='delivery_address') THEN
    ALTER TABLE quote_requests ADD COLUMN delivery_address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='delivery_country') THEN
    ALTER TABLE quote_requests ADD COLUMN delivery_country text;
  END IF;

  -- Commercial terms
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='incoterm') THEN
    ALTER TABLE quote_requests ADD COLUMN incoterm text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='port_loading') THEN
    ALTER TABLE quote_requests ADD COLUMN port_loading text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='port_destination') THEN
    ALTER TABLE quote_requests ADD COLUMN port_destination text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='currency') THEN
    ALTER TABLE quote_requests ADD COLUMN currency text DEFAULT 'EUR';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='payment_terms') THEN
    ALTER TABLE quote_requests ADD COLUMN payment_terms text;
  END IF;

  -- Logistics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='container_type') THEN
    ALTER TABLE quote_requests ADD COLUMN container_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='delivery_date') THEN
    ALTER TABLE quote_requests ADD COLUMN delivery_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='order_frequency') THEN
    ALTER TABLE quote_requests ADD COLUMN order_frequency text;
  END IF;

  -- Requirements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='required_certifications') THEN
    ALTER TABLE quote_requests ADD COLUMN required_certifications text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='labeling_requirements') THEN
    ALTER TABLE quote_requests ADD COLUMN labeling_requirements text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='private_label') THEN
    ALTER TABLE quote_requests ADD COLUMN private_label boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quote_requests' AND column_name='sample_request') THEN
    ALTER TABLE quote_requests ADD COLUMN sample_request boolean DEFAULT false;
  END IF;

END $$;

-- Index for faster admin queries
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests(created_at DESC);
