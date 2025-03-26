import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTheme } from '../../../context/ThemeContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useHaptic } from '../../../context/HapticContext';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('payment');
  const { theme, setTheme, colors = { background: '#000000', text: '#E6E1E5', card: '#1C1B1F', border: '#49454F', outline: '#938F99', primary: '#D0BCFF' } } = useTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeOptions = [
    { label: 'Follow System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Pitch Black', value: 'pblack' }
  ];
  const { isHapticEnabled, hapticStrength, toggleHaptic, setHapticStrength, triggerHaptic } = useHaptic();

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear tokens and user data with the correct keys
              await Promise.all([
                AsyncStorage.removeItem('tokens'),
                AsyncStorage.removeItem('user')
              ]);
              // Debugging
              const keys = await AsyncStorage.getAllKeys();
              console.log('AsyncStorage keys after logout:', keys);

              const values = await AsyncStorage.multiGet(keys);
              console.log('AsyncStorage values after logout:', values);

              console.log('navigating to sign-in');
              router.replace('/sign-in');
              console.log('signed out successfully');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Profile Header */}
      <View className="px-4 py-4 mx-4 my-2 rounded-2xl" style={{ backgroundColor: colors.card }}>
        <View className="flex-row items-center">
          <View className="relative">
            <View className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden">
              <View className="w-full h-full bg-gray-700 items-center justify-center">
                <Ionicons name="person" size={36} color="#9CA3AF" />
              </View>
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1.5"
              onPress={() => {
                // Add your image picker logic here
              }}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View className="ml-4 flex-1">
            <Text style={{ color: colors.text }} className="text-xl font-semibold">Sajjan Paudel</Text>
            <Text style={{ color: colors.outline }} className="mt-1">@sajjanpaudel</Text>
            <Text style={{ color: colors.outline }} className="mt-1">sajjanpaudel811@gmail.com</Text>
          </View>
        </View>
      </View>
      <Text className="px-4 py-4 mx-4" style={{ color: colors.text }}> Settings </Text>
      {/* <View className="px-4 py-4 mx-4 my-2 rounded-2xl flex flex-col gap-4" style={{ backgroundColor: colors.card }}> */}
        <View style={{ backgroundColor: colors.card }} className="px-4 py-4 mx-4 my-2 rounded-2xl flex-row items-center justify-between">
          <Text style={{ color: colors.text }} className="text-lg font-medium">Select Theme</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
          >
            <Text style={{ color: colors.text }} className="mr-2">
              {themeOptions.find(option => option.value === theme)?.label}
            </Text>
            <Ionicons
              name={isThemeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {isThemeDropdownOpen && (
        <View style={{ backgroundColor: colors.card }} className="px-4 py-4 mx-4 my-2 rounded-2xl flex-col  justify-between">

            {themeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                className={`p-3 ${index !== themeOptions.length - 1 ? 'border-b border-t' : ''}`}
                style={{ borderColor: colors.border }}
                onPress={() => {
                  setTheme(option.value as 'system' | 'light' | 'dark');
                  setIsThemeDropdownOpen(false);
                }}
              >
                <Text
                  style={{
                    color: theme === option.value ? colors.primary : colors.text
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

<View style={{ backgroundColor: colors.card }} className="px-4 py-4 mx-4 my-2 rounded-2xl flex-row items-center justify-between">
            <Text style={{ color: colors.text }} className="text-lg font-medium">Haptic Feedback</Text>
            <TouchableOpacity
              onPress={toggleHaptic}
              className="flex-row items-center"
            >
              <Text style={{ color: colors.text }} className="mr-2">
                {isHapticEnabled ? 'On' : 'Off'}
              </Text>
              <Ionicons
                name={isHapticEnabled ? 'toggle' : 'toggle-outline'}
                size={24}
                color={isHapticEnabled ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          </View>
        
          {isHapticEnabled && (
        <View style={{ backgroundColor: colors.card }} className="px-4 py-4 mx-4 rounded-2xl">
              <Text style={{ color: colors.text }} className="text-base mb-2">Haptic Strength</Text>
              <View className="flex-row justify-between">
                {(['light', 'medium', 'heavy', 'none'] as const).map((strength) => (
                  <TouchableOpacity
                    key={strength}
                    onPressIn={() => {
                      if (strength !== 'none') {
                        triggerHaptic();
                      }
                      setHapticStrength(strength);
                    }}

                    
                    className={`px-4 py-2 rounded-lg ${
                      hapticStrength === strength ? 'bg-purple-600/20' : ''
                    }`}
                  >
                    <Text
                      style={{
                        color: hapticStrength === strength ? colors.primary : colors.text
                      }}
                      className="capitalize"
                    >
                      {strength}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
      {/* </View> */}
      <View className="px-4 py-4 mx-4 my-2 rounded-2xl mb-4" style={{ backgroundColor: colors.card }}>
        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.text }} className="text-lg font-medium">Sign Out</Text>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  )
}

export default Profile