import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useState, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { FAB } from 'react-native-paper';
import {
  ScrollView,
  GestureHandlerRootView,
  TapGestureHandler,
  State
} from 'react-native-gesture-handler';
import { endpoints } from '../../../config/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHaptic } from '../../../context/HapticContext';

const screenWidth = Dimensions.get('window').width;

export default function Index() {
  const [activeTab, setActiveTab] = useState('transactions');
  const translateX = useSharedValue(0);
  const { colors, theme } = useTheme();
  const tabBarHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return height * 0.09;
  }, []);

  const balanceCardHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return height * 0.31; // 30% of screen height
  }, []);
  const [state, setState] = useState({ open: false });
  const [balances, setBalances] = useState<{ [key: string]: { paid: number, owed: number, net: number } }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState<ActivityItem[]>([]);
  const [expenses, setExpenses] = useState<ActivityItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const heightAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const { triggerHaptic } = useHaptic();

  const animatedHeight = useAnimatedStyle(() => ({
    height: withTiming(heightAnim.value, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    }),
    opacity: withTiming(opacityAnim.value, {
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    }),
    overflow: 'hidden',
    transform: [
      {
        scale: withTiming(opacityAnim.value, {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1)
        })
      }
    ]
  }));

  const animatedRotate = useAnimatedStyle(() => ({
    transform: [{
      rotate: withSpring(`${rotateAnim.value}deg`, {
        damping: 15,
        stiffness: 100,
      })
    }]
  }));

  const toggleExpand = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);

    if (!nextExpanded) {
      opacityAnim.value = 0;
      rotateAnim.value = 0;
      setTimeout(() => {
        heightAnim.value = 0;
      }, 50);
    } else {
      heightAnim.value = 280; // Increased height for more content
      opacityAnim.value = 1;
      rotateAnim.value = 180;
    }
    triggerHaptic(); // Add haptic feedback when toggling
  };

  interface ActivityItem {
    id: number;
    name: string;
    amount: string;
    date: string;
    paid_by: string;
    paid_for: string[];
    splits: { [key: string]: string };
    created_at: string;
    group?: string;
  }
  interface SettlementItem {
    from: string;
    to: string;
    amount: number;
    type: string;
    individual_settlements: IndividualSettlement[];
  }
  interface IndividualSettlement {
    from: string;
    to: string;
    amount: number;
    type: string;
  }


  const onStateChange = ({ open }: { open: boolean }) => setState({ open });

  const { open } = state;

  useEffect(() => {
    // Fetch balances from API
    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        const tokensString = await AsyncStorage.getItem('tokens');
        const user = await AsyncStorage.getItem('user');
        setLoggedInUser(user ? JSON.parse(user) : null);
        let headers = {};
        if (tokensString) {
          const tokens = JSON.parse(tokensString);
          headers = {
            'Authorization': `Bearer ${tokens.access_token}`
          };
        }
        const response = await axios.get(endpoints.simple_balances, { headers });
        if (response.data.success) {
          setBalances(response.data.data);
        } else {
          console.error('Error fetching balances:', response.data);
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, []);

  useEffect(() => {
    const fetchTransactionsAndExpenses = async () => {
      try {
        const tokensString = await AsyncStorage.getItem('tokens');
        let headers: { type: string; Authorization?: string } = { type: "me" };
        if (tokensString) {
          const tokens = JSON.parse(tokensString);
          headers = {
            type: "me",
            Authorization: `Bearer ${tokens.access_token}`
          };
        }

        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const response = await axios.get<{ success: boolean; data: ActivityItem[] }>(endpoints.activity, { headers, params: { type: 'me', start_date: lastWeek, end_date: today } });

        if (response.data.success) {
          const data = response.data.data;
          setTransactions(data.filter(item => item.paid_for.length > 0)); // Filter for transactions
          setExpenses(data.filter(item => item.paid_for.length === 0)); // Filter for expenses
        } else {
          console.error("API request was not successful:", response.data);
        }
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

    const fetchSettlements = async () => {
      try {
        const tokensString = await AsyncStorage.getItem('tokens');
        let headers = {};
        if (tokensString) {
          const tokens = JSON.parse(tokensString);
          headers = {
            'Authorization': `Bearer ${tokens.access_token}`
          };
        }
        const response = await axios.get(endpoints.simple_settlements, { headers, params: { type: 'me' } });
        if (response.data.success) {
          setSettlements(response.data.data);
        } else {
          console.error('Error fetching settlements:', response.data);
        }
      } catch (error) {
        console.error('Error fetching settlements:', error);
      }
    };

    fetchTransactionsAndExpenses();
    fetchSettlements();
  }, []);

  useEffect(() => {
    translateX.value = withSpring(
      activeTab === 'transactions' ? 0 : (screenWidth - 32) / 2,
      {
        damping: 15,
        stiffness: 100,
        mass: 0.8,
        velocity: 1,
        overshootClamping: false
      }
    );
  }, [activeTab]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  const createTapHandler = (navigateTo: string, transaction?: ActivityItem) => {
    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        runOnJS(router.push)({
          pathname: navigateTo,
          params: transaction ? { transaction: JSON.stringify(transaction) } : {}
        } as any);
      }
    };
    return { onHandlerStateChange };
  };

  const createSettlementTapHandler = (navigateTo: string, settlement?: SettlementItem) => {
    const onHandlerSettlementStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        runOnJS(router.push)({
          pathname: navigateTo,
          params: settlement ? { settlement: JSON.stringify(settlement) } : {}
        } as any);
      }
    };
    return { onHandlerSettlementStateChange };
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ backgroundColor: colors.background, flex: 1, zIndex: 1 }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="mb-6 flex align-middle items-center">
            {isLoading ? (
              <View key='loading-card' className={`rounded-xl pt-4 px-4 w-[93%] items-center justify-center`} style={{
                backgroundColor: colors.card,
                height: 220,
                marginHorizontal: 16
              }}>
                <View className="flex-row items-center">
                  <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8 }} className="text-lg">Loading balances...</Text>
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={screenWidth} // Changed from screenWidth
                snapToAlignment="start"
                contentContainerStyle={{
                  paddingHorizontal: 16,
                }}
                className="mt-4"
                onScroll={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const newIndex = Math.round(contentOffsetX / (screenWidth)); // Updated calculation
                  if (newIndex !== activeCardIndex) {
                    setActiveCardIndex(newIndex);
                    triggerHaptic();
                  }
                }}
                scrollEventThrottle={16}
              >
                {/* Balance Card */}
                {Object.entries(balances)
                  .filter(([name]) => name === loggedInUser.username)
                  .map(([name, balance], index) => (
                    <View
                      key="balance-card"
                      className="rounded-2xl overflow-hidden"
                      style={{
                        width: screenWidth - 32,
                        height: 220,
                        marginRight: 16
                      }}
                    >
                      <LinearGradient
                          colors={balance.net <= 0
                            ? ['#1C1B1F', '#059669', '#047857']  // Green gradient for positive balance
                            : ['#1C1B1F','#dc2626', '#b91c1c']  // Red gradient for negative balance
                          }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ flex: 1, padding: 16 }}
                      >
                        <View className="flex-row justify-between items-start">
                          <View className="w-14 h-14 rounded-full items-center justify-center" style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4
                          }}>
                            <Ionicons
                              name={balance.net >= 0 ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                              size={28}
                              color="#ffffff"
                            />
                          </View>
                          <View className="px-3 py-1 rounded-full" style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.4)'
                          }}>
                            <Text style={{ color: '#ffffff' }} className="text-xs font-medium">
                              {balance.net >= 0 ? 'Credit' : 'Debit'}
                            </Text>
                          </View>
                        </View>

                        <View className="mt-4">
                          <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="text-sm mb-1">
                            {balance.net >= 0 ? 'Total Receivable' : 'Total Payable'}
                          </Text>
                          <Text style={{
                            color: '#ffffff',
                            textShadowColor: 'rgba(0, 0, 0, 0.2)',
                            textShadowOffset: { width: 1, height: 1 },
                            textShadowRadius: 3
                          }} className="text-4xl font-bold">
                            Rs {Math.abs(balance.net).toFixed(2)}
                          </Text>
                        </View>

                        <View className="mt-4 flex-row gap-2">
                          <View className="flex-1 bg-green-400  rounded-xl p-2 " style={{
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.15)'
                          }}>
                            <View className="flex-row items-center">
                              <Ionicons
                                name="arrow-down"
                                size={16}
                                color="#FFFFFF" // Green for receive
                              />
                              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="text-xs ml-1">To Receive</Text>
                            </View>
                            <Text style={{ color: '#FFFFFF' }} className="text-sm font-bold mt-1 pl-1">
                              Rs {balance.paid?.toFixed(2) || '0.00'}
                            </Text>
                          </View>

                          <View className="flex-1 bg-red-400 p-2 rounded-xl" style={{
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.15)'
                          }}>
                            <View className="flex-row items-center">
                              <Ionicons
                                name="arrow-up"
                                size={16}
                                color="#FFFFFF" // Red for pay
                              />
                              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="text-xs ml-1">To Pay</Text>
                            </View>
                            <Text style={{ color: '#FFFFFF' }} className="text-sm font-bold mt-1 pl-1">
                              Rs {balance.owed?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  ))}

                {/* Transactions Card */}
                <View
                  key="transactions-card"
                  className="rounded-2xl overflow-hidden"
                  style={{
                    width: screenWidth - 32,
                    height: 220,
                    marginRight: 16,
                    marginLeft: 16
                  }}
                >
                  <LinearGradient
                    colors={['#1C1B1F', '#7E22CE', '#6B21A8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, padding: 16 }}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <Ionicons name="swap-horizontal" size={28} color="#ffffff" />
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                        <Text style={{ color: '#ffffff' }} className="text-xs font-medium">Transactions</Text>
                      </View>
                    </View>
                    <View className="items-start justify-center py-2">
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="text-sm mb-1">Total Transactions</Text>
                      <Text style={{ color: '#ffffff' }} className="text-4xl font-bold">{transactions.length}</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs mt-3">
                        {transactions.length > 0 ? `Last: ${transactions[0]?.date}` : 'No recent transactions'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {/* Settlements Card */}
                <View
                  key="settlements-card"
                  className="rounded-2xl overflow-hidden"
                  style={{
                    width: screenWidth - 32,
                    height: 220,
                    marginLeft: 16,
                    marginRight: 16
                  }}
                >
                  <LinearGradient
                    colors={['#1C1B1F', '#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, padding: 16 }}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <Ionicons name="git-network-outline" size={28} color="#ffffff" />
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                        <Text style={{ color: '#ffffff' }} className="text-xs font-medium">Settlements</Text>
                      </View>
                    </View>
                    <View className="items-start justify-center py-2">
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="text-sm mb-1">Total Settlements</Text>
                      <Text style={{ color: '#ffffff' }} className="text-4xl font-bold">{settlements.length}</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs mt-3">
                        {settlements.length > 0 ? 'Pending resolution' : 'All settled up'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {/* Average Transaction Card */}
                <View
                  key="average-transaction-card"
                  className="rounded-2xl overflow-hidden"
                  style={{
                    width: screenWidth - 32,
                    height: 220
                  }}
                >
                  <LinearGradient
                    colors={['#1C1B1F', '#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, padding: 16 }}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <Ionicons name="calculator-outline" size={28} color="#ffffff" />
                      </View>
                      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
                        <Text style={{ color: '#ffffff' }} className="text-xs font-medium">Average</Text>
                      </View>
                    </View>
                    <View className="items-start justify-center py-2">
                      <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="text-sm mb-1">Average Transaction</Text>
                      <Text style={{ color: '#ffffff' }} className="text-4xl font-bold">
                        Rs {transactions.length > 0 ?
                          (transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length).toFixed(2) :
                          '0.00'}
                      </Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="text-xs mt-3">
                        Based on {transactions.length} transactions
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </ScrollView>
            )}

            {/* Card Indicator Dots */}
            <View className="flex-row justify-center items-center mt-4 mb-2">
              {[0, 1, 2, 3].map((index) => {
                const cardColors = [
                  '#9333EA', // Purple for Balance
                  '#9333EA', // Purple for Transactions
                  '#3B82F6', // Blue for Settlements
                  '#10B981'  // Green for Average
                ];
                return (
                  <View
                    key={index}
                    className={`mx-1 rounded-full ${activeCardIndex === index ? 'w-3 h-3' : 'w-2 h-2'}`}
                    style={{
                      backgroundColor: activeCardIndex === index
                        ? cardColors[index]
                        : colors.outline + '50',
                      transform: [{ scale: activeCardIndex === index ? 1 : 0.8 }]
                    }}
                  />
                );
              })}
            </View>
          </View>

          {/* Recent Activity Tabs */}
          <View style={{ flex: 1, paddingBottom: tabBarHeight }}>
            <View className="flex-row mb-4 mx-5 relative overflow-hidden">
              <Animated.View
                style={[{
                  position: 'absolute',
                  bottom: 0,
                  height: 2,
                  width: '50%',
                  backgroundColor: colors.primary,
                  borderRadius: 1,
                }, animatedStyle]}
              />
              <TouchableOpacity
                className="flex-1 py-2 px-4 rounded-xl"
                onPress={() => {
                  setActiveTab('transactions');
                  translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 100,
                    mass: 0.8,
                    velocity: 1,
                    overshootClamping: false
                  });
                }}
                onPressIn={() => triggerHaptic()}
              >
                <Text
                  style={{
                    color: activeTab === 'transactions' ? colors.primary : colors.text,
                    fontWeight: activeTab === 'transactions' ? '600' : '400',
                  }}
                  className="text-center"
                >
                  Transactions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-2 px-4 rounded-xl"
                onPress={() => {
                  triggerHaptic();
                  setActiveTab('expenses');
                  translateX.value = withSpring((screenWidth - 32) / 2, {
                    damping: 15,
                    stiffness: 100,
                    mass: 0.8,
                    velocity: 1,
                    overshootClamping: false
                  });
                }}
              >
                <Text
                  style={{
                    color: activeTab === 'expenses' ? colors.primary : colors.text,
                    fontWeight: activeTab === 'expenses' ? '600' : '400',
                  }}
                  className="text-center"
                >
                  Settlements
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const offset = e.nativeEvent.contentOffset.x;
                const progress = offset / screenWidth;
                if (progress >= 0.5 && activeTab === 'transactions') {
                  setActiveTab('expenses');
                  translateX.value = withSpring((screenWidth - 32) / 2, {
                    damping: 15,
                    stiffness: 100,
                    mass: 0.8,
                    velocity: 1,
                    overshootClamping: false
                  });
                } else if (progress < 0.5 && activeTab === 'expenses') {
                  setActiveTab('transactions');
                  translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 100,
                    mass: 0.8,
                    velocity: 1,
                    overshootClamping: false
                  });
                }
              }}
              scrollEventThrottle={32}
              decelerationRate="normal"
              ref={(ref) => {
                if (ref) {
                  ref.scrollTo({
                    x: activeTab === 'transactions' ? 0 : screenWidth,
                    animated: false
                  });
                }
              }}
              contentContainerStyle={{ width: screenWidth * 2, marginHorizontal: 15, marginBottom: 8 }}
            >
              {/* Transactions Tab */}
              <View style={{ width: screenWidth, paddingRight: 30 }} >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="mb-25"
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  directionalLockEnabled={true}
                >
                  {transactions.map((transaction, index) => {
                    const { onHandlerStateChange } = createTapHandler('/transaction-detail', transaction);

                    return (
                      <TapGestureHandler
                        key={`transaction-${transaction.id}`}
                        onHandlerStateChange={onHandlerStateChange}
                        onActivated={() => triggerHaptic()}
                      >
                        <Animated.View
                          className="mb-3 p-4 rounded-xl"
                          style={[
                            {
                              backgroundColor: colors.card,
                              boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.1)'
                            },
                          ]}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center">
                                <Text style={{ color: colors.primary }} className="text-sm font-medium">{transaction.paid_by.substring(0, 1)}</Text>
                              </View>
                              <View className="ml-3 flex-1">
                                <Text style={{ color: colors.text }} className="text-base font-medium">{transaction.name}</Text>
                                <Text style={{ color: colors.outline }} className="text-sm">Paid by {transaction.paid_by}</Text>
                                <Text style={{ color: colors.outline }} className="text-sm">{transaction.date}</Text>
                              </View>
                            </View>
                            <View>
                              <Text className={`text-base font-medium text-right ${loggedInUser.username == transaction.paid_by ? 'text-green-600' : 'text-red-600'}`}>
                                {loggedInUser.username == transaction.paid_by ?
                                  `+ Rs ${(parseFloat(transaction.amount) - parseFloat(transaction.splits[loggedInUser.username])).toFixed(2)}` :
                                  ` - Rs ${transaction.splits[loggedInUser.username]}`}
                              </Text>
                              <Text style={{ color: colors.outline }} className="text-sm text-right"> Rs {transaction.amount}</Text>
                            </View>
                          </View>
                        </Animated.View>
                      </TapGestureHandler>
                    );
                  })}
                  <TouchableOpacity
                    className="mb-4 p-4 rounded-xl flex-row"
                    onPress={() => router.push('/(root)/(tabs)/profile')}
                  >
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.text }} className="text-sm font-medium"> See All Transactions</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Settlements Tab */}
              <View style={{ width: screenWidth, paddingRight: 30 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="mb-25"
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  directionalLockEnabled={true}
                >
                  {settlements.length === 0 ? (
                    <View className="items-center justify-center p-8">
                      <Text style={{ color: colors.text }}>No settlements found</Text>
                    </View>
                  ) : (
                    settlements.map((settlement, index) => {
                      const { onHandlerSettlementStateChange } = createSettlementTapHandler(
                        "/settlement-detail",
                        settlement
                      );
                      return (
                        <TapGestureHandler
                          key={`settlement-${settlement.from}-${settlement.to}-${settlement.amount}-${index}`}
                          onHandlerStateChange={onHandlerSettlementStateChange}
                          onActivated={() => triggerHaptic()}
                        >
                          <Animated.View
                            className="mb-3 p-4 rounded-xl"
                            style={[
                              {
                                backgroundColor: colors.card,
                                boxShadow: '2px 3px 4px rgba(0, 0, 0, 0.1)'
                              },
                            ]}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                                  {settlement.individual_settlements.length > 1 ?
                                    <Ionicons name="swap-horizontal-outline" size={20}
                                      color={settlement.from === loggedInUser.username ? '#FF0000' : '#00FF00'}
                                    /> :
                                    <Ionicons name="arrow-forward-outline" size={20}
                                      color={settlement.from === loggedInUser.username ? '#FF0000' : '#00FF00'}
                                    />
                                  }
                                </View>
                                <View className="ml-3 flex-1">
                                  <Text style={{ color: colors.text }} className="text-base font-medium">
                                    {settlement.from == loggedInUser.username
                                      ? `You owe ${settlement.to}`
                                      : `${settlement.from} owes you`}
                                  </Text>
                                  <Text style={{ color: colors.outline }} className="text-sm">
                                    {settlement.individual_settlements.length > 1
                                      ? `${settlement.individual_settlements.length} settlements`
                                      : '1 settlement'}
                                  </Text>
                                </View>
                              </View>
                              <View>
                                <Text style={{ color: colors.text }} className="text-base font-medium text-right">
                                  Rs {settlement.amount.toFixed(2)}
                                </Text>
                                <Text style={{ color: colors.outline }} className="text-sm text-right">total</Text>
                              </View>
                            </View>
                          </Animated.View>
                        </TapGestureHandler>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
        {/* FAB with Speed Dial */}
        <FAB.Group
          open={open}
          visible
          icon={open ? 'close' : 'plus'}
          color='white'
          fabStyle={{
            backgroundColor: '#6b21a8',
            shadowColor: 'transparent',
            elevation: 0
          }}
          actions={[
            {
              icon: 'account-multiple-plus',
              label: 'Calculate Splits',
              labelTextColor: colors.primary,
              onPress: () => router.push('/(root)/(tabs)/expense'),
            },
            {
              icon: 'content-save',
              label: 'Split Bill and Save',
              labelTextColor: colors.primary,
              onPress: () => router.push('/(root)/(tabs)/expense'),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
          style={{
            position: 'absolute',
            bottom: 75,
            right: 0
          }}
          backdropColor="transparent"
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
