import React from 'react';
import { Stack } from "expo-router";
import './globals.css';
import { StatusBar, View } from 'react-native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function Layout() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar barStyle={colors?.statusBar || 'light-content'} backgroundColor="transparent" hidden={true}/>
      <View style={{ flex: 1, backgroundColor: colors?.background || '#141218' }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}