-- Create a storage bucket for materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the materials bucket
CREATE POLICY "Materials are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Only admins can upload materials." ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'materials' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR (auth.jwt() ->> 'email' = 'ciepcentrointegradodeensinopro@gmail.com'))
  );

CREATE POLICY "Only admins can delete materials." ON storage.objects
  FOR DELETE USING (
    bucket_id = 'materials' AND 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR (auth.jwt() ->> 'email' = 'ciepcentrointegradodeensinopro@gmail.com'))
  );
