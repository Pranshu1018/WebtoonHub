import { useEffect, useRef, useState } from "react";

export function useAutoScroll(containerRef: React.RefObject<HTMLDivElement>) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // pixels per frame
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoScroll = () => {
    if (!containerRef.current) return;
    
    setIsAutoScrolling(true);
    intervalRef.current = setInterval(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;
        
        if (container.scrollTop >= maxScroll) {
          // Reached the end, stop auto-scroll
          stopAutoScroll();
          return;
        }
        
        container.scrollTop += scrollSpeed;
      }
    }, 16); // ~60fps
  };

  const stopAutoScroll = () => {
    setIsAutoScrolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleAutoScroll = () => {
    if (isAutoScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pause auto-scroll when user manually scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      if (isAutoScrolling) {
        stopAutoScroll();
      }
    };

    container.addEventListener('wheel', handleUserScroll);
    container.addEventListener('touchmove', handleUserScroll);

    return () => {
      container.removeEventListener('wheel', handleUserScroll);
      container.removeEventListener('touchmove', handleUserScroll);
    };
  }, [isAutoScrolling]);

  return {
    isAutoScrolling,
    scrollSpeed,
    setScrollSpeed,
    startAutoScroll,
    stopAutoScroll,
    toggleAutoScroll
  };
}