-- White Lotus Group: Property Showcase & Inquiry Manager (PostgreSQL)
-- Idempotent: safe to run repeatedly via `npm run migrate`.
CREATE TABLE IF NOT EXISTS properties (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL CHECK (btrim(name) <> ''),
  location         VARCHAR(150) NOT NULL CHECK (btrim(location) <> ''),
  price            BIGINT       NOT NULL CHECK (price > 0),   -- INR, whole rupees
  size_sqft        INTEGER      NOT NULL CHECK (size_sqft > 0),
  bedrooms         INTEGER      NOT NULL CHECK (bedrooms >= 0),
  bathrooms        INTEGER      NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
  description      VARCHAR(300) NOT NULL CHECK (btrim(description) <> ''),
  long_description TEXT         NOT NULL DEFAULT '',
  images           TEXT[]       NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (location);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties (bedrooms);

CREATE TABLE IF NOT EXISTS inquiries (
  id          SERIAL PRIMARY KEY,
  property_id INTEGER      NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name        VARCHAR(120) NOT NULL CHECK (btrim(name) <> ''),
  email       VARCHAR(200) NOT NULL,
  phone       VARCHAR(30)  NOT NULL,
  message     TEXT         NOT NULL CHECK (btrim(message) <> ''),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries (property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at DESC);
