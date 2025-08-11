import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, File, Image } from "lucide-react";
import { processCBZFile, cleanupImageUrls, uploadPanelsToStorage } from "@/utils/cbzProcessor";

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  acceptedFileTypes?: { [key: string]: string[] };
  maxFiles?: number;
  bucketName: string;
}

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

export const FileUpload = ({ 
  onFilesUploaded, 
  acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    'application/x-cbz': ['.cbz']
  },
  maxFiles = 50,
  bucketName
}: FileUploadProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('FileUpload: Files dropped:', acceptedFiles.length);
    const newFiles: UploadFile[] = acceptedFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      const preview = isImage ? URL.createObjectURL(file) : undefined;
      console.log(`FileUpload: Processing file ${file.name}, isImage: ${isImage}, preview: ${preview}`);
      return {
        file,
        preview,
        progress: 0,
        status: 'pending'
      };
    });

    console.log('FileUpload: Setting files:', newFiles);
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        setFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { ...f, status: 'uploading' } : f
          )
        );

        // Check if file is a CBZ
        if (fileData.file.name.toLowerCase().endsWith('.cbz')) {
          try {
            // Process CBZ file
            const panels = await processCBZFile(fileData.file);
            
            if (panels.length === 0) {
              throw new Error('No images found in CBZ file');
            }

            // Generate a unique episode ID for this upload session
            const episodeId = `episode_${Date.now()}_${i}`;
            
            // Upload all panels to storage
            const panelUrls = await uploadPanelsToStorage(panels, user.id, episodeId, supabase);
            
            // Add all panel URLs to the result
            uploadedUrls.push(...panelUrls);
            
            // Cleanup blob URLs
            cleanupImageUrls(panels);
            
            toast.success(`CBZ file processed: ${panels.length} panels extracted`);
          } catch (error) {
            console.error('CBZ processing error:', error);
            throw new Error(`Failed to process CBZ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          // Handle regular image files
          const fileName = `${Date.now()}-${fileData.file.name}`;
          const filePath = `${user.id}/${fileName}`;

          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileData.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        }

        setFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      }

      onFilesUploaded(uploadedUrls);
      toast.success(`${files.length} file(s) uploaded successfully!`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      setFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' ? { ...f, status: 'error' } : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    files.forEach(f => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-foreground">Drag & drop files here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supports: JPG, PNG, WebP, CBZ (max {maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Files ({files.length})</h4>
            <div className="flex gap-2">
              <Button 
                onClick={uploadFiles} 
                disabled={isUploading || files.every(f => f.status === 'success')}
                size="sm"
              >
                Upload All
              </Button>
              <Button 
                onClick={clearFiles} 
                variant="outline" 
                size="sm"
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {files.map((fileData, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {fileData.preview ? (
                    <div className="w-10 h-10 border border-primary/50 rounded overflow-hidden">
                      <img 
                        src={fileData.preview} 
                        alt={fileData.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <File className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {fileData.status === 'uploading' && (
                    <Progress value={fileData.progress} className="w-full h-1 mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {fileData.status === 'success' && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                  {fileData.status === 'error' && (
                    <span className="text-xs text-red-600">✗</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};