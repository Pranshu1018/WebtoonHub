import { Button } from "@/components/ui/button";
import { BookOpen, Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:scale-105 transition-transform duration-300 w-fit">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-hero">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                WebtoonHub
              </span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Your gateway to the most amazing webtoons from around the world. 
              Discover, read, and fall in love with incredible stories.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-110">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-110">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-110">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all duration-300 hover:scale-110">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold mb-4">Browse</h3>
            <ul className="space-y-2">
              <li><a href="#trending" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Trending</a></li>
              <li><a href="#new-releases" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">New Releases</a></li>
              <li><a href="#popular" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Popular</a></li>
              <li><a href="#completed" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Completed</a></li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold mb-4">Genres</h3>
            <ul className="space-y-2">
              <li><a href="#genre-romance" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Romance</a></li>
              <li><a href="#genre-action" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Action</a></li>
              <li><a href="#genre-fantasy" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Fantasy</a></li>
              <li><a href="#genre-slice-of-life" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Slice of Life</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#help" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Help Center</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Contact Us</a></li>
              <li><a href="#privacy" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Privacy Policy</a></li>
              <li><a href="#terms" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground">
          <p>&copy; 2024 WebtoonHub. All rights reserved. Made with ❤️ for webtoon lovers.</p>
        </div>
      </div>
    </footer>
  );
}