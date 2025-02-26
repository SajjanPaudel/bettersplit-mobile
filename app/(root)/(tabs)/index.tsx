import { Text, View ,StyleSheet, TouchableOpacity, ScrollView} from "react-native";
import { Link } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  // Example data - replace with your actual data
  const balances = [
    { name: 'Sajjan', net: 1234.56 },
    { name: 'Sayun', net: -567.89 },
    { name: 'Ishu', net: 890.12 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1F2937', '#374151']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          >
        <View className="mb-6">
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
          >
            {balances.map((balance, index) => (
              <View key={index} className="mr-4 bg-purple-900/10 rounded-2xl p-4 backdrop-blur-md border border-gray-800 w-[300px]">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg text-white">{balance.name}</Text>
                  <View className={`px-3 py-1 rounded-lg ${balance.net >= 0 ? 'bg-green-500/10' : 'bg-red-500/20'}`}>
                    <Text className={`text-xs ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {balance.net >= 0 ? 'To Receive' : 'To Pay'}
                    </Text>
                  </View>
                </View>

                <View className="bg-black/20 p-4 rounded-xl border-t border-gray-800">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className={`text-sm ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {balance.net >= 0 ? 'Total Receiveable' : 'Total Payable'}
                      </Text>
                      <Text className={`text-xl font-medium ${balance.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Rs {Math.abs(balance.net).toFixed(2)}
                      </Text>
                    </View>
                    
                    <View className={`w-10 h-10 rounded-lg items-center justify-center ${balance.net >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
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
            <Text className="text-white text-xl font-bold mb-4">Recent Activity</Text>
            {/* Add your other content here */}
          </View>
        </ScrollView>
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            width: 150,
            height: 56,
            backgroundColor: '#9333EA7A',
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingHorizontal: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
          activeOpacity={0.8}
          onPress={() => {
            // Add your navigation or action here
          }}
        > 
          <Text style={{ color: 'white', marginRight: 8, fontSize: 16, fontWeight: '500' }}>
            Add New
          </Text>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});