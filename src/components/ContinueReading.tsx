import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Play } from "lucide-react";
import romanceCover from "@/assets/romance-cover.jpg";
import actionCover from "@/assets/action-cover.jpg";
import sliceLifeCover from "@/assets/slice-life-cover.jpg";

// Mock data for comics
const comicsData = {
  "shadow-chronicles": {
    title: "Shadow Chronicles: The Awakening",
    author: "Dark Phoenix Studios",
    coverImage: actionCover,
  },
  "cafe-love-story": {
    title: "Café Love Story",
    author: "Emma Chen",
    coverImage: romanceCover,
  },
  "shadow-warrior": {
    title: "Shadow Warrior",
    author: "Alex Kim",
    coverImage: actionCover,
  },
  "high-school-days": {
    title: "High School Days",
    author: "Yuki Tanaka",
    coverImage: sliceLifeCover,
  }
};

interface ReadingProgress {
  comic_slug: string;
  episode_id: string;
  progress_percentage: number;
  last_read_at: string;
}

export function ContinueReading() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadReadingProgress = async () => {
      const { data } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false })
        .limit(5);

      if (data) {
        setReadingProgress(data);
      }
      setIsLoading(false);
    };

    loadReadingProgress();
  }, [user]);

  if (!user || readingProgress.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Continue Reading</h2>
            <p className="text-muted-foreground">
              Pick up where you left off
            </p>
          </div>
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingProgress.map((progress, index) => {
            const comic = comicsData[progress.comic_slug as keyof typeof comicsData];
            if (!comic) return null;

            const progressPercent = Math.round(progress.progress_percentage * 100);
            const timeAgo = new Date(progress.last_read_at).toLocaleDateString();

            return (
              <Card 
                key={`${progress.comic_slug}-${progress.episode_id}`}
                className={`group cursor-pointer overflow-hidden bg-card shadow-card hover:shadow-hero transform hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500 delay-${index * 100}`}
                onClick={() => navigate(`/comic/${progress.comic_slug}/episode/${progress.episode_id}`)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={comic.coverImage}
                    alt={comic.title}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">Episode {progress.episode_id}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2 bg-white/20" />
                    <div className="text-xs text-white/80 mt-1">
                      {progressPercent}% complete
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {comic.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">by {comic.author}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{timeAgo}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary hover:scale-110 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/comic/${progress.comic_slug}/episode/${progress.episode_id}`);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}