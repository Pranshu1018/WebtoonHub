import { useEffect, useState } from "react";

export function useVibration() {
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if vibration is supported
    setIsSupported('vibrate' in navigator);
    
    // Load vibration preference
    const vibrationPref = localStorage.getItem('vibration_enabled');
    setIsVibrationEnabled(vibrationPref === 'true');
  }, []);

  const vibrate = (pattern: number | number[]) => {
    if (isSupported && isVibrationEnabled) {
      navigator.vibrate(pattern);
    }
  };

  const toggleVibration = () => {
    const newState = !isVibrationEnabled;
    setIsVibrationEnabled(newState);
    localStorage.setItem('vibration_enabled', newState.toString());
    
    // Give feedback when toggling
    if (newState && isSupported) {
      navigator.vibrate(100);
    }
  };

  // Predefined vibration patterns
  const vibrationPatterns = {
    subtle: [50],
    medium: [100],
    strong: [200],
    double: [100, 100, 100],
    heartbeat: [100, 30, 100, 30, 100],
    notification: [200, 100, 200],
    error: [300, 100, 300, 100, 300],
    success: [100, 50, 100],
    page_turn: [50, 30, 50]
  };

  return {
    isVibrationEnabled,
    isSupported,
    vibrate,
    toggleVibration,
    patterns: vibrationPatterns
  };
}