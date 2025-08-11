-- Create proper role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'publisher', 'reader');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY(
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update publisher_content policies to use new role system
DROP POLICY IF EXISTS "Publishers can manage their own content" ON public.publisher_content;
CREATE POLICY "Publishers can manage their own content" 
ON public.publisher_content 
FOR ALL 
USING (
  (public.has_role(auth.uid(), 'publisher') OR public.has_role(auth.uid(), 'admin'))
  AND publisher_id = auth.uid()
);

-- Update storage policies to use new role system
DROP POLICY IF EXISTS "Publishers can upload images" ON storage.objects;
CREATE POLICY "Publishers can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'publisher-images' AND 
  (public.has_role(auth.uid(), 'publisher') OR public.has_role(auth.uid(), 'admin'))
);

DROP POLICY IF EXISTS "Publishers can update their own images" ON storage.objects;
CREATE POLICY "Publishers can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'publisher-images' AND 
  (public.has_role(auth.uid(), 'publisher') OR public.has_role(auth.uid(), 'admin'))
);

DROP POLICY IF EXISTS "Publishers can upload CBZ files" ON storage.objects;
CREATE POLICY "Publishers can upload CBZ files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'publisher-cbz' AND 
  (public.has_role(auth.uid(), 'publisher') OR public.has_role(auth.uid(), 'admin'))
);

DROP POLICY IF EXISTS "Publishers can update their own CBZ files" ON storage.objects;
CREATE POLICY "Publishers can update their own CBZ files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'publisher-cbz' AND 
  (public.has_role(auth.uid(), 'publisher') OR public.has_role(auth.uid(), 'admin'))
);

-- Give you publisher role (replace with your actual user ID when you sign up)
-- This will be commented out - you'll need to run it manually with your user ID
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'publisher');