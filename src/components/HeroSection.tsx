import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/webtoon-hero.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const handleReadNow = () => {
    navigate("/comic/shadow-chronicles/episode/1");
  };

  const handleSaveForLater = () => {
    setIsSaved(!isSaved);
    // Add to localStorage for persistence
    localStorage.setItem("saved_shadow-chronicles", (!isSaved).toString());
  };

  return (
    <section className="relative h-[80vh] min-h-[700px] overflow-hidden group">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Featured Webtoon"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>
      
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 flex items-center">
          <div className="max-w-2xl animate-in slide-in-from-left-8 duration-1000">
            <div className="text-sm text-muted-foreground mb-3 font-medium tracking-wider uppercase animate-in fade-in-0 duration-1000 delay-300">
              SEASON 1 | 2024
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-in slide-in-from-left-8 duration-1000 delay-500">
              <span className="bg-gradient-text bg-clip-text text-transparent">
                Shadow Chronicles:
              </span>
              <br />
              <span className="text-foreground">The Awakening</span>
            </h1>
            
            <div className="flex items-center gap-1 mb-4 animate-in fade-in-0 duration-1000 delay-700">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 transition-all duration-300 delay-${i * 100} ${
                    i < 4 ? 'fill-accent text-accent hover:scale-110' : 'text-muted-foreground hover:text-accent'
                  }`} 
                />
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-left-4 duration-1000 delay-900">
              {["Fantasy", "Action", "Supernatural"].map((genre, i) => (
                <Badge 
                  key={genre} 
                  variant="secondary" 
                  className={`text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 delay-${i * 100} cursor-pointer`}
                >
                  {genre}
                </Badge>
              ))}
            </div>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg animate-in fade-in-0 duration-1000 delay-1100">
              A young academy student discovers dark powers within herself while uncovering ancient conspiracies that threaten to destroy both the magical and mundane worlds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-1300">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-hero hover:shadow-[0_25px_70px_hsl(271_100%_70%/0.6)]"
                onClick={handleReadNow}
              >
                <Play className="w-5 h-5 mr-2" />
                Read Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className={`text-lg px-8 py-6 border-primary/30 hover:border-primary hover:scale-105 transition-all duration-300 ${
                  isSaved ? 'bg-primary/20 border-primary text-primary' : ''
                }`}
                onClick={handleSaveForLater}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all duration-300 ${isSaved ? 'fill-primary' : ''}`} />
                {isSaved ? 'Saved!' : 'Save for later'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}