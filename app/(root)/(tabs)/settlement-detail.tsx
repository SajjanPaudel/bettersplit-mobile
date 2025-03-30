import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useState, useEffect, useMemo } from 'react';
import { useHaptic } from '../../../context/HapticContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endpoints } from '../../../config/api';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';

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


interface AccountDetails {
  bankCode?: string;
  accountName?: string;
  accountNumber?: string;
  name?: string;
  eSewa_id?: string;
  Khalti_ID?: string;
}

interface AccountItem {
  id: number;
  account_type: string;
  account_details: AccountDetails;
  is_primary: boolean;
  created_at: string;
}

interface AccountData {
  [username: string]: AccountItem[];
}

export default function SettlementDetail() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [settlement, setSettlement] = useState<SettlementData | null>(null);
  const [toAccount, setToAccount] = useState<{ username: string, accounts: AccountItem[] } | null>(null);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [expanded, setExpanded] = useState(false);
  const { triggerHaptic } = useHaptic();
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);

  const tabBarHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    return height * 0.09;
  }, []);

  useEffect(() => {
    const fetchAccountDetails = async (username: string) => {
      try {
        const tokensString = await AsyncStorage.getItem('tokens');
        let headers = {};
        if (tokensString) {
          const tokens = JSON.parse(tokensString);
          headers = {
            'Authorization': `Bearer ${tokens.access_token}`
          };
        }
        const response = await axios.get(endpoints.simple_accounts, {
          headers,
          params: { type: username }
        });
        if (response.data.success) {
          // Get first account details for the username
          const accounts = response.data.data[username];
          if (accounts && accounts.length > 0) {
            return {
              username,
              accounts
            };
          }
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
      return null;
    };

    if (params.settlement) {
      try {
        const settlementData = JSON.parse(params.settlement as string);
        setSettlement(settlementData);

        // Fetch account details for the 'to' field
        fetchAccountDetails(settlementData.to).then(account => {
          setToAccount(account);
        });
      } catch (error) {
        console.error('Error parsing settlement data:', error);
      }
    }
  }, [params.settlement]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background , marginBottom: tabBarHeight}}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              router.back();
              triggerHaptic();
            }
            }
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

          {settlement && (
            <Animated.View entering={FadeInUp.delay(200)} className="mt-6">
              <View className="p-4 rounded-2xl" style={{ backgroundColor: colors.card }}>
                <Text style={{ color: colors.text }} className="text-sm font-medium mb-4">
                  Account Details
                </Text>
                {toAccount && (
                  <View className="flex-col">
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 rounded-full bg-green-500/10 items-center justify-center">
                        <Text style={{ color: colors.text }} className="text-sm font-medium">
                          {toAccount.username.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ color: colors.text }} className="ml-3 text-base">
                        {toAccount.username}
                      </Text>
                    </View>

                    <View className="mb-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                      <Picker
                        selectedValue={selectedAccount?.id}
                        onValueChange={(itemValue) => {
                          const account = toAccount.accounts.find(a => a.id === itemValue);
                          setSelectedAccount(account || null);
                        }}
                        style={{ color: colors.text }}
                        dropdownIconColor={colors.text}
                      >
                        <Picker.Item label="Select an account" value={null} />
                        {toAccount.accounts.map((account) => (
                          <Picker.Item
                            key={account.id}
                            label={account.account_type.toUpperCase()}
                            value={account.id}
                          />
                        ))}
                      </Picker>
                    </View>

                    {selectedAccount && (
                      <View className="p-4 rounded-lg" >
                        {Object.entries(selectedAccount.account_details).map(([key, value]) => (
                          <View key={key} className="flex-row justify-between mt-1 mb-2">
                            <Text style={{ color: colors.outline }} className="text-sm capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </Text>
                            <Text style={{ color: colors.text }} className="text-sm">
                              {value}
                            </Text>
                          </View>
                        ))}

                        <View className="mt-4 items-center">
                          <QRCode
                            value={JSON.stringify({
                              ...selectedAccount.account_details
                            })}
                            size={200}
                            color={colors.text}
                            backgroundColor={colors.background}
                          />
                          <Text style={{ color: colors.outline }} className="mt-2 text-xs">
                            Scan to view account details
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}