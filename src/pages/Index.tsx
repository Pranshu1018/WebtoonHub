// Index.tsx
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedSection } from "@/components/FeaturedSection";
import { ContinueReading } from "@/components/ContinueReading";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {searchQuery ? (
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Search Results</h2>
            <p className="text-muted-foreground">
              Showing results for "{searchQuery}"
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Search functionality is coming soon! For now, browse our featured comics below.
            </p>
          </div>
          <FeaturedSection />
        </div>
      ) : (
        <>
          <HeroSection />
          <ContinueReading />
          <FeaturedSection />
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;