-- SQL script to insert Sacks' 2023 predictions
-- Run this in the Supabase SQL editor

-- Temporarily disable RLS for the predictions table
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;

-- Insert Sacks' predictions for 2023
INSERT INTO predictions (content, category, prediction_date, evaluation_date, source, decision, person_id)
VALUES 
  ('Ron DeSantis will be the biggest political winner in 2023.', 'politics', '2023-01-01', '2023-12-31', '', NULL, 2),
  ('Nancy Pelosi will be the biggest political loser in 2023.', 'politics', '2023-01-01', '2023-12-31', '', NULL, 2),
  ('Rise of the Rest will be the biggest winner in business in 2023.', 'business', '2023-01-01', '2023-12-31', '', NULL, 2),
  ('Beneficiaries of government pumps will be the biggest loser in business in 2023.', 'business', '2023-01-01', '2023-12-31', '', NULL, 2),
  ('Strange new respect for Bill Clinton will be the most contrarian belief in 2023.', 'politics', '2023-01-01', '2023-12-31', '', NULL, 2),
  ('Series A Venture will be the best-performing asset in 2023.', 'business', '2023-01-01', '2023-12-31', '', NULL, 2);

-- Re-enable RLS for the predictions table
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Verify the insertions
SELECT * FROM predictions WHERE person_id = 2 AND prediction_date = '2023-01-01'; 