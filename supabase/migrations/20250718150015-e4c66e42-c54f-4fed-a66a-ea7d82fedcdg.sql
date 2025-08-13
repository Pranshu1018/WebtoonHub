CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  comic_id UUID REFERENCES comics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE favorites
ADD CONSTRAINT favorites_comic_slug_fkey 
FOREIGN KEY (comic_slug) 
REFERENCES comics(slug) 
ON DELETE CASCADE;