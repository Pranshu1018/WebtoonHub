import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WebtoonCard } from "@/components/WebtoonCard";
import { Button } from "@/components/ui/button";
import { Heart, Star, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Favorites() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["user-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          comic_slug,
          comics!inner(
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
            status,
            profiles!comics_author_id_fkey(display_name)
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredFavorites = favorites?.filter(favorite => {
    if (filter === 'ongoing') return favorite.comics.status === 'ongoing';
    if (filter === 'completed') return favorite.comics.status === 'completed';
    return true;
  }) || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to see your favorite comics and keep track of series you love.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">My Favorites</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Your personally curated collection of amazing webtoons
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              All Favorites ({favorites?.length || 0})
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'default' : 'outline'}
              onClick={() => setFilter('ongoing')}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Ongoing ({favorites?.filter(f => f.comics.status === 'ongoing').length || 0})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Completed ({favorites?.filter(f => f.comics.status === 'completed').length || 0})
            </Button>
          </div>

          {/* Favorites Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[3/4] mb-3"></div>
                  <div className="bg-muted h-4 rounded mb-2"></div>
                  <div className="bg-muted h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((favorite, index) => (
                <div key={favorite.comics.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <WebtoonCard
                    id={favorite.comics.id}
                    title={favorite.comics.title}
                    author={favorite.comics.profiles?.display_name || "Unknown Author"}
                    genre={favorite.comics.genre}
                    coverImage={favorite.comics.cover_image_url}
                    slug={favorite.comics.slug}
                    totalEpisodes={favorite.comics.total_episodes || 0}
                    totalLikes={favorite.comics.total_likes || 0}
                    totalViews={favorite.comics.total_views || 0}
                    rating={favorite.comics.rating || 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring webtoons and add them to your favorites!
              </p>
              <Button asChild>
                <Link to="/">Discover Comics</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}