import { supabase } from '@/integrations/supabase/client';

export async function getWebtoonSlides(webtoonId: string) {
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, title, preview_image_url')
    .eq('comic_id', webtoonId)
    .order('chapter_number', { ascending: true })
    .limit(5);

  if (error) throw error;

  return chapters?.map((chapter) => ({
    image: chapter.preview_image_url,
    title: chapter.title,
    chapterId: chapter.id,
  })) || [];
}