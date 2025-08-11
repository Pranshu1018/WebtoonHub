import { useState, useEffect } from "react";
import { WebtoonCard } from "./WebtoonCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import romanceCover from "@/assets/romance-cover.jpg";
import actionCover from "@/assets/action-cover.jpg";
import sliceLifeCover from "@/assets/slice-life-cover.jpg";

interface Comic {
  id: string;
  title: string;
  slug: string;
  description: string;
  genre: string;
  cover_image_url: string;
  status: string;
  total_episodes: number;
  total_views: number;
  total_likes: number;
  rating: number;
  created_at: string;
  author_id: string;
  tags: string[];
  profiles?: {
    display_name: string;
    username: string;
  };
}

const fallbackWebtoons = [
  {
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
  {
    title: "Shadow Warrior",
    author: "Alex Kim",
    genre: "Action",
    likes: "2.1M",
    views: "67M",
    rating: 9.6,
    coverImage: actionCover,
    slug: "shadow-warrior"
  },
  {
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
];

const categories = [
  { icon: TrendingUp, label: "Trending", count: 156 },
  { icon: Clock, label: "Recently Updated", count: 89 },
  { icon: Flame, label: "Popular", count: 234 }
];

export function FeaturedSection() {
  const navigate = useNavigate();
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      const { data, error } = await supabase
        .from('comics')
        .select(`
          *,
          profiles:author_id (
            display_name,
            username
          )
        `)
        .eq('status', 'ongoing')
        .order('total_views', { ascending: false })
        .limit(6);

      if (error) throw error;
      setComics(data || []);
    } catch (error) {
      console.error('Error fetching comics:', error);
      // Use fallback data if fetch fails
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayComics = () => {
    if (comics.length > 0) {
      return comics.map(comic => ({
        title: comic.title,
        author: comic.profiles?.display_name || comic.profiles?.username || 'Unknown Author',
        genre: comic.genre,
        likes: formatNumber(comic.total_likes),
        views: formatNumber(comic.total_views),
        rating: comic.rating || 9.0,
        coverImage: comic.cover_image_url || romanceCover,
        isNew: isRecentlyCreated(comic.created_at),
        slug: comic.slug
      }));
    }
    return fallbackWebtoons;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isRecentlyCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30; // Consider new if created within 30 days
  };

  const displayComics = getDisplayComics();
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center animate-in fade-in-0 duration-1000 delay-200">
          {categories.map((category, index) => (
            <Button
              key={category.label}
              variant="outline"
              className={`flex items-center gap-2 bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 group hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
            >
              <category.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {category.label}
              <Badge variant="secondary" className="ml-2 group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 animate-in slide-in-from-top-4 duration-1000 delay-400">
          <h2 className="text-4xl font-bold mb-4 hover:scale-105 transition-transform duration-300">
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Featured
            </span>{" "}
            <span className="text-foreground">Webtoons</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in-0 duration-1000 delay-600">
            Discover the most captivating stories that are taking the world by storm
          </p>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg h-80 mb-4"></div>
                <div className="bg-muted rounded h-4 mb-2"></div>
                <div className="bg-muted rounded h-3 w-3/4"></div>
              </div>
            ))
          ) : (
            displayComics.map((webtoon, index) => (
              <div
                key={webtoon.slug}
                className={`animate-in slide-in-from-bottom-4 duration-500 delay-${800 + index * 200}`}
              >
                <WebtoonCard
                  title={webtoon.title}
                  author={webtoon.author}
                  genre={webtoon.genre}
                  likes={webtoon.likes}
                  views={webtoon.views}
                  rating={webtoon.rating}
                  coverImage={webtoon.coverImage}
                  isNew={webtoon.isNew}
                  slug={webtoon.slug}
                  onClick={() => navigate(`/comic/${webtoon.slug}`)}
                />
              </div>
            ))
          )}
        </div>

        {/* View More */}
        <div className="text-center animate-in fade-in-0 duration-1000 delay-1400">
          <Button 
            variant="hero" 
            size="lg" 
            className="px-12 hover:scale-105 transition-all duration-300 shadow-hero hover:shadow-[0_25px_70px_hsl(271_100%_70%/0.6)]"
            onClick={() => navigate("/?view=all")}
          >
            Explore All Webtoons
          </Button>
        </div>
      </div>
    </section>
  );
}