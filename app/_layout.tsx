import React, { useEffect, useState } from 'react';
import { Stack, Slot } from "expo-router";
import './globals.css';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HapticProvider } from '../context/HapticContext';

// Define the type for the user
interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any; // For any additional properties
}

// Define the type for the auth context
interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

// Create the context with a default value matching the type
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokensString = await AsyncStorage.getItem('tokens');
        const userString = await AsyncStorage.getItem('user');
        
        if (tokensString && userString) {
          setUser(JSON.parse(userString));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    await AsyncStorage.removeItem('tokens');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  // Create the value object with the correct type
  const authContextValue: AuthContextType = {
    user,
    signOut,
    isLoading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function Layout() {
  const { colors } = useTheme();
  const { isLoading, user } = useAuth();

  if (isLoading) {
    // Show a loading screen
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors?.background || '#141218',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ActivityIndicator size="large" color={colors?.primary || '#D0BCFF'} />
      </View>
    );
  }

  // Use conditional rendering instead of navigation
  return (
    <>
      <StatusBar barStyle={colors?.statusBar || 'light-content'} backgroundColor="transparent" hidden={true}/>
      <View style={{ flex: 1, backgroundColor: colors?.background || '#141218' }}>
        {user ? (
          // User is authenticated, show the main app
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(root)/(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)/group/[id]" options={{ headerShown: false }} />
          </Stack>
        ) : (
          // User is not authenticated, show auth screens
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          </Stack>
        )}
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <HapticProvider>
      <ThemeProvider>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ThemeProvider>
    </HapticProvider>
  );
}