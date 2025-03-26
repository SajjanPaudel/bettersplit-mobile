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
                height: balanceCardHeight,
              }}>
                <View className="flex-row items-center">
                  <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8 }} className="text-lg">Loading balances...</Text>
                </View>
              </View>
            ) : (

              Object.entries(balances)
                .filter(([name]) => name === loggedInUser.username)
                .map(([name, balance], index) => {
                  return (
                    // <TouchableOpacity
                    //   key={index}
                    //   onPress={toggleExpand}
                    //   activeOpacity={0.9}
                    //   className="w-[95%]"
                    // >
                    <View key={index} className={`rounded-xl pt-4 px-4 w-[93%]`} style={{
                      backgroundColor: colors.card,
                      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                      ...(theme === 'light' && { borderColor: colors.border, borderWidth: 1 })}} 
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <Ionicons name="wallet-outline" size={24} color={colors.primary} className="mr-2" />
                          <Text style={{ color: colors.text }} className="text-xl font-semibold px-2">Financial Overview</Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className={`px-3 py-1 rounded-full ${balance.net >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <Text className={`text-xs font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {balance.net >= 0 ? 'To Receive' : 'To Pay'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="py-3 rounded-xl">
                        <View className="flex-row justify-between items-center">
                          <View className="w-full">
                            <View className={`${balance.net >= 0 ? 'bg-green-600/20' : 'bg-red-600/20'} flex flex-row justify-between items-center p-4 rounded-xl`}>
                              <View>
                                <Text className={`text-sm font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {balance.net >= 0 ? 'Total Receiveable' : 'Total Payable'}
                                </Text>
                                <Text className={`text-3xl font-bold mt-1 ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  Rs {Math.abs(balance.net).toFixed(2)}
                                </Text>
                                <Text style={{ color: colors.outline }} className="text-xs mt-1">
                                  Updated {new Date().toLocaleDateString()}
                                </Text>
                              </View>
                              <TouchableOpacity
                                key={index}
                                onPress={toggleExpand}
                                activeOpacity={0.9}
                              >
                                <Animated.View style={animatedRotate}>
                                  <Ionicons name="chevron-down" className="p-4" size={24} color={colors.primary} />
                                </Animated.View>
                              </TouchableOpacity>
                            </View>

                            {/* Always visible section */}
                            <View className="mt-3 rounded-md py-2">
                              <View className="flex-row w-full justify-between gap-2">
                                <View className="flex-row flex-1 items-center bg-green-800/20 p-3 rounded-xl">
                                  <View className="w-10 h-10 mr-2 rounded-full bg-green-500/40 items-center justify-center">
                                    <Ionicons name="arrow-up" size={18} color={colors.text} />
                                  </View>
                                  <View>
                                    <Text style={{ color: colors.text }} className="text-xs">You paid</Text>
                                    <Text className="text-base font-semibold text-green-400">
                                      Rs {balance.paid.toFixed(2)}
                                    </Text>
                                  </View>
                                </View>
                                <View className="flex-row flex-1 items-center bg-red-800/20 p-3 rounded-xl">
                                  <View className="w-10 h-10 mr-2 rounded-full bg-red-500/40 items-center justify-center">
                                    <Ionicons name="arrow-down" size={18} color={colors.text} />
                                  </View>
                                  <View>
                                    <Text style={{ color: colors.text }} className="text-xs">You owed</Text>
                                    <Text className="text-base font-semibold text-red-400">
                                      Rs {balance.owed.toFixed(2)}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>

                            {/* Expandable section */}
                            <Animated.View style={animatedHeight}>
                              <View className="mt-3 rounded-md py-2">
                                <View className="rounded-xl">
                                  <View className="flex-row justify-between items-center">
                                    <Text style={{ color: colors.text }} className="text-lg font-semibold">Quick Summary</Text>
                                    <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.primary + '30' }}>
                                      <Text style={{ color: colors.primary }} className="text-xs font-medium">Last 7 days</Text>
                                    </View>
                                  </View>
                                  {/* Swipable Cards - Redesigned to be larger and more visually appealing */}
                                </View>
                              </View>

                              {/* Redesigned Quick Summary Cards - Moved outside container */}
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                pagingEnabled
                                decelerationRate="fast"
                                snapToInterval={screenWidth * 0.9 + 16}
                                snapToAlignment="start"
                                // contentContainerStyle={{ paddingLeft: 16, paddingRight: 32 }}
                                className="mt-4"
                                onScroll={(event) => {
                                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                                  const cardWidth = screenWidth * 0.9 + 16; // Card width + margin
                                  const newIndex = Math.round(contentOffsetX / cardWidth);
                                  if (newIndex !== activeCardIndex) {
                                    setActiveCardIndex(newIndex);
                                    triggerHaptic();
                                  }
                                }}
                                scrollEventThrottle={16}
                              >
                                {/* Card 1: Transactions */}
                                <View
                                  key="transactions-card"
                                  className="rounded-2xl overflow-hidden"
                                  style={{
                                    width: 355,
                                    height: 180,
                                    marginRight: 16,
                                    position: 'relative'
                                  }}
                                >
                                  <LinearGradient
                                    colors={['#9333EA', '#7E22CE', '#6B21A8']}
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

                                {/* Card 2: Settlements */}
                                <View
                                  key="settlements-card"
                                  className="rounded-2xl overflow-hidden"
                                  style={{
                                    width: 353,
                                    height: 180,
                                    marginHorizontal: 16
                                  }}
                                >
                                  <LinearGradient
                                    colors={['#3B82F6', '#2563EB', '#1D4ED8']}
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

                                {/* Card 3: Average Transaction */}
                                <View
                                  key="average-transaction-card"
                                  className="rounded-2xl overflow-hidden"
                                  style={{
                                    width: 355,
                                    height: 180,
                                    marginLeft: 16
                                  }}
                                >
                                  <LinearGradient
                                    colors={['#10B981', '#059669', '#047857']}
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
                              
                              {/* Card Indicator Dots */}
                              <View className="flex-row justify-center items-center mt-4 mb-2">
                                {[0, 1, 2].map((index) => {
                                  // Define colors for each card
                                  const cardColors = [
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
                            </Animated.View>
                          </View>
                        </View>
                      </View>
                    </View>
                    // </TouchableOpacity>
                  );
                })
            )}
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
                              boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                              ...(theme === 'light' && { borderColor: colors.border, borderWidth: 1 })
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
                                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                                ...(theme === 'light' && { borderColor: colors.border, borderWidth: 1 })
                              },
                            ]}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                                {settlement.individual_settlements.length > 1 ? 
                                <Ionicons name="swap-horizontal-outline" size={20} color="#60A5FA" /> :
                                <Ionicons name="arrow-forward-outline" size={20} color="#60A5FA" />
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
