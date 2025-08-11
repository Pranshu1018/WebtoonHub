import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "lucide-react";

interface CreateComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComicCreated: () => void;
}

const genres = [
  "Action", "Romance", "Comedy", "Drama", "Fantasy", "Horror", 
  "Mystery", "Sci-Fi", "Slice of Life", "Thriller", "Adventure", "Supernatural"
];

export const CreateComicModal = ({ isOpen, onClose, onComicCreated }: CreateComicModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    coverImageUrl: "",
    status: "draft"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { error } = await supabase
        .from('comics')
        .insert({
          title: formData.title,
          slug,
          description: formData.description,
          genre: formData.genre,
          cover_image_url: formData.coverImageUrl,
          status: formData.status,
          author_id: user.id
        });

      if (error) throw error;

      toast.success("Comic created successfully!");
      setFormData({ title: "", description: "", genre: "", coverImageUrl: "", status: "draft" });
      onComicCreated();
      onClose();
    } catch (error) {
      console.error("Error creating comic:", error);
      toast.error("Failed to create comic");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">Create New Comic</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              placeholder="Enter comic title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter comic description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-foreground">Genre</Label>
            <Select value={formData.genre} onValueChange={(value) => handleInputChange("genre", value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl" className="text-foreground">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              placeholder="https://example.com/cover.jpg"
              value={formData.coverImageUrl}
              onChange={(e) => handleInputChange("coverImageUrl", e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              Create Comic
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};