import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function TransactionDetail() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  // Mock transaction data - replace with actual data fetching
  const transaction = {
    id: '15',
    title: 'Dinner at Restaurant',
    amount: 45.00,
    date: '2024-01-20',
    paidBy: 'Haritha',
    participants: [
      { name: 'Haritha', amount: 15.00, status: 'paid' },
      { name: 'Sajjan', amount: 15.00, status: 'pending' },
      { name: 'Sayun', amount: 15.00, status: 'pending' },
    ],
    notes: 'Friday night dinner',
    category: 'Food & Dining'
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
          <Text style={{ color: colors.text }} className="text-lg font-semibold">Transaction Details</Text>
          <TouchableOpacity 
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.card }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4">
          <Animated.View entering={FadeInUp.delay(100)} className="mt-4">
            {/* Transaction Amount */}
            <View 
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.outline }} className="text-sm mb-2">
                Total Amount
              </Text>
              <Text style={{ color: colors.text }} className="text-3xl font-bold">
                ${transaction.amount.toFixed(2)}
              </Text>
              <Text style={{ color: colors.outline }} className="text-sm mt-2">
                {transaction.date}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} className="mt-6">
            {/* Paid By Section */}
            <View 
              className="p-4 rounded-2xl mb-4"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.text }} className="text-sm font-medium mb-2">
                Paid by
              </Text>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center">
                  <Text style={{ color: colors.primary }} className="text-sm font-medium">
                    {transaction.paidBy.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.text }} className="ml-3 text-base">
                  {transaction.paidBy}
                </Text>
              </View>
            </View>

            {/* Participants Section */}
            <View 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                Split Details
              </Text>
              {transaction.participants.map((participant, index) => (
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
                      ${participant.amount.toFixed(2)}
                    </Text>
                    <Text 
                      style={{ 
                        color: participant.status === 'paid' ? '#34D399' : '#F87171'
                      }} 
                      className="text-sm"
                    >
                      {participant.status === 'paid' ? 'Paid' : 'Pending'}
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
              <View className="mb-4">
                <Text style={{ color: colors.outline }} className="text-sm mb-1">
                  Category
                </Text>
                <Text style={{ color: colors.text }} className="text-base">
                  {transaction.category}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.outline }} className="text-sm mb-1">
                  Notes
                </Text>
                <Text style={{ color: colors.text }} className="text-base">
                  {transaction.notes}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}