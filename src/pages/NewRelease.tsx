import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WebtoonCard } from "@/components/WebtoonCard";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function NewReleases() {
  const navigate = useNavigate();
  
  const { data: newReleases, isLoading } = useQuery({
    queryKey: ["new-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comics")
        .select(`
          id,
          title,
          slug,
          cover_image_url,
          genre,
          author_id,
          total_episodes,
          total_likes,
          total_views,
          rating,
          created_at,
          profiles!comics_author_id_fkey(display_name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleCardClick = (slug: string) => {
    navigate(`/comic/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">New Releases</h1>
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">
              Fresh stories just published - be the first to discover them!
            </p>
          </div>

          {/* New Releases Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[3/4] mb-3"></div>
                  <div className="bg-muted h-4 rounded mb-2"></div>
                  <div className="bg-muted h-3 rounded w-2/3"></div>
                  <div className="bg-muted h-8 rounded mt-2"></div>
                </div>
              ))}
            </div>
          ) : newReleases && newReleases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newReleases.map((comic, index) => (
                <div 
                  key={comic.id} 
                  className="animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCardClick(comic.slug)}
                >
                  <WebtoonCard
                    id={comic.id}
                    title={comic.title}
                    author={comic.profiles?.display_name || "Unknown Author"}
                    genre={comic.genre}
                    coverImage={comic.cover_image_url}
                    slug={comic.slug}
                    totalEpisodes={comic.total_episodes || 0}
                    totalLikes={comic.total_likes || 0}
                    totalViews={comic.total_views || 0}
                    rating={comic.rating || 0}
                  />
                  <div className="mt-2 p-2 bg-card/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Released: {getRelativeDate(comic.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No new releases yet</h3>
              <p className="text-muted-foreground">Check back soon for fresh content!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}