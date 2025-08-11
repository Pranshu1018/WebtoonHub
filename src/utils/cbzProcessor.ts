import JSZip from 'jszip';

export interface ProcessedPanel {
  id: number;
  imageUrl: string;
  fileName: string;
}

/**
 * Processes a CBZ file and extracts individual image panels
 */
export async function processCBZFile(file: File): Promise<ProcessedPanel[]> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    const panels: ProcessedPanel[] = [];
    
    // Get all image files from the zip
    const imageFiles: { name: string; file: JSZip.JSZipObject }[] = [];
    
    zipContent.forEach((relativePath, file) => {
      const extension = relativePath.toLowerCase().split('.').pop();
      if (extension && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
        imageFiles.push({ name: relativePath, file });
      }
    });
    
    // Sort files naturally (handles numeric ordering)
    imageFiles.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    // Process each image file
    for (let i = 0; i < imageFiles.length; i++) {
      const { name, file } = imageFiles[i];
      
      try {
        const arrayBuffer = await file.async('arraybuffer');
        const blob = new Blob([arrayBuffer], { type: `image/${getImageType(name)}` });
        const imageUrl = URL.createObjectURL(blob);
        
        panels.push({
          id: i,
          imageUrl,
          fileName: name
        });
      } catch (error) {
        console.error(`Error processing image ${name}:`, error);
      }
    }
    
    return panels;
  } catch (error) {
    console.error('Error processing CBZ file:', error);
    throw new Error('Failed to process CBZ file. Please ensure it is a valid CBZ archive.');
  }
}

/**
 * Gets the appropriate MIME type for an image file
 */
function getImageType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'gif':
      return 'gif';
    default:
      return 'jpeg';
  }
}

/**
 * Cleans up object URLs to prevent memory leaks
 */
export function cleanupImageUrls(panels: ProcessedPanel[]): void {
  panels.forEach(panel => {
    if (panel.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(panel.imageUrl);
    }
  });
}

/**
 * Uploads processed panels to Supabase storage
 */
export async function uploadPanelsToStorage(
  panels: ProcessedPanel[],
  userId: string,
  episodeId: string,
  supabase: any
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    
    try {
      // Convert blob URL back to file for upload
      const response = await fetch(panel.imageUrl);
      const blob = await response.blob();
      
      const fileName = `${episodeId}-panel-${i.toString().padStart(3, '0')}-${panel.fileName}`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('episode-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('episode-images')
        .getPublicUrl(data.path);
      
      uploadedUrls.push(publicUrl);
    } catch (error) {
      console.error(`Error uploading panel ${i}:`, error);
      throw error;
    }
  }
  
  return uploadedUrls;
}