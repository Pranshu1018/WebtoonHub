import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WebtoonCard } from "@/components/WebtoonCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Heart, Zap, Crown, Sparkles, Skull } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const genreIcons: Record<string, any> = {
  "Romance": Heart,
  "Action": Zap,
  "Fantasy": Crown,
  "Slice of Life": Sparkles,
  "Horror": Skull,
  "Comedy": Sparkles,
};

const genreColors: Record<string, string> = {
  "Romance": "bg-pink-500",
  "Action": "bg-red-500",
  "Fantasy": "bg-purple-500",
  "Slice of Life": "bg-blue-500",
  "Horror": "bg-gray-500",
  "Comedy": "bg-yellow-500",
};

export default function Genres() {
  const { genre: selectedGenre } = useParams();
  const navigate = useNavigate();

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comics")
        .select("genre");

      if (error) throw error;
      
      const genreCounts = data.reduce((acc: Record<string, number>, comic) => {
        acc[comic.genre] = (acc[comic.genre] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(genreCounts).map(([name, count]) => ({
        name,
        count: count.toString(),
        icon: genreIcons[name] || Sparkles,
        color: genreColors[name] || "bg-gray-500"
      }));
    },
  });

  const { data: genreComics, isLoading: comicsLoading } = useQuery({
    queryKey: ["genre-comics", selectedGenre],
    queryFn: async () => {
      if (!selectedGenre) return null;
      
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
          profiles!comics_author_id_fkey(display_name)
        `)
        .eq("genre", selectedGenre.replace('-', ' '))
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedGenre,
  });

  const handleCardClick = (slug: string) => {
    navigate(`/comic/${slug}`);
  };

  if (selectedGenre) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <Link to="/genres" className="text-primary hover:underline mb-4 inline-block">
                ← Back to All Genres
              </Link>
              <h1 className="text-4xl font-bold mb-2">{selectedGenre.replace('-', ' ')} Comics</h1>
              <p className="text-muted-foreground text-lg">
                Explore the best {selectedGenre.replace('-', ' ').toLowerCase()} comics
              </p>
            </div>

            {comicsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg aspect-[3/4] mb-3"></div>
                    <div className="bg-muted h-4 rounded mb-2"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : genreComics && genreComics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {genreComics.map((comic, index) => (
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No comics found in this genre yet.</p>
              </div>
            )}
          </div>
        </main>
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
              <Layers className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Browse by Genre</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find your perfect story by exploring different genres
            </p>
          </div>

          {/* Genres Grid */}
          {genresLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div>
                          <div className="bg-muted h-6 w-24 rounded mb-2"></div>
                          <div className="bg-muted h-4 w-16 rounded"></div>
                        </div>
                      </div>
                      <div className="bg-muted h-9 w-full rounded"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {genres?.map((genre, index) => {
                const IconComponent = genre.icon;
                return (
                  <Link 
                    key={genre.name} 
                    to={`/genres/${genre.name.toLowerCase().replace(' ', '-')}`}
                    className="hover:no-underline"
                  >
                    <Card 
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 ${genre.color} rounded-lg flex items-center justify-center text-white`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {genre.name}
                            </h3>
                            <Badge variant="secondary">{genre.count} comics</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          Explore {genre.name}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}