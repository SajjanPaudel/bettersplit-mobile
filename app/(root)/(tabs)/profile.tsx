import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('payment');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment':
        return (
          <View className="bg-purple-900/10 rounded-xl p-4 backdrop-blur-md border border-gray-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">Bank Account</Text>
              <TouchableOpacity>
                <Ionicons name="add-circle-outline" size={24} color="#9333EA" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400">No payment methods added yet</Text>
          </View>
        );
      case 'settlements':
        return (
          <View className="bg-purple-900/10 rounded-xl p-4 backdrop-blur-md border border-gray-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">Recent Settlements</Text>
              <TouchableOpacity>
                <Ionicons name="filter-outline" size={24} color="#9333EA" />
              </TouchableOpacity>
            </View>
            <View className="border-t border-gray-800 mt-2 pt-3">
              <Text className="text-gray-400">No pending settlements</Text>
            </View>
          </View>
        );
      case 'activities':
        return (
          <View className="bg-purple-900/10 rounded-xl p-4 backdrop-blur-md border border-gray-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">Recent Activities</Text>
              <TouchableOpacity>
                <Ionicons name="calendar-outline" size={24} color="#9333EA" />
              </TouchableOpacity>
            </View>
            <View className="border-t border-gray-800 mt-2 pt-3">
              <Text className="text-gray-400">No recent activities</Text>
            </View>
          </View>
        );
    }
  };

  return (
      <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#000000', '#1F2937', '#374151']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Profile Header */}
        <View className="px-4 py-4 mx-4 my-2 bg-purple-900/10 rounded-2xl  backdrop-blur-md border border-gray-800">
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
              <Text className="text-white text-xl font-semibold">Sajjan Paudel</Text>
              <Text className="text-gray-400 mt-1">@sajjanpaudel</Text>
              <Text className="text-gray-400 mt-1">sajjanpaudel811@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* Profile Content */}
        <View className="flex-1 px-4">
          {/* Tab Headers */}
          <View className="flex-row border-b border-gray-800">
            <TouchableOpacity 
              className={`px-4 py-3 border-b-2 ${activeTab === 'payment' ? 'border-purple-500' : 'border-transparent'}`}
              onPress={() => setActiveTab('payment')}
            >
              <Text className={activeTab === 'payment' ? 'text-purple-500 font-medium' : 'text-gray-400'}>
                Payment Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-4 py-3 border-b-2 ${activeTab === 'settlements' ? 'border-purple-500' : 'border-transparent'}`}
              onPress={() => setActiveTab('settlements')}
            >
              <Text className={activeTab === 'settlements' ? 'text-purple-500 font-medium' : 'text-gray-400'}>
                Settlements
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-4 py-3 border-b-2 ${activeTab === 'activities' ? 'border-purple-500' : 'border-transparent'}`}
              onPress={() => setActiveTab('activities')}
            >
              <Text className={activeTab === 'activities' ? 'text-purple-500 font-medium' : 'text-gray-400'}>
                Activities
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View className="flex-1 pt-4">
            {renderTabContent()}
          </View>
        </View>
        </LinearGradient> 
      </SafeAreaView>
  )
}

export default Profile