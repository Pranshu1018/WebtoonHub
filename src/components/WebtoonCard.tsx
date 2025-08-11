import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Eye, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebtoonCardProps {
  title: string;
  author: string;
  genre: string;
  likes: string;
  views: string;
  rating: number;
  coverImage: string;
  isNew?: boolean;
  slug: string;
  onClick?: () => void;
}

export function WebtoonCard({
  title,
  author,
  genre,
  likes,
  views,
  rating,
  coverImage,
  isNew,
  slug,
  onClick
}: WebtoonCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Check if comic is favorited
  useEffect(() => {
    if (!user) return;
    
    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('comic_slug', slug)
        .single();
      
      setIsFavorited(!!data);
    };
    
    checkFavorite();
  }, [user, slug]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add favorites",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingFavorite(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('comic_slug', slug);
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: `${title} has been removed from your favorites`,
        });
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            comic_slug: slug
          });
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: `${title} has been added to your favorites`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };
  return (
    <Card 
      className="group cursor-pointer overflow-hidden bg-card shadow-card hover:shadow-hero transform hover:scale-105 transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {isNew && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
            NEW
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full hover:scale-110 transition-all duration-200 ${
              isFavorited ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
            onClick={toggleFavorite}
            disabled={isLoadingFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-2">by {author}</p>
        <Badge variant="secondary" className="mb-3 text-xs">
          {genre}
        </Badge>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}