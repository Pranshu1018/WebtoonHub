import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Heart, MessageCircle, BookOpen, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const mockNotifications = [
  {
    id: "1",
    type: "new_episode",
    title: "New episode available!",
    message: "Episode 16 of 'Shadow Chronicles' is now live",
    time: "5 minutes ago",
    read: false,
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    id: "2",
    type: "like",
    title: "Someone liked your comment",
    message: "Your comment on 'Mystic Realm' received a like",
    time: "2 hours ago",
    read: false,
    icon: Heart,
    color: "text-red-500",
  },
  {
    id: "3",
    type: "comment",
    title: "New comment reply",
    message: "Someone replied to your comment on 'Urban Legends'",
    time: "1 day ago", 
    read: true,
    icon: MessageCircle,
    color: "text-green-500",
  },
];

export default function Notifications() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-md mx-auto">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Notifications</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to see your notifications and stay updated with your favorite comics.
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">Notifications</h1>
              </div>
              <Button variant="outline" size="sm">
                Mark all as read
              </Button>
            </div>
            <p className="text-muted-foreground text-lg">
              Stay updated with your favorite comics and community
            </p>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {mockNotifications.map((notification, index) => {
              const IconComponent = notification.icon;
              return (
                <Card 
                  key={notification.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-in ${
                    !notification.read ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${notification.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State (if no notifications) */}
          {mockNotifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                You don't have any new notifications right now.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}