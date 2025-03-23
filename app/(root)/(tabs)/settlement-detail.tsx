import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SettlementDetail() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  // Mock settlement data - replace with actual data fetching
  const settlement = {
    id: '1',
    totalAmount: 1234.56,
    date: '2024-01-20',
    participants: [
      { name: 'Sajjan', amount: 500.00, status: 'to_receive' },
      { name: 'Sayun', amount: -300.00, status: 'to_pay' },
      { name: 'Ishu', amount: 200.00, status: 'to_receive' },
    ],
    notes: 'Monthly settlement'
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.card }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-lg font-semibold">Settlement Details</Text>
          <TouchableOpacity 
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.card }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4">
          <Animated.View entering={FadeInUp.delay(100)} className="mt-4">
            {/* Total Settlement Amount */}
            <View 
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.outline }} className="text-sm mb-2">
                Total Settlement Amount
              </Text>
              <Text style={{ color: colors.text }} className="text-3xl font-bold">
                Rs {Math.abs(settlement.totalAmount).toFixed(2)}
              </Text>
              <Text style={{ color: colors.outline }} className="text-sm mt-2">
                {settlement.date}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} className="mt-6">
            {/* Settlement Details */}
            <View 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                Settlement Details
              </Text>
              {settlement.participants.map((participant, index) => (
                <View key={index} className="flex-row items-center justify-between mb-4 last:mb-0">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center">
                      <Text style={{ color: colors.primary }} className="text-sm font-medium">
                        {participant.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="ml-3 text-base">
                      {participant.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: colors.text }} className="text-base">
                      Rs {Math.abs(participant.amount).toFixed(2)}
                    </Text>
                    <Text 
                      style={{ 
                        color: participant.status === 'to_receive' ? '#34D399' : '#F87171'
                      }} 
                      className="text-sm"
                    >
                      {participant.status === 'to_receive' ? 'To Receive' : 'To Pay'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} className="mt-6 mb-8">
            {/* Additional Details */}
            <View 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <View>
                <Text style={{ color: colors.outline }} className="text-sm mb-1">
                  Notes
                </Text>
                <Text style={{ color: colors.text }} className="text-base">
                  {settlement.notes}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}