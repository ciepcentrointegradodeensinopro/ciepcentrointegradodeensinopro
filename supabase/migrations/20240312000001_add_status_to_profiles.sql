-- Add status field to profiles
ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive'));
