import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect, usePathname } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './_layout';
import axios from 'axios';
import { endpoints } from '../config/api';
interface ApiResponse {
    success: boolean;
    data: {
        refresh_token: string;
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            phone_number: string;
            address: string;
            profile_picture: string | null;
            first_name: string;
            last_name: string;
        }
    } | string;
}

const SignIn = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>()
    const { user } = useAuth();
    const router = useRouter();
    const handleSignIN = async () => {
        setError('')
        if (!username || !password) {
            const errorMessage = 'Please fill all the fields'
            setError(errorMessage)
            return
        }
        try {
            setLoading(true)
            const response = await axios.post(endpoints.login, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            const data: ApiResponse = response.data; // axios already parses JSON
        
            if (!data.success) {
                throw new Error(typeof data.data === 'string' ? data.data : 'Sign in failed');
            }
        
            console.log('Login successful:', response.data);
            
            // Store complete user data and tokens
            if (typeof data.data !== 'string') {
                try {
                    // Store tokens and user data
                    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
                    await AsyncStorage.setItem('tokens', JSON.stringify({
                        refresh_token: data.data.refresh_token,
                        access_token: data.data.access_token
                    }));
                    
                    console.log('Storage complete, navigating...');
                    
                    // Force a reload of the app to trigger the auth context update
                        router.replace('/(root)/(tabs)');
                    
                    console.log('Navigation triggered');
                } catch (storageError) {
                    console.error('Storage error:', storageError);
                    throw new Error('Failed to save login information');
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
            setError(errorMessage)
            console.error('Login error:', error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <LinearGradient
            colors={['#000000', '#1F2937', '#374151']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    className='flex-1' 
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text className='mt-10 text-3xl text-bold text-gray-400 left-10'></Text>
                    <View className=' mr-[5%] ml-[5%] w-[90%] items-center justify-center'>
                        <Text className='text-gray-500 text-4xl font-bold tracking-widest mt-2'>
                            BETTER<Text className='text-purple-500'>SPLIT</Text>
                        </Text>
                        <Text className='text-purple-500 text-4xl font-bold tracking-widest opacity-[20%]'>
                            SPLIT<Text className='text-gray-500'>BETTER</Text>
                        </Text>
                    </View>

                    <View className='flex-1 justify-center px-4 mb-8'>
                        <View className='bg-white/5 py-8 px-4 rounded-2xl'>
                            <Text className='text-4xl font-light text-white mb-8'>Sign in</Text>

                            {error && (
                                <View className='bg-red-500/10 rounded-lg p-4 mb-4'>
                                    <Text className='text-red-400 text-sm'>{error}</Text>
                                </View>
                            )}

                            <View className='space-y-4'>
                                <TextInput
                                    className='w-full bg-white/10 text-white px-4 py-5 mb-4 rounded-lg'
                                    placeholder='Username'
                                    placeholderTextColor='#9CA3AF'
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize='none'
                                />

                                <View className='relative'>
                                    <TextInput
                                        className='w-full bg-white/10 text-white px-4 py-5 mb-2 rounded-lg pr-12'
                                        placeholder='Password'
                                        placeholderTextColor='#9CA3AF'
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        autoCapitalize='none'
                                    />
                                </View>

                                <TouchableOpacity>
                                    <Text className='text-white/60 text-sm text-right'>
                                        Forgot password?
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`w-full bg-purple-600 rounded-lg py-4 mt-4 ${loading ? 'opacity-70' : ''}`}
                                    onPress={handleSignIN}
                                    disabled={loading}
                                    activeOpacity={0.7}
                                >
                                    <Text className='text-white text-center font-semibold'>
                                        {loading ? <ActivityIndicator size='small' color='white' /> : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}


export default SignIn