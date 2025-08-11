import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateComicModal } from "./CreateComicModal";
import { CreateEpisodeModal } from "./CreateEpisodeModal";
import { EditComicModal } from "./EditComicModal";
import { EpisodeManagement } from "./EpisodeManagement";
import { PublisherAnalytics } from "./PublisherAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Edit, Eye, BarChart3, List, ArrowLeft } from "lucide-react";

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
  created_at: string;
}

export const PublisherDashboard = () => {
  const { user } = useAuth();
  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [showCreateComic, setShowCreateComic] = useState(false);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);
  const [showEditComic, setShowEditComic] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'episodes'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchComics();
    }
  }, [user]);

  const fetchComics = async () => {
    try {
      const { data, error } = await supabase
        .from('comics')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComics(data || []);
    } catch (error) {
      console.error('Error fetching comics:', error);
      toast.error('Failed to load comics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEpisode = (comic: Comic) => {
    setSelectedComic(comic);
    setShowCreateEpisode(true);
  };

  const handleEditComic = (comic: Comic) => {
    setSelectedComic(comic);
    setShowEditComic(true);
  };

  const handleManageEpisodes = (comic: Comic) => {
    setSelectedComic(comic);
    setCurrentView('episodes');
  };

  const handleViewComic = (comic: Comic) => {
    window.location.href = `/comic/${comic.slug}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  // Show episode management view
  if (currentView === 'episodes' && selectedComic) {
    return (
      <EpisodeManagement
        comicId={selectedComic.id}
        comicTitle={selectedComic.title}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedComic(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Publisher Dashboard</h1>
          <p className="text-muted-foreground">Manage your webtoons and episodes</p>
        </div>
        <Button 
          onClick={() => setShowCreateComic(true)}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Comic
        </Button>
      </div>

      <Tabs defaultValue="my-comics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="my-comics">My Comics</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="my-comics" className="space-y-6">
          {comics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No comics created yet.</p>
                <Button onClick={() => setShowCreateComic(true)}>
                  Create Your First Comic
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comics.map((comic) => (
                <Card key={comic.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                      {comic.cover_image_url ? (
                        <img
                          src={comic.cover_image_url}
                          alt={comic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Cover</span>
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={comic.status === 'ongoing' ? 'default' : 'secondary'}
                      className="absolute top-2 right-2"
                    >
                      {comic.status}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1 text-sm">{comic.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{comic.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                      <div className="text-center">
                        <div className="font-medium">{comic.total_episodes}</div>
                        <div>Episodes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{comic.total_views}</div>
                        <div>Views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{comic.total_likes}</div>
                        <div>Likes</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => handleEditComic(comic)}
                        title="Edit Comic"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => handleViewComic(comic)}
                        title="View Comic"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => handleCreateEpisode(comic)}
                        title="Add Episode"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Episode
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => handleManageEpisodes(comic)}
                        title="Manage Episodes"
                      >
                        <List className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PublisherAnalytics />
        </TabsContent>
      </Tabs>

      <CreateComicModal
        isOpen={showCreateComic}
        onClose={() => setShowCreateComic(false)}
        onComicCreated={fetchComics}
      />

      <EditComicModal
        isOpen={showEditComic}
        onClose={() => {
          setShowEditComic(false);
          setSelectedComic(null);
        }}
        onComicUpdated={fetchComics}
        comic={selectedComic}
      />

      {selectedComic && (
        <CreateEpisodeModal
          isOpen={showCreateEpisode}
          onClose={() => {
            setShowCreateEpisode(false);
            setSelectedComic(null);
          }}
          onEpisodeCreated={fetchComics}
          comic={{
            id: selectedComic.id,
            title: selectedComic.title,
            totalEpisodes: selectedComic.total_episodes
          }}
        />
      )}
    </div>
  );
};