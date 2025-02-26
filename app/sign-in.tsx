import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient';

interface ApiResponse {
    success: boolean;
    data: string;
}

const SignIn = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>()

    const handleSignIN = async () => {
        setError('')
        if (!username || !password) {
            const errorMessage = 'Please fill all the fields'
            setError(errorMessage)
            return
        }
        try {
            setLoading(true)
            const response = await fetch('https://apibettersplit.vercel.app/api/users/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })
            const data: ApiResponse = await response.json()
            if (!response.ok || !data.success) {
                throw new Error(data.data || 'Sign in failed')
            }
            router.push('/(root)/(tabs)')

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
            setError(errorMessage)
            console.log(error)
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
            <SafeAreaView className='flex-1'>
                <ScrollView className='flex-1' contentContainerStyle={{ flexGrow: 1 }}>

                    <Text className='mt-10 text-3xl text-bold text-gray-400 left-10'></Text>
                    <View className=' mr-[5%] ml-[5%] w-[90%] items-center justify-center'>
                        <Text className='text-gray-500 text-4xl font-bold tracking-widest mt-2'>
                            BETTER<Text className='text-purple-500'>SPLIT</Text>
                        </Text>
                        <Text className='text-purple-500 text-4xl font-bold tracking-widest opacity-[20%]'>
                            SPLIT<Text className='text-gray-500'>BETTER</Text>
                        </Text>
                    </View>

                    <View className='flex-1 justify-center px-4'>
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
            </SafeAreaView>
        </LinearGradient>
    )
}


export default SignIn