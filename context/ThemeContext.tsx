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
    background: '#F1F1F1',
    onBackground: '#1D1B1A',
    surface: '#FFFBFE', // Pure white surface
    onSurface: '#1D1B1A',
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1E192B',
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    outline: '#79747E',
    inverseSurface: '#31302F',
    onInverseSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
    shadow: '#000000', // Black for shadows
    statusBar: 'dark-content' as 'dark-content' | 'light-content',
    card: '#FFFFFF',
    border: '#CAC4D0', // Existing border color
    success: '#146B3A', // Existing success color
    tabBar: '#FFFBFE', // Surface color for tab bar
    surfaceVariant: '#E7E0EC', // Existing surface variant
    onSurfaceVariant: '#49454F', // Existing on surface variant
    text: '#1A1C1E',
  },
  dark: {
    background: '#141218',
    onBackground: '#E6E1E5',
    surface: '#1C1B1F',
    onSurface: '#E6E1E5',
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    outline: '#938F99',
    inverseSurface: '#E6E1E5',
    onInverseSurface: '#31302F',
    inversePrimary: '#6750A4',
    shadow: '#000000',
    statusBar: 'light-content' as 'dark-content' | 'light-content',
    card: '#1C1B1F', // Surface color for cards
    border: '#49454F', // Existing border color
    success: '#7DD491', // Existing success color
    tabBar: '#1C1B1F', // Surface color for tab bar
    surfaceVariant: '#49454F', // Existing surface variant
    onSurfaceVariant: '#CAC4D0', // Existing on surface variant
    text: '#E6E1E5'
  },
  pblack: {
    background: '#000000',
    onBackground: '#E0E0E0',
    surface: '#121212',
    onSurface: '#E0E0E0',
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    outline: '#938F99',
    inverseSurface: '#E0E0E0',
    onInverseSurface: '#121212',
    inversePrimary: '#6750A4',
    shadow: '#000000',
    statusBar: 'light-content' as 'dark-content' | 'light-content',
    card: '#121212', // Surface color for cards
    border: '#1E1E1E', // Existing border color
    success: '#7DD491', // Existing success color
    tabBar: '#121212', // Surface color for tab bar
    surfaceVariant: '#49454F', // Existing surface variant
    onSurfaceVariant: '#CAC4D0', // Adjusted on surface variant for better contrast
    text: '#E6E1E5'
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