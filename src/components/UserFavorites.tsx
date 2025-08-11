import { useState, useEffect } from "react";
import { WebtoonCard } from "./WebtoonCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart, Loader2 } from "lucide-react";
import romanceCover from "@/assets/romance-cover.jpg";
import actionCover from "@/assets/action-cover.jpg";
import sliceLifeCover from "@/assets/slice-life-cover.jpg";

// Mock data for comics (we'll use the same data structure)
const comicsData = {
  "shadow-chronicles": {
    title: "Shadow Chronicles: The Awakening",
    author: "Dark Phoenix Studios",
    genre: "Fantasy",
    likes: "3.2M",
    views: "89M",
    rating: 9.8,
    coverImage: actionCover,
    isNew: true,
    slug: "shadow-chronicles"
  },
  "cafe-love-story": {
    title: "Café Love Story",
    author: "Emma Chen",
    genre: "Romance",
    likes: "1.8M",
    views: "45M",
    rating: 9.4,
    coverImage: romanceCover,
    isNew: true,
    slug: "cafe-love-story"
  },
  "shadow-warrior": {
    title: "Shadow Warrior",
    author: "Alex Kim",
    genre: "Action",
    likes: "2.1M",
    views: "67M",
    rating: 9.6,
    coverImage: actionCover,
    slug: "shadow-warrior"
  },
  "high-school-days": {
    title: "High School Days",
    author: "Yuki Tanaka",
    genre: "Slice of Life",
    likes: "950K",
    views: "28M",
    rating: 8.9,
    coverImage: sliceLifeCover,
    isNew: true,
    slug: "high-school-days"
  }
};

export function UserFavorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('comic_slug')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setFavorites(data.map(fav => fav.comic_slug));
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Sign in to see your favorites</h3>
        <p className="text-muted-foreground mb-4">
          Save your favorite webtoons to easily find them later
        </p>
        <Button variant="hero" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Loading your favorites...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-4">
          Start adding comics to your favorites to see them here
        </p>
        <Button variant="hero" onClick={() => navigate('/')}>
          Explore Comics
        </Button>
      </div>
    );
  }

  const favoriteComics = favorites
    .map(slug => comicsData[slug as keyof typeof comicsData])
    .filter(Boolean);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Favorites</h2>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? 'comic' : 'comics'} in your collection
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteComics.map((comic, index) => (
          <div
            key={comic.slug}
            className={`animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
          >
            <WebtoonCard
              title={comic.title}
              author={comic.author}
              genre={comic.genre}
              likes={comic.likes}
              views={comic.views}
              rating={comic.rating}
              coverImage={comic.coverImage}
              isNew={'isNew' in comic ? comic.isNew : false}
              slug={comic.slug}
              onClick={() => navigate(`/comic/${comic.slug}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}