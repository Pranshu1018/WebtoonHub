import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Sun, 
  Eye, 
  Palette, 
  Layout,
  Space,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface ReaderPreferences {
  brightness: number;
  contrast: number;
  backgroundColor: 'dark' | 'black' | 'sepia' | 'white';
  readingDirection: 'vertical' | 'horizontal';
  panelSpacing: number;
  soundEnabled: boolean;
}

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: ReaderPreferences;
  onUpdatePreferences: (prefs: Partial<ReaderPreferences>) => void;
  onJumpToPanel: (index: number) => void;
  totalPanels: number;
  currentPanel: number;
}

export function ReaderSettings({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onJumpToPanel,
  totalPanels,
  currentPanel
}: ReaderSettingsProps) {
  const [jumpInput, setJumpInput] = useState(currentPanel + 1);

  if (!isOpen) return null;

  const resetPreferences = () => {
    onUpdatePreferences({
      brightness: 100,
      contrast: 100,
      backgroundColor: 'dark',
      readingDirection: 'vertical',
      panelSpacing: 16,
      soundEnabled: true,
    });
  };

  const handleJumpToPanel = () => {
    const panelIndex = Math.max(1, Math.min(totalPanels, jumpInput)) - 1;
    onJumpToPanel(panelIndex);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Reader Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <ScrollArea className="h-[500px]">
          <CardContent className="space-y-6">
            {/* Display Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <Label className="text-base font-medium">Display</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brightness">Brightness: {preferences.brightness}%</Label>
                  <Slider
                    id="brightness"
                    min={50}
                    max={150}
                    step={5}
                    value={[preferences.brightness]}
                    onValueChange={([value]) => onUpdatePreferences({ brightness: value })}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contrast">Contrast: {preferences.contrast}%</Label>
                  <Slider
                    id="contrast"
                    min={50}
                    max={150}
                    step={5}
                    value={[preferences.contrast]}
                    onValueChange={([value]) => onUpdatePreferences({ contrast: value })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Background Color
                </Label>
                <Select
                  value={preferences.backgroundColor}
                  onValueChange={(value: 'dark' | 'black' | 'sepia' | 'white') => 
                    onUpdatePreferences({ backgroundColor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="sepia">Sepia</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Layout Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <Label className="text-base font-medium">Layout</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Reading Direction</Label>
                <Select
                  value={preferences.readingDirection}
                  onValueChange={(value: 'vertical' | 'horizontal') => 
                    onUpdatePreferences({ readingDirection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical (Recommended)</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Space className="w-4 h-4" />
                  Panel Spacing: {preferences.panelSpacing}px
                </Label>
                <Slider
                  min={0}
                  max={40}
                  step={4}
                  value={[preferences.panelSpacing]}
                  onValueChange={([value]) => onUpdatePreferences({ panelSpacing: value })}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Audio Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <Label className="text-base font-medium">Audio</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle">Sound Effects</Label>
                <Switch
                  id="sound-toggle"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => onUpdatePreferences({ soundEnabled: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* Navigation */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Quick Navigation</Label>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="panel-jump" className="text-sm">
                  Jump to Panel:
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJumpInput(Math.max(1, jumpInput - 1))}
                    disabled={jumpInput <= 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                  <input
                    id="panel-jump"
                    type="number"
                    min={1}
                    max={totalPanels}
                    value={jumpInput}
                    onChange={(e) => setJumpInput(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-center border rounded text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJumpInput(Math.min(totalPanels, jumpInput + 1))}
                    disabled={jumpInput >= totalPanels}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    of {totalPanels}
                  </span>
                </div>
                <Button variant="default" size="sm" onClick={handleJumpToPanel}>
                  Go
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Currently viewing panel {currentPanel + 1}
              </div>
            </div>

            <Separator />

            {/* Reset Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Reset</Label>
              <Button
                variant="outline"
                onClick={resetPreferences}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Default Settings
              </Button>
            </div>

            {/* Usage Tips */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Tips:</Label>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use F key to toggle fullscreen mode</li>
                <li>• Arrow keys or scroll wheel to navigate</li>
                <li>• Click panels to zoom in for detail</li>
                <li>• Swipe up/down on mobile to scroll</li>
                <li>• Use auto-scroll for hands-free reading</li>
              </ul>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}