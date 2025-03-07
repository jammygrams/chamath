-- Create people table for All-In podcast members
CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  wikipedia_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX idx_people_slug ON people(slug);

-- Insert the 4 All-In podcast members
INSERT INTO people (slug, name, full_name, wikipedia_url, image_url) VALUES
  ('chamath', 'Chamath', 'Chamath Palihapitiya', 'https://en.wikipedia.org/wiki/Chamath_Palihapitiya', '/chamath_cropped.png'),
  ('david', 'Sacks', 'David Sacks', 'https://en.wikipedia.org/wiki/David_O._Sacks', '/david_sacks.png'),
  ('jason', 'Jason', 'Jason Calacanis', 'https://en.wikipedia.org/wiki/Jason_Calacanis', '/jason_calacanis.png'),
  ('brad', 'Brad', 'Brad Gerstner', 'https://en.wikipedia.org/wiki/Brad_Gerstner', '/brad_gerstner.png'); 