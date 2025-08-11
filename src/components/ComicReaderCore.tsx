import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Play, 
  Pause, 
  ZoomIn, 
  MessageCircle, 
  Bookmark, 
  Settings,
  Maximize,
  Minimize,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useVibration } from "@/hooks/useVibration";
import { PanelZoom } from "@/components/PanelZoom";
import { CommentBox } from "@/components/CommentBox";
import { AutoPlayDialog } from "@/components/AutoPlayDialog";
import { MiniRecap } from "@/components/MiniRecap";
import { ReaderSettings } from "@/components/ReaderSettings";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Episode {
  id: string;
  comic_id: string;
  episode_number: number;
  title: string;
  image_urls: string[];
  content_text: string;
  published_at: string;
  is_published: boolean;
  views: number;
  likes: number;
}

interface ComicPanel {
  id: number;
  imageUrl: string;
  isLoaded: boolean;
}

interface ReaderPreferences {
  brightness: number;
  contrast: number;
  backgroundColor: 'dark' | 'black' | 'sepia' | 'white';
  readingDirection: 'vertical' | 'horizontal';
  panelSpacing: number;
  soundEnabled: boolean;
}

const defaultPreferences: ReaderPreferences = {
  brightness: 100,
  contrast: 100,
  backgroundColor: 'dark',
  readingDirection: 'vertical',
  panelSpacing: 16,
  soundEnabled: true,
};

