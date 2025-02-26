import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useMemo } from "react";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";
import React from 'react';
import { useTheme } from "../../../context/ThemeContext";

type IconName = keyof typeof Ionicons.glyphMap;

const TabIcon = ({ name, color, size, focused }: {
    name: IconName;
    color: string;
    size: number;
    focused: boolean
}) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateY: translateY.value }
            ],
        };
    }, [focused]);


    return (
        <View className="items-center justify-center h-full">
            <Animated.View style={animatedStyle}>
                <View className="items-center justify-center w-14 h-14">
                    <Ionicons name={name} size={size} color={color} />
                </View>
            </Animated.View>
        </View>
    );
};


export default function TabLayout() {
    const { colors = { background: '#141218', text: '#E6E1E5', card: '#1C1B1F', border: '#49454F', primary: '#D0BCFF', secondary: '#4A4458', error: '#F2B8B5', success: '#7DD491', tabBar: '#1C1B1F', surface: '#141218', surfaceVariant: '#49454F', outline: '#938F99', onPrimary: '#381E72', onSurface: '#E6E1E5', statusBar: 'light-content' } } = useTheme();
    const tabBarHeight = useMemo(() => {
        const { height } = Dimensions.get('window');
        return height * 0.09; // Adjusted to match YouTube's height
    }, []);

    return (
            <Tabs
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerShadowVisible: false,
                    tabBarStyle: {
                        backgroundColor: colors.tabBar,
                        borderTopWidth: 0,
                        height: tabBarHeight,
                        paddingTop: 12,
                        paddingBottom: 12,
                        // bottom: 10,
                        width: 'auto',
                        elevation: 0,
                        borderBottomLeftRadius:0,
                        borderBottomRightRadius:0,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                        // borderWidth: 1,
                        // borderColor: 'rgba(147, 51, 234, 0.1)',
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden',
                        position: 'absolute'
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
                        tabBarLabel: () => null,
                        tabBarIcon: ({ color, size, focused }) => (
                            <TabIcon
                                name="home-outline"
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
                        title: "expense",
                        tabBarLabel: () => null,
                        tabBarIcon: ({ color, size, focused }) => (
                            <TabIcon
                                name="add"
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
                        tabBarLabel: () => null,
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