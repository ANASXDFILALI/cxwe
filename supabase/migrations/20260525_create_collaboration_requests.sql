/*
  # Collaboration / Partnership Requests
  Producers who want Redmac to export their products submit this form.
*/

CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company identity
  company_name   text NOT NULL,
  contact_name   text NOT NULL,
  email          text NOT NULL,
  phone          text DEFAULT '',
  country        text NOT NULL,
  city           text DEFAULT '',
  website        text DEFAULT '',

  -- Product info
  product_name        text NOT NULL,
  product_category    text DEFAULT '',
  product_description text DEFAULT '',
  annual_capacity     text DEFAULT '',   -- e.g. "500 tonnes / an"
  certifications      text[] DEFAULT '{}',
  packaging_types     text DEFAULT '',

  -- Export profile
  already_exporting   boolean DEFAULT false,
  current_markets     text DEFAULT '',   -- free text: "France, Espagne"
  target_markets      text DEFAULT '',

  -- Message
  message text DEFAULT '',

  -- Status & tracking
  status text DEFAULT 'new' CHECK (status IN ('new','contacted','en_discussion','partenaire','refusé')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit collaboration requests"
  ON collaboration_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage collaboration requests"
  ON collaboration_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS collab_status_idx ON collaboration_requests(status);
CREATE INDEX IF NOT EXISTS collab_created_idx ON collaboration_requests(created_at DESC);
