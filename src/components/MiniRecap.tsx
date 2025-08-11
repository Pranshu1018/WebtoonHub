import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, X } from "lucide-react";

interface MiniRecapProps {
  slug: string;
  episodeId: string;
  onContinue: () => void;
}

// Mock recap data - in a real app, this would come from an API
const recapData: Record<string, Record<string, string>> = {
  "cafe-love-story": {
    "2": "After a chance encounter at the neighborhood café, Alex and Jamie discovered they both love the same obscure book series. Their conversation lasted hours, and now Jamie has agreed to meet again tomorrow...",
    "3": "The second date went perfectly! They walked through the park, shared stories about their dreams, and Jamie finally worked up the courage to hold Alex's hand. But now Jamie's ex has unexpectedly returned to town...",
    "4": "The confrontation with the ex created tension between Alex and Jamie. After a heated argument, they decided to take some time apart. Will they be able to work through their differences?",
    "5": "A week has passed since their fight. Alex has been trying to reach out, but Jamie hasn't responded. Today is Alex's birthday, and they're hoping Jamie will remember..."
  }
};

export function MiniRecap({ slug, episodeId, onContinue }: MiniRecapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenRecap, setHasSeenRecap] = useState(false);

  const recapText = recapData[slug]?.[episodeId];
  const recapKey = `recap_seen_${slug}_${episodeId}`;

  useEffect(() => {
    // Check if user has already seen this recap
    const seen = localStorage.getItem(recapKey) === 'true';
    setHasSeenRecap(seen);
    
    // Show recap for episodes 2+ if not seen and recap exists
    if (parseInt(episodeId) > 1 && !seen && recapText) {
      setIsVisible(true);
    }
  }, [episodeId, recapKey, recapText]);

  const handleContinue = () => {
    localStorage.setItem(recapKey, 'true');
    setIsVisible(false);
    onContinue();
  };

  const handleSkip = () => {
    localStorage.setItem(recapKey, 'true');
    setIsVisible(false);
    onContinue();
  };

  if (!isVisible || !recapText) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="max-w-2xl mx-4 shadow-hero">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-between">
            <span>Episode {episodeId} - Previously...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground leading-relaxed">
              {recapText}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip Recap
            </Button>
            <Button
              variant="hero"
              onClick={handleContinue}
            >
              <Play className="w-4 h-4 mr-2" />
              Continue Reading
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}