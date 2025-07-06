// app/_layout.tsx - Layout Raiz MELHORADO
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

    // NOVO: Estado para controlar quando tudo está pronto
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Aguarda as fontes carregarem
                if (fontsLoaded) {
                    // NOVO: Pequeno delay para garantir que todos os providers estão prontos
                    await new Promise(resolve => setTimeout(resolve, 100));
                    setIsAppReady(true);
                    await SplashScreen.hideAsync();
                }
            } catch (e) {
                console.warn('Erro durante preparação da app:', e);
                // Mesmo com erro, marca como pronto para não travar a app
                setIsAppReady(true);
                await SplashScreen.hideAsync();
            }
        }

        prepare();
    }, [fontsLoaded]);

    // NOVO: Só renderiza quando tudo está pronto
    if (!fontsLoaded || !isAppReady) {
        return (
            <View style={styles.loadingContainer}>
                {/* Tela de loading simples */}
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