import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

const expense = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const { colors = { background: '#141218', text: '#E6E1E5', card: '#1C1B1F', border: '#49454F', primary: '#D0BCFF', secondary: '#4A4458', error: '#F2B8B5', success: '#7DD491', tabBar: '#1C1B1F', surface: '#141218', surfaceVariant: '#49454F', outline: '#938F99', onPrimary: '#381E72', onSurface: '#E6E1E5', statusBar: 'light-content' } } = useTheme();

  // Example groups - replace with your actual data
  const groups = ['All Groups', 'Family', 'Friends', 'Work'];

  return (
      <View className="p-4 h-full" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }} className="text-2xl font-bold mt-10 mb-4">Add New Expense</Text>
        
        <View className="relative">
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 rounded-xl" 
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border
            }}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={{ color: colors.text }} className="text-lg">{selectedGroup}</Text>
            <Ionicons 
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View 
              className="absolute top-16 left-0 right-0 rounded-xl overflow-hidden z-10"
              style={{
                backgroundColor: colors.card,
                // borderColor: colors.border,
                borderWidth: 1
              }}>
              {groups.map((group, index) => (
                <TouchableOpacity
                  key={index}
                  className="p-4 border-b active:bg-purple-900/20"
                  // style={{ borderColor: colors.border }}
                  onPress={() => {
                    setSelectedGroup(group);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{group}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
  )
}

export default expense