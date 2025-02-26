import { View, Text, TouchableOpacity, Switch} from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTheme } from '../../../context/ThemeContext'

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Profile Header */}
      <View className="px-4 py-4 mx-4 my-2 rounded-2xl" style={{ backgroundColor: colors.card}}>
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
      <Text className="px-4 py-4 mx-4" style={{color: colors.text }}> Settings </Text>
      <View className="px-4 py-4 mx-4 my-2 rounded-2xl mb-4" style={{backgroundColor:colors.card}}>
        <View className="flex-row items-center justify-between">
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
          <View 
            className="mt-2 rounded-lg overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
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
      </View>

    </View>
  )
}

export default Profile