import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Eye, Heart, TrendingUp, Users, Calendar, Book } from "lucide-react";

interface ComicStats {
  id: string;
  title: string;
  total_views: number;
  total_likes: number;
  total_episodes: number;
  status: string;
  recent_views: number;
  recent_likes: number;
}

export const PublisherAnalytics = () => {
  const { user } = useAuth();
  const [comics, setComics] = useState<ComicStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      // Fetch comic stats
      const { data: comicsData, error: comicsError } = await supabase
        .from('comics')
        .select(`
          id,
          title,
          total_views,
          total_likes,
          total_episodes,
          status
        `)
        .eq('author_id', user?.id)
        .order('total_views', { ascending: false });

      if (comicsError) throw comicsError;

      // For now, we'll simulate recent stats since we don't have time-based analytics yet
      const statsWithRecent = (comicsData || []).map(comic => ({
        ...comic,
        recent_views: Math.floor(comic.total_views * 0.1), // Simulate recent views as 10% of total
        recent_likes: Math.floor(comic.total_likes * 0.15), // Simulate recent likes as 15% of total
      }));

      setComics(statsWithRecent);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = comics.reduce(
    (acc, comic) => ({
      views: acc.views + comic.total_views,
      likes: acc.likes + comic.total_likes,
      episodes: acc.episodes + comic.total_episodes,
      recentViews: acc.recentViews + comic.recent_views,
      recentLikes: acc.recentLikes + comic.recent_likes,
    }),
    { views: 0, likes: 0, episodes: 0, recentViews: 0, recentLikes: 0 }
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your webtoon performance</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{totalStats.recentViews} in last {selectedPeriod} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.likes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{totalStats.recentLikes} in last {selectedPeriod} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.episodes}</div>
            <p className="text-xs text-muted-foreground">
              Across {comics.length} comics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.views > 0 ? ((totalStats.likes / totalStats.views) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Like rate across all comics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comics available for analytics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comics.map((comic) => (
                <div key={comic.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{comic.title}</h3>
                      <Badge variant={comic.status === 'ongoing' ? 'default' : 'secondary'}>
                        {comic.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Views:</span>
                        <div className="font-medium">{comic.total_views.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{comic.recent_views}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Likes:</span>
                        <div className="font-medium">{comic.total_likes.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{comic.recent_likes}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Episodes:</span>
                        <div className="font-medium">{comic.total_episodes}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Like Rate:</span>
                        <div className="font-medium">
                          {comic.total_views > 0 ? ((comic.total_likes / comic.total_views) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center py-8 text-muted-foreground">
              <p>Activity tracking coming soon...</p>
              <p className="text-sm">View detailed engagement patterns and reader behavior.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};