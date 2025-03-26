import React, { createContext, useContext, useState } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HapticStrength = 'light' | 'medium' | 'heavy' | 'none';

interface HapticContextType {
  isHapticEnabled: boolean;
  hapticStrength: HapticStrength;
  toggleHaptic: () => void;
  setHapticStrength: (strength: HapticStrength) => void;
  triggerHaptic: () => void;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export const HapticProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [hapticStrength, setHapticStrength] = useState<HapticStrength>('light');

  const toggleHaptic = async () => {
    const newValue = !isHapticEnabled;
    setIsHapticEnabled(newValue);
    await AsyncStorage.setItem('hapticEnabled', JSON.stringify(newValue));
  };

  const updateHapticStrength = async (strength: HapticStrength) => {
    setHapticStrength(strength);
    await AsyncStorage.setItem('hapticStrength', strength);
  };

  const triggerHaptic = () => {
    if (!isHapticEnabled) return;

    switch (hapticStrength) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'none':
        break;
    }
  };

  return (
    <HapticContext.Provider
      value={{
        isHapticEnabled,
        hapticStrength,
        toggleHaptic,
        setHapticStrength: updateHapticStrength,
        triggerHaptic
      }}
    >
      {children}
    </HapticContext.Provider>
  );
};

export const useHaptic = () => {
  const context = useContext(HapticContext);
  if (context === undefined) {
    throw new Error('useHaptic must be used within a HapticProvider');
  }
  return context;
};