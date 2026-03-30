-- Add card_valid_until to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_valid_until TIMESTAMP WITH TIME ZONE;

-- Update existing profiles to have a validity of 30 days from creation
UPDATE profiles SET card_valid_until = created_at + INTERVAL '30 days' WHERE card_valid_until IS NULL;

-- Add policy for students to see their own activities if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' AND policyname = 'Users can view their own activities.'
    ) THEN
        CREATE POLICY "Users can view their own activities." ON activities
            FOR SELECT USING (
                (SELECT user_id FROM profiles WHERE id = student_id) = auth.uid() OR is_admin()
            );
    END IF;
END
$$;
