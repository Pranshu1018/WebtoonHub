import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface EditComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComicUpdated: () => void;
  comic: {
    id: string;
    title: string;
    description: string;
    genre: string;
    cover_image_url: string;
    status: string;
  } | null;
}

const genres = [
  "Action", "Romance", "Comedy", "Drama", "Fantasy", "Horror", 
  "Mystery", "Sci-Fi", "Slice of Life", "Thriller", "Adventure", "Supernatural"
];

export const EditComicModal = ({ isOpen, onClose, onComicUpdated, comic }: EditComicModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    coverImageUrl: "",
    status: "draft"
  });

  useEffect(() => {
    if (comic) {
      setFormData({
        title: comic.title,
        description: comic.description,
        genre: comic.genre,
        coverImageUrl: comic.cover_image_url || "",
        status: comic.status
      });
    }
  }, [comic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comic) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comics')
        .update({
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          cover_image_url: formData.coverImageUrl,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', comic.id);

      if (error) throw error;

      toast.success("Comic updated successfully!");
      onComicUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating comic:", error);
      toast.error("Failed to update comic");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!comic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">Edit Comic</DialogTitle>
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
                <SelectItem value="hiatus">On Hiatus</SelectItem>
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
              {loading ? "Updating..." : "Update Comic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};