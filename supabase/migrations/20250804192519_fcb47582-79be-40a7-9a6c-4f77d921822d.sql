-- Create publisher content table for managing uploaded files
CREATE TABLE public.publisher_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id UUID NOT NULL,
  comic_id UUID NOT NULL,
  episode_id UUID NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'cbz')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  page_number INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (comic_id) REFERENCES public.comics(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.publisher_content ENABLE ROW LEVEL SECURITY;

-- Create storage buckets for publisher content
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('publisher-images', 'publisher-images', true),
  ('publisher-cbz', 'publisher-cbz', true);

-- RLS policies for publisher_content table
CREATE POLICY "Publishers can manage their own content" 
ON public.publisher_content 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'publisher' OR role = 'admin')
  ) AND publisher_id = auth.uid()
);

CREATE POLICY "Anyone can view published content" 
ON public.publisher_content 
FOR SELECT 
USING (is_published = true);

-- Storage policies for publisher images
CREATE POLICY "Publishers can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'publisher-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'publisher' OR role = 'admin')
  )
);

CREATE POLICY "Publishers can view their own images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'publisher-images');

CREATE POLICY "Publishers can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'publisher-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'publisher' OR role = 'admin')
  )
);

-- Storage policies for CBZ files
CREATE POLICY "Publishers can upload CBZ files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'publisher-cbz' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'publisher' OR role = 'admin')
  )
);

CREATE POLICY "Publishers can view CBZ files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'publisher-cbz');

CREATE POLICY "Publishers can update their own CBZ files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'publisher-cbz' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'publisher' OR role = 'admin')
  )
);

-- Update trigger for publisher_content
CREATE TRIGGER update_publisher_content_updated_at
BEFORE UPDATE ON public.publisher_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_publisher_content_episode ON public.publisher_content(episode_id, page_number);
CREATE INDEX idx_publisher_content_publisher ON public.publisher_content(publisher_id);
CREATE INDEX idx_publisher_content_published ON public.publisher_content(is_published);