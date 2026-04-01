-- Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the avatars bucket
CREATE POLICY "Avatars are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar." ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar." ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
