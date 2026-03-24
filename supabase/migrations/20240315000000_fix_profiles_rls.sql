-- Update is_admin function to be more robust and handle potential JWT issues
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user ID
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get email from JWT (try different paths just in case)
  user_email := COALESCE(
    auth.jwt() ->> 'email',
    auth.jwt() -> 'claims' ->> 'email',
    auth.jwt() -> 'user_metadata' ->> 'email'
  );
  
  -- Check hardcoded admin email first (most reliable for bootstrapping)
  -- We also check the test email
  IF user_email IN ('ciepcentrointegradodeensinopro@gmail.com', 'test@gmail.com') THEN
    RETURN TRUE;
  END IF;

  -- Check profile role in database
  -- Using SECURITY DEFINER to bypass RLS for this check
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply policies to ensure they use the updated function
-- We use DROP and CREATE to be sure
DROP POLICY IF EXISTS "Admins can insert any profile." ON profiles;
CREATE POLICY "Admins can insert any profile." ON profiles
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update any profile." ON profiles;
CREATE POLICY "Admins can update any profile." ON profiles
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete any profile." ON profiles;
CREATE POLICY "Admins can delete any profile." ON profiles
  FOR DELETE USING (is_admin());

-- Also ensure the superadmin can always do everything regardless of the function
CREATE POLICY "Superadmin full access" ON profiles
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'ciepcentrointegradodeensinopro@gmail.com'
  );
