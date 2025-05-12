-- Run these commands in the Supabase SQL Editor to set up proper storage policies

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anonymous uploads to the 'vehicles' bucket
CREATE POLICY "Allow anonymous uploads to vehicles bucket" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (
  bucket_id = 'vehicles' 
  AND (storage.foldername(name))[1] = 'car-images'
);

-- Create a policy to allow anonymous users to select objects from the vehicles bucket
CREATE POLICY "Allow anonymous reads from vehicles bucket" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket_id = 'vehicles');

-- Create a policy to allow anonymous users to delete objects from the vehicles bucket
CREATE POLICY "Allow anonymous deletes from vehicles bucket" 
ON storage.objects FOR DELETE 
TO anon 
USING (bucket_id = 'vehicles'); 