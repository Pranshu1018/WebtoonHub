import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "./FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { X } from "lucide-react";

interface CreateEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEpisodeCreated: () => void;
  comic: {
    id: string;
    title: string;
    totalEpisodes: number;
  };
}

export const CreateEpisodeModal = ({ isOpen, onClose, onEpisodeCreated, comic }: CreateEpisodeModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    contentText: "",
    publishImmediately: false,
    imageUrls: "",
    uploadedFiles: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Combine uploaded files and manual URLs
      const imageUrlsArray = [
        ...formData.uploadedFiles,
        ...formData.imageUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0)
      ];

      const { error } = await supabase
        .from('episodes')
        .insert({
          comic_id: comic.id,
          title: formData.title,
          content_text: formData.contentText,
          episode_number: comic.totalEpisodes + 1,
          is_published: formData.publishImmediately,
          image_urls: imageUrlsArray
        });

      if (error) throw error;

      toast.success("Episode created successfully!");
      setFormData({ title: "", contentText: "", publishImmediately: false, imageUrls: "", uploadedFiles: [] });
      onEpisodeCreated();
      onClose();
    } catch (error) {
      console.error("Error creating episode:", error);
      toast.error("Failed to create episode");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">
            Create New Episode
            <div className="text-sm text-muted-foreground font-normal">
              {comic.title} - Episode {comic.totalEpisodes + 1}
            </div>
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="episodeTitle" className="text-foreground">Episode Title</Label>
            <Input
              id="episodeTitle"
              placeholder="Enter episode title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentText" className="text-foreground">Content Text</Label>
            <Textarea
              id="contentText"
              placeholder="Enter episode content/dialogue"
              value={formData.contentText}
              onChange={(e) => handleInputChange("contentText", e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
            />
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="urls">Image URLs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Upload Images or CBZ Files</Label>
                <FileUpload
                  onFilesUploaded={(urls) => handleInputChange("uploadedFiles", urls)}
                  bucketName="episode-images"
                  maxFiles={50}
                />
              </div>
            </TabsContent>

            <TabsContent value="urls" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrls" className="text-foreground">Image URLs</Label>
                <Textarea
                  id="imageUrls"
                  placeholder="Enter image URLs (one per line)"
                  value={formData.imageUrls}
                  onChange={(e) => handleInputChange("imageUrls", e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Switch
              id="publishImmediately"
              checked={formData.publishImmediately}
              onCheckedChange={(checked) => handleInputChange("publishImmediately", checked)}
            />
            <Label htmlFor="publishImmediately" className="text-foreground">
              Publish immediately
            </Label>
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
              Create Episode
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};