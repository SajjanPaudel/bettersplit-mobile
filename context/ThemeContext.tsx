import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeType = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: typeof themes.dark | typeof themes.light;
}

const themes = {
  light: {
    background: '#FDFCFF',
    text: '#1A1C1E',
    primary: '#6750A4',
    secondary: '#E8DEF8',
    card: '#E0E0E0',
    border: '#CAC4D0',
    error: '#B3261E',
    success: '#146B3A',
    tabBar: '#E0E0E0',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    outline: '#79747E',
    onPrimary: '#F5F5F5',
    onSurface: '#1C1B1F',
    statusBar: 'dark-content' as 'dark-content' | 'light-content',
  },
  dark: {
    background: '#141218',
    text: '#E6E1E5',
    primary: '#D0BCFF',
    secondary: '#4A4458',
    card: '#1C1B1F',
    border: '#49454F',
    error: '#F2B8B5',
    success: '#7DD491',
    tabBar: '#1C1B1F',
    surface: '#141218',
    surfaceVariant: '#49454F',
    outline: '#938F99',
    onPrimary: '#381E72',
    onSurface: '#E6E1E5',
    statusBar: 'light-content' as 'dark-content' | 'light-content',
  },
  pblack: {
    background: '#000000',
    text: '#E6E1E5',
    primary: '#D0BCFF',
    secondary: '#4A4458',
    card: '#121212',
    border: '#1E1E1E',
    error: '#F2B8B5',
    success: '#7DD491',
    tabBar: '#121212',
    surface: '#141218',
    surfaceVariant: '#49454F',
    outline: '#938F99',
    onPrimary: '#381E72',
    onSurface: '#E6E1E5',
    statusBar: 'light-content' as 'dark-content' | 'light-content',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    loadTheme();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as ThemeType);
      }
      const colorScheme = Appearance.getColorScheme();
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme === 'system' ? systemTheme : theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};