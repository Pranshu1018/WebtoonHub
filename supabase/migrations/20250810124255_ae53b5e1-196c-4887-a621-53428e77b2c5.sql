-- Create storage bucket for episode images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('episode-images', 'episode-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for episode images
CREATE POLICY "Anyone can view episode images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'episode-images');

CREATE POLICY "Publishers can upload episode images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'episode-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Publishers can update their own episode images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'episode-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Publishers can delete their own episode images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'episode-images' AND auth.uid()::text = (storage.foldername(name))[1]);