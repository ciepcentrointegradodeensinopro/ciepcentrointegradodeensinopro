-- Add turma field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS turma TEXT;
