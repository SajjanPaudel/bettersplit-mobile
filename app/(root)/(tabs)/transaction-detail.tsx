import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {useMemo } from 'react';
import { useHaptic } from '../../../context/HapticContext';

export default function TransactionDetail() {
  const tabBarHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return height * 0.09;
  }, []);
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const transaction = params.transaction ? JSON.parse(params.transaction as string) : null;
  const { triggerHaptic } = useHaptic();

  if (!transaction) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>No transaction data found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background , marginBottom: tabBarHeight}}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => {
              router.back();
              triggerHaptic();
            }}
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

        <ScrollView className="flex-1 px-4" >
          <Animated.View entering={FadeInUp.delay(100)} className="">
            <View 
              className="p-6 rounded-2xl items-center"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.outline }} className="text-sm mb-2">
                Total Amount
              </Text>
              <Text style={{ color: colors.text }} className="text-3xl font-bold">
                Rs {parseFloat(transaction.amount).toFixed(2)}
              </Text>
              <Text style={{ color: colors.outline }} className="text-sm mt-2">
                {transaction.date}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} className="mt-6">
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
                    {transaction.paid_by.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: colors.text }} className="ml-3 text-base">
                  {transaction.paid_by}
                </Text>
              </View>
            </View>

            <View 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                Split Details
              </Text>
              <ScrollView style={{ height: 230 , gap:2}} showsVerticalScrollIndicator={false}>
                {Object.entries(transaction.splits).map(([name, amount], index) => (
                  <View key={index} className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 bg-green-400/30 p-2 rounded-xl">
                      <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center">
                        <Text style={{ color: colors.primary }} className="text-sm font-medium">
                          {name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ color: colors.text }} className="ml-3 text-base">
                        {name}
                      </Text>
                      <Text style={{ color: colors.text }} className="text-base ml-auto">
                      Rs {parseFloat(amount as string).toFixed(2)}
                    </Text>
                    </View>
                    
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} className="mt-6 mb-8">
            <View 
              className="p-4 rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <View className="mb-4">
                <Text style={{ color: colors.outline }} className="text-sm mb-1">
                  Transaction Name
                </Text>
                <Text style={{ color: colors.text }} className="text-base">
                  {transaction.name}
                </Text>
              </View>
              {transaction.group && (
                <View>
                  <Text style={{ color: colors.outline }} className="text-sm mb-1">
                    Group
                  </Text>
                  <Text style={{ color: colors.text }} className="text-base">
                    {transaction.group}
                  </Text>
                </View>
              )}
              
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}