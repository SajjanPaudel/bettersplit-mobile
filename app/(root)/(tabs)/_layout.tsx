import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useMemo } from "react";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";
import React from 'react';
import { useTheme } from "../../../context/ThemeContext";
import 'react-native-gesture-handler';

type IconName = keyof typeof Ionicons.glyphMap;

const TabIcon = ({ name, color, size, focused }: {
        name: IconName;
        color: string;
        size: number;
        focused: boolean
    }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        scale.value = withSpring(focused ? 1.1 : 1, {
            duration: 10,
            stiffness: 10,
        });
        return {
            transform: [
                { scale: scale.value },
            ],
        };
    }, [focused]);

    return (
        <View className="items-center justify-center h-full" >
            <Animated.View style={[animatedStyle, { height: '100%', justifyContent: 'center' }]}>
                <Ionicons name={name} size={size} color={color} />
            </Animated.View>
        </View>
    );
};


export default function TabLayout() {
    const { colors } = useTheme();
    const tabBarHeight = useMemo(() => {
        const { height } = Dimensions.get('window');
        return height * 0.1; // Adjusted to match YouTube's height
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerShadowVisible: true,
                tabBarStyle: {
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    height: tabBarHeight,
                    paddingTop: 16,
                    // marginLeft: 10,
                    // marginRight: 10,
                    // bottom: 10,
                    // width: '95%',
                    alignSelf: 'center',
                    elevation: 0,
                    overflow: 'visible',
                    position: 'absolute',
                    // borderBottomLeftRadius: 30,
                    // borderBottomRightRadius: 30,
                    // borderTopLeftRadius: 30,
                    // borderTopRightRadius: 30,
                },
                tabBarBackground: () => (
                    <View style={{
                        backgroundColor: colors.tabBar,
                        height: '100%',
                        width: '100%',
                        // borderBottomLeftRadius: 30,
                        // borderBottomRightRadius: 30,
                        // borderTopLeftRadius: 30,
                        // borderTopRightRadius: 30,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        position: 'absolute',
                        overflow: 'hidden',
                    }}>
                    </View>
                ),
                tabBarLabelStyle: {
                    marginTop: 2,
                    fontSize: 10,
                    fontWeight: '400',
                },
                tabBarActiveTintColor: '#9333EA',
                tabBarInactiveTintColor: '#9CA3AF',
                headerRight: () => (
                    <View className="mr-4 flex-row gap-4">
                        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/test")}>
                            <Ionicons name="notifications-outline" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/profile")}>
                            <Ionicons name="person-circle-outline" size={28} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                )
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name={focused ? "home" : "home-outline"}
                            size={24} // Fixed size to match YouTube
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerTitle: '',
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="expense"
                options={{
                    title: "Expense",
                    tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{
                            position: 'absolute',
                            top: -40,
                            width: 80,
                            height: 80,
                            borderRadius: 50,
                            // backgroundColor: colors.outline,
                            justifyContent: 'center',
                            alignItems: 'center',
                            // shadowColor: '#000',
                            // shadowOffset: { width: 0, height: 2 },
                            // shadowOpacity: 0.3,
                            // shadowRadius: 4,
                            // elevation: 5,
                        }}>
                            <View style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: 45,
                                backgroundColor: 'purple',
                                // borderStyle: 'dashed',
                            }} />
                            <TabIcon
                                name="add"
                                size={28}
                                color={'white'}
                                focused={focused}
                            />
                        </View>
                    ),
                    headerTitle: '',
                    headerShown: false,
                    href: null
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarLabel: () => null,
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                            focused={focused}
                        />
                    ),
                    headerTitle: ''
                }}
            />



            <Tabs.Screen
                name="test"
                options={{
                    href: null, // prevent from showing in tab bar
                }}
            />

            <Tabs.Screen
                name="transaction-detail"
                options={{
                    href: null, // prevent from showing in tab bar
                    headerShown: false
                }}

            />
            <Tabs.Screen
                name="settlement-detail"
                options={{
                    href: null, // prevent from showing in tab bar
                    headerShown: false
                }}

            />

        </Tabs>

    );
}