import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSupabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function HeroCarousel() {
  const [featuredComics, setFeaturedComics] = useState<Tables<'comics'>[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const supabase = useSupabase();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFeaturedComics = async () => {
      const { data, error } = await supabase
        .from('comics')
        .select(`
          id,
          title,
          slug,
          cover_image_url,
          description,
          profiles!comics_author_id_fkey(display_name)
        `)
        .eq('featured', true)
        .limit(5);

      if (!error && data) {
        setFeaturedComics(data);
      }
    };

    fetchFeaturedComics();
  }, []);

  useEffect(() => {
    if (featuredComics.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredComics.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [featuredComics.length]);

  if (featuredComics.length === 0) return null;

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % featuredComics.length);
      }, 5000);
    }
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % featuredComics.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + featuredComics.length) % featuredComics.length);

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-xl">
      {/* Slides */}
      <div className="relative w-full h-full">
        {featuredComics.map((comic, index) => (
          <div
            key={comic.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img
              src={comic.cover_image_url || "/placeholder.svg"}
              alt={comic.title}
              className="w-full h-full object-cover"
            />
            
            {/* Slide Content */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 text-white max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{comic.title}</h2>
              <p className="text-lg mb-4">by {comic.profiles?.display_name || "Unknown Author"}</p>
              <p className="text-lg mb-6 line-clamp-2">{comic.description}</p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to={`/comic/${comic.slug}`}>Read Now</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {featuredComics.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {featuredComics.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-primary' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}