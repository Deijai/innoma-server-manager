// app/_layout.tsx - Layout Raiz COMPLETO
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../contexts/AuthContext';
import { ServerProvider } from '../contexts/ServerContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 2,
        },
    },
});

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        // Add custom fonts here if needed
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                {/* You can add a loading component here */}
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <ServerProvider>
                            <NotificationProvider>
                                <StatusBar style="auto" />
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        contentStyle: styles.screenContent,
                                        animation: 'slide_from_right',
                                        animationDuration: 300,
                                    }}
                                >
                                    <Stack.Screen
                                        name="index"
                                        options={{
                                            animation: 'fade',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="auth"
                                        options={{
                                            animation: 'slide_from_bottom',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="(tabs)"
                                        options={{
                                            animation: 'fade',
                                        }}
                                    />
                                    <Stack.Screen
                                        name="server"
                                        options={{
                                            presentation: 'modal',
                                            animation: 'slide_from_bottom',
                                            animationDuration: 400,
                                        }}
                                    />
                                </Stack>
                            </NotificationProvider>
                        </ServerProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenContent: {
        backgroundColor: '#f8f9fa',
        flex: 1,
    },
});