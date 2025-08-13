import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Menu, User, Bell, BookOpen, X, LogOut, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-hero animate-pulse">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                WebtoonHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {user && (
                <Link to="/favorites" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                  Favorites
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
              {user && (
                <Link to="/publisher" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group flex items-center">
                  📝 Publish
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
              <Link to="/trending" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                Trending
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {user && (
                <Link to="/rewards" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group flex items-center">
                  🏆 Rewards
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
              <Link to="/genres" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                Genres
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/new-releases" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                New Releases
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              {user && (
                <Link to="/notifications" className="text-muted-foreground hover:text-primary transition-all duration-300 relative group">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/20 hover:text-primary transition-all duration-300"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              {user && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-primary/20 hover:text-primary transition-all duration-300"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-accent animate-pulse" />
                </Button>
              )}

              {user && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary">🪙</span>
                  <span className="text-muted-foreground">0</span>
                </div>
              )}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="webtoon" size="sm" className="hover:scale-105 transition-transform duration-300">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="webtoon" 
                  size="sm" 
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => navigate('/auth')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-primary/20 hover:text-primary transition-all duration-300"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Link 
                to="/" 
                className="block text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              {user && (
                <Link 
                  to="/favorites" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Favorites
                </Link>
              )}
              {user && (
                <Link 
                  to="/publisher" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Upload className="w-4 h-4 mr-2 inline" />
                  Publisher
                </Link>
              )}
              <Link 
                to="/trending" 
                className="block text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Trending
              </Link>
              {user && (
                <Link 
                  to="/rewards" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  🏆 Rewards
                </Link>
              )}
              <Link 
                to="/genres" 
                className="block text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Genres
              </Link>
              <Link 
                to="/new-releases" 
                className="block text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                New Releases
              </Link>
              {user && (
                <Link 
                  to="/notifications" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Notifications
                </Link>
              )}
              {user && (
                <Link 
                  to="/profile" 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile
                </Link>
              )}
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setShowSearch(true);
                  setShowMobileMenu(false);
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300">
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-lg shadow-hero p-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
                    Search Webtoons
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSearch(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <form onSubmit={handleSearch} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Search for webtoons, authors, genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-lg p-4"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <Button type="submit" variant="hero" size="lg" className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => setShowSearch(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}