import { View, Text , ScrollView} from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

const dashboard = () => {
  return (
    <LinearGradient
    colors={['#000000', '#1F2937', '#374151']}
    style={{ flex: 1 }}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
>
<View className="" >
<Text className="text-2xl font-bold text-white">All Expenses</Text>
</View>
    </LinearGradient>
  )
}

export default dashboard