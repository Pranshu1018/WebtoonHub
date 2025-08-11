import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, RotateCw, Maximize, Move, Sun } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PanelZoomProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  panelIndex: number;
}

export function PanelZoom({ imageUrl, isOpen, onClose, panelIndex }: PanelZoomProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [fitToScreen, setFitToScreen] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5));
    setFitToScreen(false);
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.1));
    setFitToScreen(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToScreen = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setFitToScreen(true);
  };

  const handleActualSize = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setFitToScreen(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset position and scale when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setFitToScreen(true);
      setBrightness(100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts and wheel zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '=':
        case '+':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;
        case '0':
          e.preventDefault();
          handleActualSize();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFitToScreen();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setBrightness(prev => Math.max(prev - 10, 10));
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          setBrightness(prev => Math.min(prev + 10, 200));
          break;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div ref={containerRef} className="relative w-full h-full overflow-hidden">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleZoomOut} disabled={scale <= 0.1}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleZoomIn} disabled={scale >= 5}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleActualSize}>
            100%
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFitToScreen}>
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm flex items-center gap-2">
            <Move className="w-3 h-3" />
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Close button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Brightness Control */}
        <div className="absolute top-20 left-4 z-10 bg-card p-3 rounded-lg shadow-lg w-48">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4" />
            <span className="text-sm">Brightness</span>
            <span className="text-sm ml-auto">{brightness}%</span>
          </div>
          <Slider
            value={[brightness]}
            min={10}
            max={200}
            step={5}
            onValueChange={(value) => setBrightness(value[0])}
          />
        </div>

        {/* Panel info */}
        <div className="absolute bottom-4 left-4 z-10 bg-card text-card-foreground px-4 py-2 rounded">
          <span className="text-sm">Panel {panelIndex + 1}</span>
        </div>

        {/* Image */}
        <div
          className="w-full h-full flex items-center justify-center cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={`Panel ${panelIndex + 1} - Zoomed`}
            className={`transition-transform duration-200 ${fitToScreen ? 'max-w-full max-h-full object-contain' : 'max-w-none'}`}
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
              cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default'),
              filter: `brightness(${brightness}%)`,
            }}
            draggable={false}
          />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 z-10 bg-card text-card-foreground px-4 py-2 rounded text-sm">
          <div className="font-medium mb-1">Controls:</div>
          <div>+/- or Ctrl+Wheel: Zoom</div>
          <div>R: Rotate</div>
          <div>F: Fit to screen</div>
          <div>0: Actual size</div>
          <div>B/N: Brightness</div>
          <div>Drag to pan</div>
          <div>ESC: Close</div>
        </div>
      </div>
    </div>
  );
}