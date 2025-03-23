import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS
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

const screenWidth = Dimensions.get('window').width;

export default function Index() {
  const [activeTab, setActiveTab] = useState('transactions');
  const translateX = useSharedValue(0);
  const { colors = { background: '#141218', text: '#E6E1E5', card: '#1C1B1F', border: '#49454F', primary: '#D0BCFF', secondary: '#4A4458', error: '#F2B8B5', success: '#7DD491', tabBar: '#1C1B1F', surface: '#141218', surfaceVariant: '#49454F', outline: '#938F99', onPrimary: '#381E72', onSurface: '#E6E1E5', statusBar: 'light-content' } } = useTheme();
  const tabBarHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return height * 0.09;
  }, []);
  const [state, setState] = useState({ open: false });
  const [balances, setBalances] = useState<{ [key: string]: { paid: number, owed: number, net: number } }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState<ActivityItem[]>([]);
  const [expenses, setExpenses] = useState<ActivityItem[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
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

    fetchTransactionsAndExpenses();
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

  const createTapHandler = (navigateTo: string, activityId?: number) => {
    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        runOnJS(router.push)({ pathname: navigateTo, params: activityId ? { activityId } : {} } as any);
      }
    };

    return { onHandlerStateChange };
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ backgroundColor: colors.background, flex: 1, zIndex: 1 }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-4 mr-5 rounded-2xl"
              snapToInterval={300}
              decelerationRate="fast"
              snapToAlignment="center"
              pagingEnabled={false}
            >
              {isLoading ? (
                <View className={`mr-4 rounded-3xl p-4 w-[350px] items-center justify-center`} style={{
                  backgroundColor: colors.card,
                  height: 150
                }}>
                  <Text style={{ color: colors.text }}>Loading balances...</Text>
                </View>
              ) : (

                Object.entries(balances)
                  .filter(([name]) => name === loggedInUser.username)
                  .map(([name, balance], index) => (
                    <View key={index} className="mr-4 rounded-3xl p-4 w-[375px]" style={{
                      backgroundColor: colors.card,
                      shadowColor: '#1A1A1A',
                      shadowOffset: { width: 0, height: 3 }
                    }}>
                      <View className="flex-row items-center justify-between mb-3">
                        <Text style={{ color: colors.text }} className="text-lg font-medium">{name}</Text>
                        <View className={`px-3 py-1 rounded-full ${balance.net >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <Text className={`text-xs font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {balance.net >= 0 ? 'To Receive' : 'To Pay'}
                          </Text>
                        </View>
                      </View>

                      <View style={{ backgroundColor: colors.card }} className="p-4 rounded-2xl" >
                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className={`text-sm font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {balance.net >= 0 ? 'Total Receiveable' : 'Total Payable'}
                            </Text>
                            <Text className={`text-xl font-semibold mt-1 ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              Rs {Math.abs(balance.net).toFixed(2)}
                            </Text>
                          </View>

                          <View className={`w-10 h-10 rounded-2xl items-center justify-center ${balance.net >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <Ionicons
                              name="information-circle-outline"
                              size={20}
                              color={balance.net >= 0 ? '#34D399' : '#F87171'}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
              )}
            </ScrollView>
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
                className="flex-1 py-2 px-4 rounded-lg"
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
                className="flex-1 py-2 px-4 rounded-lg"
                onPress={() => {
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
                  Expenses
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
              contentContainerStyle={{ width: screenWidth * 2, marginHorizontal: 15, marginBottom: 20 }}
            >
              {/* Transactions Tab */}
              <View style={{ width: screenWidth, paddingRight: 30 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="mb-25"
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  directionalLockEnabled={true}
                >
                  {transactions.map((transaction, index) => {
                    const { onHandlerStateChange } = createTapHandler('/transaction-detail');

                    return (
                      <TapGestureHandler
                        key={index}
                        onHandlerStateChange={onHandlerStateChange}
                      >
                        <Animated.View
                          className="mb-3 p-4 rounded-2xl"
                          style={[
                            {
                              backgroundColor: colors.card,
                              borderWidth: 0,
                              shadowColor: colors.text,
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 2
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
                </ScrollView>
              </View>

              {/* Expenses Tab */}
              <View style={{ width: screenWidth, paddingRight: 30 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="mb-25"
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  directionalLockEnabled={true}
                >
                  {transactions.map((expense, index) => {
                    const { onHandlerStateChange } = createTapHandler('/settlement-detail', expense.id);

                    return (
                      <TapGestureHandler
                        key={expense.id}
                        onHandlerStateChange={onHandlerStateChange}
                      >
                        <Animated.View
                          className="mb-3 p-4 rounded-2xl"
                          style={[
                            {
                              backgroundColor: colors.card,
                              borderWidth: 0,
                              shadowColor: colors.text,
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 2
                            },
                          ]}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <View className="w-10 h-10 rounded-full bg-green-500/10 items-center justify-center">
                                <Ionicons name="cart-outline" size={20} color="#34D399" />
                              </View>
                              <View className="ml-3 flex-1">
                                <Text style={{ color: colors.text }} className="text-base font-medium">Groceries</Text>
                                <Text style={{ color: colors.outline }} className="text-sm">Shared with 3 people</Text>
                              </View>
                            </View>
                            <View>
                              <Text style={{ color: colors.text }} className="text-base font-medium text-right">
                                USD 45.00
                              </Text>
                              <Text style={{ color: colors.outline }} className="text-sm text-right">total</Text>
                            </View>
                          </View>
                        </Animated.View>
                      </TapGestureHandler>
                    );
                  })}
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
          color={colors.primary}
          fabStyle={{
            backgroundColor: 'purple',
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
            bottom: 100,
            right: 20,
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