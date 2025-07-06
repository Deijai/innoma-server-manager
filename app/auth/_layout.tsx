// app/auth/_layout.tsx - Layout de Autenticação COMPLETO
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={[styles.background, { paddingTop: insets.top }]}
            />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: styles.screenContent,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            >
                <Stack.Screen
                    name="login"
                    options={{
                        animation: 'fade',
                        animationDuration: 200,
                    }}
                />

                <Stack.Screen
                    name="register"
                    options={{
                        animation: 'slide_from_bottom',
                        animationDuration: 400,
                    }}
                />

                <Stack.Screen
                    name="forgot-password"
                    options={{
                        animation: 'slide_from_right',
                        animationDuration: 300,
                    }}
                />

                <Stack.Screen
                    name="verify-email"
                    options={{
                        animation: 'fade',
                        animationDuration: 200,
                    }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    screenContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});