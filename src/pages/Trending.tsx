import { Navigation } from "@/components/Navigation";
import { WebtoonCard } from "@/components/WebtoonCard";
import { TrendingUp, Zap, Star } from "lucide-react";

const mockTrendingComics = [
  {
    id: "trending-1",
    title: "Mystic Realm Adventures",
    author: "Fantasy Studios",
    coverUrl: "/src/assets/webtoon-hero.jpg",
    genre: "Fantasy",
    rating: 4.9,
    likes: "15.2k",
    views: "120k",
  },
  {
    id: "trending-2", 
    title: "Urban Legends",
    author: "City Comics",
    coverUrl: "/src/assets/action-cover.jpg",
    genre: "Action",
    rating: 4.7,
    likes: "12.8k",
    views: "98k",
  },
  {
    id: "trending-3",
    title: "Hearts & Coffee",
    author: "Romance Studio",
    coverUrl: "/src/assets/romance-cover.jpg",
    genre: "Romance",
    rating: 4.8,
    likes: "9.5k",
    views: "76k",
  },
  {
    id: "trending-4",
    title: "Daily Chronicles",
    author: "Life Studio",
    coverUrl: "/src/assets/slice-life-cover.jpg",
    genre: "Slice of Life",
    rating: 4.6,
    likes: "8.2k",
    views: "65k",
  },
];

export default function Trending() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Trending Comics</h1>
              <Zap className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">
              Discover the hottest webtoons everyone's talking about
            </p>
          </div>

          {/* Trending Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockTrendingComics.map((comic, index) => (
              <div key={comic.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <WebtoonCard
                  title={comic.title}
                  author={comic.author}
                  coverImage={comic.coverUrl}
                  genre={comic.genre}
                  rating={comic.rating}
                  likes={comic.likes}
                  views={comic.views}
                  isNew={index < 2}
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