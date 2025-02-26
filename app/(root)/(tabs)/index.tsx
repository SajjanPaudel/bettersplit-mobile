import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';

export default function Index() {
  const { colors = { background: '#141218', text: '#E6E1E5', card: '#1C1B1F', border: '#49454F', primary: '#D0BCFF', secondary: '#4A4458', error: '#F2B8B5', success: '#7DD491', tabBar: '#1C1B1F', surface: '#141218', surfaceVariant: '#49454F', outline: '#938F99', onPrimary: '#381E72', onSurface: '#E6E1E5', statusBar: 'light-content' } } = useTheme();
  
  // Example data - replace with your actual data
  const balances = [
    { name: 'Sajjan', net: 1234.56 },
    { name: 'Sayun', net: -567.89 },
    { name: 'Ishu', net: 890.12 },
  ];

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
      <View className="mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4"
        >
          {balances.map((balance, index) => (
            <View key={index} className="mr-4 rounded-xl p-4 shadow-lg w-[300px]" style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              // shadowColor: '#F5F5F5',
            }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.text }} className="text-lg font-medium">{balance.name}</Text>
                <View className={`px-3 py-1 rounded-md ${balance.net >= 0 ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                  <Text className={`text-xs font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {balance.net >= 0 ? 'To Receive' : 'To Pay'}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: colors.card }} className="p-4 rounded-lg border" >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className={`text-sm font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {balance.net >= 0 ? 'Total Receiveable' : 'Total Payable'}
                    </Text>
                    <Text className={`text-xl font-semibold mt-1 ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Rs {Math.abs(balance.net).toFixed(2)}
                    </Text>
                  </View>

                  <View className={`w-10 h-10 rounded-lg items-center justify-center ${balance.net >= 0 ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color={balance.net >= 0 ? '#34D399' : '#F87171'}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Add your additional content below */}
      <View className="px-4">
        <Text style={{ color: colors.text }} className="text-xl font-bold mb-4">Recent Activity</Text>
        {/* Add your other content here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});