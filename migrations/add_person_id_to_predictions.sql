-- Add person_id to predictions table
ALTER TABLE predictions ADD COLUMN person_id INTEGER REFERENCES people(id);

-- Set all existing predictions to Chamath (id=1)
UPDATE predictions SET person_id = 1;

-- Create index on person_id for faster joins
CREATE INDEX idx_predictions_person_id ON predictions(person_id); 