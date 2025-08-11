import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, X } from "lucide-react";

interface AutoPlayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  nextEpisodeId: string;
}

export function AutoPlayDialog({ isOpen, onClose, onProceed, nextEpisodeId }: AutoPlayDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setIsAutoPlaying(true);
      return;
    }

    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, onProceed]);

  const handleCancel = () => {
    setIsAutoPlaying(false);
    onClose();
  };

  const progress = ((10 - countdown) / 10) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Next Episode
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Episode {nextEpisodeId} will start in
            </p>
            <div className="text-3xl font-bold text-primary">
              {countdown}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              seconds
            </p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onProceed}
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Next Episode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}