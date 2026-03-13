-- Add file_url and barcode to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS barcode TEXT;
