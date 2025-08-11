import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileImage, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface PublisherUploadProps {
  comicId: string;
  episodeId: string;
  onUploadComplete?: () => void;
}

export const PublisherUpload = ({ comicId, episodeId, onUploadComplete }: PublisherUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'cbz';
      const bucket = fileType === 'image' ? 'publisher-images' : 'publisher-cbz';
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${episodeId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Save to publisher_content table
      const { error: dbError } = await supabase
        .from('publisher_content')
        .insert({
          publisher_id: user.id,
          comic_id: comicId,
          episode_id: episodeId,
          file_type: fileType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          is_published: false
        });

      if (dbError) throw dbError;

      toast.success(`${fileType === 'image' ? 'Image' : 'CBZ file'} uploaded successfully`);
      onUploadComplete?.();
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const isValidImage = file.type.startsWith('image/');
    const isValidCBZ = file.name.toLowerCase().endsWith('.cbz');
    
    if (!isValidImage && !isValidCBZ) {
      toast.error('Please select an image or CBZ file');
      return;
    }

    uploadFile(file);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select Image or CBZ File</Label>
          <Input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            accept="image/*,.cbz"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileImage className="h-4 w-4" />
            Images
          </div>
          <div className="flex items-center gap-1">
            <Archive className="h-4 w-4" />
            CBZ Files
          </div>
        </div>
      </CardContent>
    </Card>
  );
};