export default function ComicReaderCore() {
  const { slug, episodeId } = useParams<{ slug: string; episodeId: string }>();
  const navigate = useNavigate();
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [zoomedPanel, setZoomedPanel] = useState<number | null>(null);
  const [showAutoPlayDialog, setShowAutoPlayDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ReaderPreferences>(defaultPreferences);
  const [showControls, setShowControls] = useState(true);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Custom hooks
  const { progress, saveProgress, markCompleted } = useReadingProgress(slug || '', episodeId || '');
  const { isAutoScrolling, scrollSpeed, setScrollSpeed, toggleAutoScroll } = useAutoScroll(containerRef);
  const { vibrate, patterns } = useVibration();

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reader-preferences');
    if (saved) {
      setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<ReaderPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('reader-preferences', JSON.stringify(updated));
  };

  // Fetch episode data and initialize panels
  useEffect(() => {
    if (slug && episodeId) {
      fetchEpisodeData();
    }
  }, [slug, episodeId]);

  const fetchEpisodeData = async () => {
    if (!episodeId) return;
    
    try {
      setLoading(true);
      
      // Fetch episode data
      const { data: episodeData, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .single();

      if (error) throw error;
      
      setEpisode(episodeData);
      
      // Convert image URLs to panels
      const panelUrls = episodeData.image_urls || [];
      const initialPanels = panelUrls.map((url, index) => ({
        id: index,
        imageUrl: url,
        isLoaded: false
      }));
      
      setPanels(initialPanels);
      panelRefs.current = new Array(initialPanels.length);
      
      // Restore scroll position after a short delay
      setTimeout(() => {
        if (containerRef.current && progress.scrollPosition > 0) {
          containerRef.current.scrollTo({ top: progress.scrollPosition });
        }
      }, 100);
      
      // Load bookmark status
      const bookmarkKey = `bookmark_${slug}_${episodeId}`;
      setIsBookmarked(localStorage.getItem(bookmarkKey) === 'true');
      
      // Show recap for episodes 2+
      if (episodeData.episode_number > 1) {
        setShowRecap(true);
      }
      
    } catch (error) {
      console.error('Error fetching episode:', error);
      // Fallback to empty panels if episode not found
      setPanels([]);
    } finally {
      setLoading(false);
    }
  };

  // Fullscreen handling
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error("Error entering fullscreen:", error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }
  };

  // Auto-hide controls in fullscreen
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // Handle resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll progress tracking
  const updateScrollProgress = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    
    setScrollProgress(Math.min(100, Math.max(0, progress)));

    // Update current panel based on scroll position
    const windowHeight = container.clientHeight;
    const scrollCenter = scrollTop + windowHeight / 2;
    
    let currentPanelIndex = 0;
    panelRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        if (elementTop <= scrollCenter) {
          currentPanelIndex = index;
        }
      }
    });
    
    setCurrentPanel(currentPanelIndex);
    
    // Save reading progress
    saveProgress({
      currentPanel: currentPanelIndex,
      scrollPosition: scrollTop
    });
  }, [saveProgress]);

  // Touch/swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Only handle swipes if they're significant enough
    if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return;
    
    // Vertical swipes for scrolling
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) {
        // Swipe down - scroll up
        containerRef.current.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' });
      } else {
        // Swipe up - scroll down
        containerRef.current.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
      }
    }
  };

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      switch (e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          containerRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'ArrowUp':
          e.preventDefault();
          containerRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevEpisode();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextEpisode();
          break;
        case 'Home':
          e.preventDefault();
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  // Scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollProgress);
    return () => container.removeEventListener('scroll', updateScrollProgress);
  }, [updateScrollProgress]);

  // Lazy loading intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const panelId = parseInt(entry.target.getAttribute('data-panel-id') || '0');
            setPanels(prev => prev.map(panel => 
              panel.id === panelId ? { ...panel, isLoaded: true } : panel
            ));
          }
        });
      },
      { rootMargin: '200px' }
    );

    panelRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [panels.length]);

  const goToNextEpisode = () => {
    const nextEpisodeId = parseInt(episodeId || '1') + 1;
    if (preferences.soundEnabled) vibrate(patterns.page_turn);
    navigate(`/comic/${slug}/episode/${nextEpisodeId}`);
  };

  const goToPrevEpisode = () => {
    const prevEpisodeId = Math.max(1, parseInt(episodeId || '1') - 1);
    if (preferences.soundEnabled) vibrate(patterns.page_turn);
    navigate(`/comic/${slug}/episode/${prevEpisodeId}`);
  };

  const toggleBookmark = () => {
    const bookmarkKey = `bookmark_${slug}_${episodeId}`;
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(bookmarkKey, newBookmarkState.toString());
    if (preferences.soundEnabled) {
      vibrate(newBookmarkState ? patterns.success : patterns.subtle);
    }
  };

  const handleEpisodeEnd = () => {
    markCompleted();
    setShowAutoPlayDialog(true);
  };

  const handlePanelClick = (index: number) => {
    setZoomedPanel(index);
    if (preferences.soundEnabled) vibrate(patterns.medium);
  };

  const jumpToPanel = (panelIndex: number) => {
    const panel = panelRefs.current[panelIndex];
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getBackgroundStyle = () => {
    const backgrounds = {
      dark: 'bg-background',
      black: 'bg-black',
      sepia: 'bg-orange-50',
      white: 'bg-white'
    };
    return backgrounds[preferences.backgroundColor];
  };

  const getContainerStyle = () => ({
    filter: `brightness(${preferences.brightness}%) contrast(${preferences.contrast}%)`,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!panels.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Episode not found</h2>
          <p className="text-muted-foreground mb-4">This episode doesn't have any panels or doesn't exist.</p>
          <Button onClick={() => navigate(`/comic/${slug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comic
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("min-h-screen transition-colors duration-300", getBackgroundStyle())}
      style={getContainerStyle()}
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Controls */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b transition-transform duration-300",
        !showControls && isFullscreen ? "-translate-y-full" : "translate-y-0"
      )}>
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/comic/${slug}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>Episode {episodeId}</span>
                <span>•</span>
                <span>Panel {currentPanel + 1} of {panels.length}</span>
              </div>
              <Progress value={scrollProgress} className="h-2" />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={goToPrevEpisode}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToNextEpisode}>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleAutoScroll}
                className={isAutoScrolling ? 'text-primary' : ''}
              >
                {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleBookmark}
                className={isBookmarked ? 'text-accent' : ''}
              >
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comic Panels Container */}
      <div 
        ref={containerRef}
        className={cn(
          "overflow-y-auto h-screen",
          isFullscreen ? "pt-0" : "pt-20"
        )}
        style={{ 
          scrollBehavior: 'smooth',
          paddingBottom: isFullscreen ? '0' : '80px'
        }}
      >
        <div className={cn(
          "mx-auto px-4",
          preferences.readingDirection === 'horizontal' ? "flex gap-4 w-max" : "max-w-4xl"
        )}>
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              ref={(el) => panelRefs.current[index] = el}
              data-panel-id={panel.id}
              className={cn(
                "bg-card rounded-lg overflow-hidden shadow-card cursor-pointer",
                preferences.readingDirection === 'horizontal' 
                  ? "flex-shrink-0 w-[600px]" 
                  : "mb-4"
              )}
              style={{ 
                marginBottom: preferences.readingDirection === 'vertical' 
                  ? `${preferences.panelSpacing}px` 
                  : undefined 
              }}
            >
              {panel.isLoaded ? (
                <div className="relative group">
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    onClick={() => handlePanelClick(index)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      <ZoomIn className="w-4 h-4 mr-2" />
                      Zoom
                    </Button>
                  </div>
                  {/* Panel number indicator */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {index + 1}
                  </div>
                </div>
              ) : (
                <div className="w-full h-96 bg-muted animate-pulse flex items-center justify-center">
                  <span className="text-muted-foreground">Loading panel...</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Episode End Actions */}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-card rounded-lg p-8 shadow-card">
            <h3 className="text-2xl font-bold mb-4">End of Episode {episode?.episode_number || episodeId}</h3>
            <h4 className="text-lg font-medium mb-2">{episode?.title}</h4>
            <p className="text-muted-foreground mb-6">
              Thanks for reading! Ready for the next episode?
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate(`/comic/${slug}`)}>
                <Home className="w-4 h-4 mr-2" />
                Back to Episodes
              </Button>
              <Button variant="hero" onClick={handleEpisodeEnd}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Next Episode
              </Button>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <CommentBox slug={slug || ''} episodeId={episodeId || ''} />
          </div>
        )}
      </div>

      {/* Mobile Quick Navigation */}
      {isMobile && (
        <div className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300",
          !showControls && isFullscreen ? "opacity-0" : "opacity-70"
        )}>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => containerRef.current?.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => containerRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Auto-scroll Speed Control */}
      {isAutoScrolling && (
        <div className="fixed bottom-20 right-6 bg-card rounded-lg shadow-hero p-4">
          <div className="text-xs text-muted-foreground mb-2 text-center">
            Auto-scroll Speed
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setScrollSpeed(Math.max(0.5, scrollSpeed - 0.5))}>
              -
            </Button>
            <span className="text-sm min-w-8 text-center">{scrollSpeed}x</span>
            <Button variant="ghost" size="sm" onClick={() => setScrollSpeed(Math.min(5, scrollSpeed + 0.5))}>
              +
            </Button>
          </div>
        </div>
      )}

      {/* Panel Zoom Modal */}
      {zoomedPanel !== null && (
        <PanelZoom
          imageUrl={panels[zoomedPanel]?.imageUrl || ''}
          isOpen={zoomedPanel !== null}
          onClose={() => setZoomedPanel(null)}
          panelIndex={zoomedPanel}
        />
      )}

      {/* Reader Settings */}
      <ReaderSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onJumpToPanel={jumpToPanel}
        totalPanels={panels.length}
        currentPanel={currentPanel}
      />

      {/* Auto-play Dialog */}
      <AutoPlayDialog
        isOpen={showAutoPlayDialog}
        onClose={() => setShowAutoPlayDialog(false)}
        onProceed={goToNextEpisode}
        nextEpisodeId={(parseInt(episodeId || '1') + 1).toString()}
      />

      {/* Mini Recap */}
      {showRecap && (
        <MiniRecap
          slug={slug || ''}
          episodeId={episodeId || ''}
          onContinue={() => setShowRecap(false)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {!isMobile && (
        <div className={cn(
          "fixed bottom-6 left-6 transition-opacity duration-300",
          !showControls && isFullscreen ? "opacity-0" : "opacity-20 hover:opacity-100"
        )}>
          <div className="bg-card rounded-lg shadow-hero p-4">
            <div className="text-xs text-muted-foreground mb-2 text-center">
              Keyboard Shortcuts
            </div>
            <div className="text-xs space-y-1">
              <div>↑/↓ or Space: Scroll</div>
              <div>←/→: Previous/Next Episode</div>
              <div>F: Toggle Fullscreen</div>
              <div>Home/End: Jump to Start/End</div>
              <div>Click panels to zoom</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}