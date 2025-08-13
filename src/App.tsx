// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ComicDetail from "./pages/ComicDetail";
import ComicReader from "./components/ComicReader";
import Auth from "./pages/Auth";
import Publisher from "./pages/Publisher";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";

// Add these imports
import Favorites from "./pages/Favourites";
import Genres from "./pages/Genres";
import NewReleases from "./pages/NewRelease";
import Notifications from "./pages/Notification";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Trending from "./pages/Trending";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/publisher" element={<Publisher />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/comic/:slug" element={<ComicDetail />} />
          <Route path="/comic/:slug/episode/:episodeId" element={<ComicReader />} />
          
          {/* Add new routes */}
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genres/:genre" element={<Genres />} />
          <Route path="/new-releases" element={<NewReleases />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          // In your App.tsx routes
<Route path="/comic/:id" element={<ComicDetail />} />
<Route path="/comic/:id/chapter/:chapterId" element={<ComicReader />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;