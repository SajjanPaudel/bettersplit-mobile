import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useMemo } from "react";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import React from 'react';
import { LinearGradient } from "expo-linear-gradient";

type IconName = keyof typeof Ionicons.glyphMap;

const TabIcon = ({ name, color, size, focused }: {
    name: IconName;
    color: string;
    size: number;
    focused: boolean
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        scale.value = focused ? withSpring(1.2) : withSpring(1);
        return {
            transform: [{ scale: scale.value }]
        };
    }, [focused]);

    return (
        <Animated.View style={animatedStyle}>
            <View className="items-center">
                <Ionicons name={name} size={size} color={color} />
                {focused && (
                    <View className="h-1 w-1 rounded-full bg-purple-500 mt-1" />
                )}
            </View>
        </Animated.View>
    );
};

export default function TabLayout() {
    const tabBarHeight = useMemo(() => {
        const { height } = Dimensions.get('window');
        return height * 0.08; // Adjusted to match YouTube's height
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#000000',
                    shadowColor: 'transparent',
                    elevation: 0,
                },
                tabBarStyle: {
                    backgroundColor: '#000000',
                    borderTopWidth: 0,
                    height: tabBarHeight,
                    paddingBottom: 8,
                    paddingTop: 8,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    borderTopLeftRadius: 0, // Removed rounded corners
                    borderTopRightRadius: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -1,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    marginTop: 2,
                    fontSize: 10,
                    fontWeight: '400',
                },
                tabBarActiveTintColor: '#9333EA',
                tabBarInactiveTintColor: '#9CA3AF',
                headerTitle: () => (
                    <View className="flex flex-row items-center">
                        <Text className="text-gray-400 text-xl font-bold">B</Text>
                        <Text className="text-purple-500 text-xl font-bold">S</Text>
                    </View>
                ),
                headerRight: () => (
                    <View className="mr-4 flex-row gap-4">
                        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/test")}>
                            <Ionicons name="notifications-outline" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/profile")}>
                            <Ionicons name="person-circle-outline" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    // tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="home"
                            size={24} // Fixed size to match YouTube
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="expense"
                options={{
                    title: 'Expense',
                    // tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="stats-chart-outline"
                            size={24} // Fixed size to match YouTube
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    // tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name="person-circle-outline"
                            size={24} // Fixed size to match YouTube
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="test"
                options={{
                    href: null, // prevent from showing in tab bar
                }}
            />
        </Tabs>
    );
}