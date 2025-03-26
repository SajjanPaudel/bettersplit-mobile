import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useState, useEffect } from 'react';

interface IndividualSettlement {
  from: string;
  to: string;
  amount: number;
  type: string;
}

interface SettlementData {
  from: string;
  to: string;
  amount: number;
  type: string;
  individual_settlements: IndividualSettlement[];
}

export default function SettlementDetail() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [settlement, setSettlement] = useState<SettlementData | null>(null);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (params.settlement) {
      try {
        const settlementData = JSON.parse(params.settlement as string);
        setSettlement(settlementData);
      } catch (error) {
        console.error('Error parsing settlement data:', error);
      }
    }
  }, [params.settlement]);

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
          {settlement ? (
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
                  Rs {Math.abs(settlement.amount).toFixed(2)}
                </Text>
                <Text style={{ color: colors.outline }} className="text-sm mt-2">
                  {date}
                </Text>
              </View>
            </Animated.View>
          ) : (
            <View className="p-6 items-center justify-center">
              <Text style={{ color: colors.text }}>Loading settlement details...</Text>
            </View>
          )}

          {settlement && (
            <Animated.View entering={FadeInUp.delay(200)} className="mt-6">
              {/* Settlement Details */}
              <View 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: colors.card }}
              >
                <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                  Settlement Details
                </Text>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center">
                      <Text style={{ color: colors.primary }} className="text-sm font-medium">
                        {settlement.from.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="ml-3 text-base">
                      {settlement.from}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: colors.text }} className="text-base">
                      Rs {Math.abs(settlement.amount).toFixed(2)}
                    </Text>
                    <Text 
                      style={{ color: '#F87171' }} 
                      className="text-sm"
                    >
                      To Pay
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-green-500/10 items-center justify-center">
                      <Text style={{ color: '#34D399' }} className="text-sm font-medium">
                        {settlement.to.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="ml-3 text-base">
                      {settlement.to}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: colors.text }} className="text-base">
                      Rs {Math.abs(settlement.amount).toFixed(2)}
                    </Text>
                    <Text 
                      style={{ color: '#34D399' }} 
                      className="text-sm"
                    >
                      To Receive
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {settlement && settlement.individual_settlements.length > 0 && (
            <Animated.View entering={FadeInUp.delay(300)} className="mt-6 mb-8">
              {/* Individual Settlements */}
              <View 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: colors.card }}
              >
                <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                  Individual Settlements
                </Text>
                {settlement.individual_settlements.map((individualSettlement, index) => (
                  <View key={index} className="mb-4 pb-4 border-b" style={{ borderBottomColor: colors.border }}>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text style={{ color: colors.text }} className="font-medium">
                        {individualSettlement.from} → {individualSettlement.to}
                      </Text>
                      <Text style={{ color: colors.text }} className="font-medium">
                        Rs {individualSettlement.amount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={{ color: colors.outline }} className="text-sm">
                      {individualSettlement.type.charAt(0).toUpperCase() + individualSettlement.type.slice(1)} settlement
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}