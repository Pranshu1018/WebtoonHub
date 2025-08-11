import { useEffect, useState } from "react";
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReadingProgress {
  currentPanel: number;
  scrollPosition: number;
  lastReadTime: number;
  isCompleted: boolean;
}

export function useReadingProgress(slug: string, episodeId: string) {
  const { user } = useAuth();
  const storageKey = `reading_progress_${slug}_${episodeId}`;
  const [isLoading, setIsLoading] = useState(false);
  
  const [progress, setProgress] = useState<ReadingProgress>({
    currentPanel: 0,
    scrollPosition: 0,
    lastReadTime: Date.now(),
    isCompleted: false
  });

  // Load progress from backend or localStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!slug || !episodeId) return;
      
      setIsLoading(true);
      
      if (user) {
        // Try to load from database
        const { data } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('comic_slug', slug)
          .eq('episode_id', episodeId)
          .single();
        
        if (data) {
          const progressPercentage = data.progress_percentage || 0;
          setProgress({
            currentPanel: Math.floor(progressPercentage * 100),
            scrollPosition: 0, // We'll handle scroll separately
            lastReadTime: new Date(data.last_read_at).getTime(),
            isCompleted: progressPercentage >= 1
          });
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setProgress(parsed);
          } catch (error) {
            console.error('Error parsing reading progress:', error);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    loadProgress();
  }, [user, slug, episodeId, storageKey]);

  // Save progress to backend or localStorage
  const saveProgress = async (newProgress: Partial<ReadingProgress>) => {
    const updatedProgress = {
      ...progress,
      ...newProgress,
      lastReadTime: Date.now()
    };
    setProgress(updatedProgress);
    
    if (user) {
      // Save to database
      const progressPercentage = Math.min(1, Math.max(0, (newProgress.currentPanel || 0) / 100));
      
      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          comic_slug: slug,
          episode_id: episodeId,
          progress_percentage: progressPercentage,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,comic_slug,episode_id'
        });
    } else {
      // Fallback to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
    }
  };

  // Mark episode as completed
  const markCompleted = () => {
    saveProgress({ isCompleted: true, currentPanel: 100 });
  };

  // Get all reading progress for a series
  const getSeriesProgress = (seriesSlug: string) => {
    const allProgress: Record<string, ReadingProgress> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`reading_progress_${seriesSlug}_`)) {
        const episodeId = key.split('_').pop();
        const progressData = localStorage.getItem(key);
        if (progressData && episodeId) {
          try {
            allProgress[episodeId] = JSON.parse(progressData);
          } catch (error) {
            console.error('Error parsing progress for episode:', episodeId, error);
          }
        }
      }
    }
    return allProgress;
  };

  return {
    progress,
    saveProgress,
    markCompleted,
    getSeriesProgress,
    isLoading
  };
}