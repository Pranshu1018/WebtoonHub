import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WebtoonCard } from "@/components/WebtoonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Filter, X } from "lucide-react";

const mockSearchResults = [
  {
    id: "search-1",
    title: "Shadow Chronicles",
    author: "Dark Studios",
    coverUrl: "/lovable-uploads/7442201e-ed69-483a-ae59-78e8665b5c8e.png",
    genre: "Action",
    rating: 4.8,
    likes: "5.2k",
    views: "45k",
  },
];

const popularTags = ["Romance", "Action", "Fantasy", "Comedy", "Drama", "Horror"];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <SearchIcon className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Search Comics</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find your next favorite webtoon
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for comics, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Genre Filters */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Popular Genres</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                  {selectedGenres.includes(genre) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Comics"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockSearchResults.map((comic, index) => (
              <div key={comic.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <WebtoonCard
                  title={comic.title}
                  author={comic.author}
                  coverImage={comic.coverUrl}
                  genre={comic.genre}
                  rating={comic.rating}
                  likes={comic.likes}
                  views={comic.views}
                  onClick={() => window.location.href = `/comic/${comic.id}/episode/1`}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}