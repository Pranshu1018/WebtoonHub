import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Heart, 
  Eye, 
  BookOpen, 
  Calendar, 
  User, 
  Play,
  Star,
  Share2,
  Bookmark,
  ArrowLeft,
  Clock
} from 'lucide-react';

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
}

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  published_at: string;
  is_published: boolean;
  views: number;
  likes: number;
  image_urls: string[];
}

export default function ComicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comic, setComic] = useState<Comic | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorProfile, setAuthorProfile] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      fetchComicData();
    }
  }, [slug, user]);

  const fetchComicData = async () => {
    try {
      // Fetch comic details
      const { data: comicData, error: comicError } = await supabase
        .from('comics')
        .select('*')
        .eq('slug', slug)
        .single();

      if (comicError) throw comicError;
      setComic(comicData);

      // Fetch author profile
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', comicData.author_id)
        .single();

      if (!authorError) {
        setAuthorProfile(authorData);
      }

      // Fetch episodes
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('comic_id', comicData.id)
        .eq('is_published', true)
        .order('episode_number', { ascending: true });

      if (episodesError) throw episodesError;
      setEpisodes(episodesData || []);

      // Check if comic is favorited (if user is logged in)
      if (user) {
        const { data: favoriteData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('comic_slug', slug)
          .single();

        setIsFavorited(!!favoriteData);
      }

    } catch (error) {
      console.error('Error fetching comic:', error);
      toast.error('Failed to load comic details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('comic_slug', slug);

        if (error) throw error;
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            comic_slug: slug!
          });

        if (error) throw error;
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading comic details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Comic Not Found</h1>
            <p className="text-muted-foreground mb-4">The comic you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">

        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-muted-foreground">Back to Home</span>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Cover Image */}
            <div className="lg:col-span-2">
              <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
                {comic.cover_image_url ? (
                  <img
                    src={comic.cover_image_url}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Comic Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title and Genre */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {comic.title}
                </h1>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">by</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="font-medium text-primary">
                      {authorProfile?.display_name || authorProfile?.username || 'Unknown Author'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="px-3 py-1 text-sm font-medium">
                    {comic.genre}
                  </Badge>
                  {comic.tags && comic.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-2 py-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {episodes.length > 0 ? (
                  <Link to={`/comic/${slug}/episode/${episodes[0].id}`}>
                    <Button size="lg" className="px-8">
                      <Play className="w-5 h-5 mr-2" />
                      First Episode
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" disabled>
                    No Episodes Available
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={toggleFavorite}
                  className={`px-6 ${isFavorited ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Like' : 'Like'}
                </Button>
                
                <Button variant="outline" size="lg" className="px-6">
                  <Bookmark className="w-5 h-5 mr-2" />
                  Subscribe
                </Button>
                
                <Button variant="ghost" size="lg" className="p-3">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-card border">
                  <div className="text-2xl font-bold">{comic.total_views > 0 ? `${Math.floor(comic.total_views / 1000)}M` : '0M'}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <div className="text-2xl font-bold">{comic.total_likes > 0 ? `${Math.floor(comic.total_likes / 1000)}K` : '0K'}</div>
                  <div className="text-xs text-muted-foreground">Subscribers</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <div className="text-2xl font-bold">{comic.total_likes > 0 ? `${Math.floor(comic.total_likes / 1000)}K` : '0K'}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-card border">
                  <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 fill-current" />
                    {comic.rating || 9}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>

              {/* Update Schedule */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  Weekly
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  {comic.description || 'An amazing webtoon story that will keep you hooked from the first episode. Follow the journey of compelling characters in this unique world.'}
                </p>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Episodes</h2>
              {episodes.length > 0 && (
                <Link to={`/comic/${slug}/episode/${episodes[0].id}`}>
                  <Button className="px-6">
                    <Play className="w-4 h-4 mr-2" />
                    First Episode
                  </Button>
                </Link>
              )}
            </div>

            {episodes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No episodes available yet</h3>
                  <p className="text-muted-foreground">Check back later for new episodes!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {episodes.map((episode, index) => (
                  <Card key={episode.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <Link to={`/comic/${slug}/episode/${episode.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {episode.image_urls && episode.image_urls.length > 0 ? (
                                <img
                                  src={episode.image_urls[0]}
                                  alt={episode.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                #{episode.episode_number} {episode.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(episode.published_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{episode.likes || '0K'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Read
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}