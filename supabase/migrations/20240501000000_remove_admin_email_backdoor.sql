-- Remove o e-mail de teste ('test@gmail.com') do acesso de admin hardcoded.
-- Mantém apenas o e-mail real de bootstrap (ciepcentrointegradodeensinopro@gmail.com).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  user_email := COALESCE(
    auth.jwt() ->> 'email',
    auth.jwt() -> 'claims' ->> 'email',
    auth.jwt() -> 'user_metadata' ->> 'email'
  );

  IF user_email = 'ciepcentrointegradodeensinopro@gmail.com' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    (auth.jwt() ->> 'email') = 'ciepcentrointegradodeensinopro@gmail.com'
  );
