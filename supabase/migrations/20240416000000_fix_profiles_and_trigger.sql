-- Fix trigger function (ensure it works now that all columns exist)
-- The original trigger function likely failed because 'turma' column didn't exist yet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, course, turma, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'turma',
    COALESCE(new.raw_user_meta_data->>'status', 'pending')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill profiles for existing users who might have missed the trigger
INSERT INTO public.profiles (user_id, full_name, email, role, course, turma, status)
SELECT 
    id, 
    raw_user_meta_data->>'full_name', 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'student'),
    raw_user_meta_data->>'course',
    raw_user_meta_data->>'turma',
    COALESCE(raw_user_meta_data->>'status', 'pending')
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Fix RLS Policies
-- First, ensure SELECT is enabled for everyone (or at least admins)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

-- Ensure admins have full access
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR 
    (auth.jwt() ->> 'email' IN ('ciepcentrointegradodeensinopro@gmail.com', 'test@gmail.com'))
  );

-- Superadmin explicit bypass
DROP POLICY IF EXISTS "Superadmin full access" ON profiles;
CREATE POLICY "Superadmin full access" ON profiles
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'ciepcentrointegradodeensinopro@gmail.com'
  );
