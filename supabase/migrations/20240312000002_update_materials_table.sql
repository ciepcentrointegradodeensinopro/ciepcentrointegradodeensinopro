-- Update materials table
ALTER TABLE materials ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive'));
ALTER TABLE materials ADD COLUMN discipline TEXT;
