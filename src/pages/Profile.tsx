import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit, BookOpen, Heart, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [favoritesRes, progressRes] = await Promise.all([
        supabase.from("favorites").select("id").eq("user_id", user.id),
        supabase.from("reading_progress").select("id").eq("user_id", user.id),
      ]);
      return {
        favorites: favoritesRes.data?.length || 0,
        comicsRead: progressRes.data?.length || 0,
        readingTime: "24h", // TODO: calculate from actual data
      };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-md mx-auto">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to view and manage your profile.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (profileLoading || statsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (profileError || statsError) {
    return <div className="p-6 text-red-500">Error loading profile</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-12">
        <Card>
          <CardHeader className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.username}</CardTitle>
              <Badge>{profile?.role || "Reader"}</Badge>
            </div>
            <Link to="/edit-profile" className="ml-auto">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <Heart className="mb-2" />
              <span>{stats?.favorites} Favorites</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="mb-2" />
              <span>{stats?.comicsRead} Comics Read</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="mb-2" />
              <span>{stats?.readingTime} Reading Time</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
