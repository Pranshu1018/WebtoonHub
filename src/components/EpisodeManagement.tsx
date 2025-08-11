import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Eye, Trash2, Save, Calendar, BarChart, Heart, Book } from "lucide-react";

interface Episode {
  id: string;
  title: string;
  content_text: string;
  episode_number: number;
  is_published: boolean;
  published_at: string;
  views: number;
  likes: number;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

interface EpisodeManagementProps {
  comicId: string;
  comicTitle: string;
  onBack: () => void;
}

export const EpisodeManagement = ({ comicId, comicTitle, onBack }: EpisodeManagementProps) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEpisode, setEditingEpisode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content_text: "",
    is_published: false
  });

  useEffect(() => {
    fetchEpisodes();
  }, [comicId]);

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('comic_id', comicId)
        .order('episode_number', { ascending: true });

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      toast.error('Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode.id);
    setFormData({
      title: episode.title,
      content_text: episode.content_text || "",
      is_published: episode.is_published
    });
  };

  const handleSave = async (episodeId: string) => {
    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          title: formData.title,
          content_text: formData.content_text,
          is_published: formData.is_published,
          published_at: formData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId);

      if (error) throw error;

      toast.success("Episode updated successfully!");
      setEditingEpisode(null);
      fetchEpisodes();
    } catch (error) {
      console.error('Error updating episode:', error);
      toast.error('Failed to update episode');
    }
  };

  const handleDelete = async (episodeId: string) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) return;

    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId);

      if (error) throw error;

      toast.success("Episode deleted successfully!");
      fetchEpisodes();
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Failed to delete episode');
    }
  };

  const handleTogglePublish = async (episode: Episode) => {
    try {
      const newPublishState = !episode.is_published;
      const { error } = await supabase
        .from('episodes')
        .update({
          is_published: newPublishState,
          published_at: newPublishState ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id);

      if (error) throw error;

      toast.success(`Episode ${newPublishState ? 'published' : 'unpublished'} successfully!`);
      fetchEpisodes();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading episodes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Comics
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{comicTitle}</h2>
          <p className="text-muted-foreground">Manage episodes ({episodes.length} total)</p>
        </div>
      </div>

      <Separator />

      {episodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No episodes created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {episodes.map((episode) => (
            <Card key={episode.id} className="group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">Episode {episode.episode_number}</Badge>
                      <Badge variant={episode.is_published ? "default" : "secondary"}>
                        {episode.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    {editingEpisode === episode.id ? (
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-semibold"
                        placeholder="Episode title"
                      />
                    ) : (
                      <CardTitle className="text-lg">{episode.title}</CardTitle>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {episode.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {episode.likes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingEpisode === episode.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={formData.content_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_text: e.target.value }))}
                        placeholder="Episode content..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                      />
                      <Label>Published</Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {episode.content_text && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {episode.content_text}
                      </p>
                    )}
                    {episode.image_urls && episode.image_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{episode.image_urls.length} images</Badge>
                      </div>
                    )}
                    {episode.published_at && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Published {new Date(episode.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {editingEpisode === episode.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(episode.id)}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingEpisode(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(episode)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={episode.is_published ? "secondary" : "default"}
                        onClick={() => handleTogglePublish(episode)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {episode.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/comic/${comicId}/episode/${episode.id}`, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(episode.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};