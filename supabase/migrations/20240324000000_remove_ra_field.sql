-- Remove RA field from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS ra;
