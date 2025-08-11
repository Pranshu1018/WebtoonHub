import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Calendar,
  Coins,
  Gift,
  Medal,
  Award,
  Flame
} from "lucide-react";

interface UserProfile {
  total_points: number;
  reading_streak: number;
  last_read_date: string;
  achievements: any;
}

interface Reward {
  id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

export default function Rewards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_points, reading_streak, last_read_date, achievements')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch recent rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    {
      id: 'first_read',
      title: 'First Steps',
      description: 'Read your first episode',
      icon: BookOpen,
      points: 10,
      unlocked: rewards.some(r => r.type === 'reading')
    },
    {
      id: 'streak_3',
      title: 'Getting Started',
      description: 'Read for 3 days in a row',
      icon: Flame,
      points: 50,
      unlocked: (profile?.reading_streak || 0) >= 3
    },
    {
      id: 'streak_7',
      title: 'Dedicated Reader',
      description: 'Read for 7 days in a row',
      icon: Medal,
      points: 100,
      unlocked: (profile?.reading_streak || 0) >= 7
    },
    {
      id: 'points_100',
      title: 'Century Club',
      description: 'Earn 100 total points',
      icon: Award,
      points: 25,
      unlocked: (profile?.total_points || 0) >= 100
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
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
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-text bg-clip-text text-transparent">
                Rewards & Achievements
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Earn points by reading comics and unlock amazing rewards!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">
                  {profile?.total_points || 0}
                </div>
                <p className="text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-500">
                  {profile?.reading_streak || 0}
                </div>
                <p className="text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-yellow-500">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <p className="text-muted-foreground">Achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.unlocked 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted/50 border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          achievement.unlocked 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {achievement.title}
                            </h3>
                            {achievement.unlocked && (
                              <Badge variant="default" className="text-xs">
                                +{achievement.points} pts
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Recent Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Start reading comics to earn your first rewards!
                  </p>
                  <Button 
                    onClick={() => navigate('/')}
                    className="mt-4"
                  >
                    Browse Comics
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <div 
                      key={reward.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/20">
                          <Coins className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{reward.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reward.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        +{reward.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}