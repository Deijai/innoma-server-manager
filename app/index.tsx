// app/index.tsx - Tela Index Principal (Splash/Redirect)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function IndexPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [dotAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Animated loading dots
        const animateDots = () => {
            Animated.sequence([
                Animated.timing(dotAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(dotAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => animateDots());
        };

        animateDots();
    }, []);

    useEffect(() => {
        if (!loading) {
            // Add a small delay for better UX
            setTimeout(() => {
                if (user) {
                    router.replace('/(tabs)/dashboard');
                } else {
                    router.replace('/auth/login');
                }
            }, 1500);
        }
    }, [user, loading, router]);

    const LoadingDots = () => (
        <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            opacity: dotAnim,
                            transform: [
                                {
                                    scale: dotAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1.2],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2', '#6B73FF']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Floating Particles */}
            <View style={styles.particle1} />
            <View style={styles.particle2} />
            <View style={styles.particle3} />
            <View style={styles.particle4} />

            {/* Main Content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo Container */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBackground}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F8F9FA']}
                            style={styles.logoGradient}
                        >
                            <Text style={styles.logoIcon}>🖥️</Text>
                        </LinearGradient>
                    </View>

                    {/* App Name */}
                    <Text style={styles.appName}>Server Manager</Text>
                    <Text style={styles.tagline}>Gerencie seus servidores com facilidade</Text>
                </View>

                {/* Loading Section */}
                <View style={styles.loadingSection}>
                    {loading ? (
                        <>
                            <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.9)" />
                            <Text style={styles.loadingText}>Carregando</Text>
                            <LoadingDots />
                        </>
                    ) : (
                        <>
                            <Ionicons
                                name={user ? "checkmark-circle" : "person-outline"}
                                size={32}
                                color="rgba(255, 255, 255, 0.9)"
                            />
                            <Text style={styles.loadingText}>
                                {user ? 'Bem-vindo de volta!' : 'Iniciando...'}
                            </Text>
                            <LoadingDots />
                        </>
                    )}
                </View>

                {/* Features Preview */}
                <View style={styles.featuresPreview}>
                    <View style={styles.featureItem}>
                        <Ionicons name="server-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.featureText}>Monitoramento em tempo real</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="terminal-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.featureText}>Terminal SSH integrado</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="notifications-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
                        <Text style={styles.featureText}>Alertas inteligentes</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Version Footer */}
            <View style={styles.footer}>
                <Text style={styles.versionText}>v1.0.0</Text>
                <Text style={styles.copyrightText}>Desenvolvido com ❤️</Text>
            </View>
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
    particle1: {
        position: 'absolute',
        top: 100,
        right: 50,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    particle2: {
        position: 'absolute',
        top: 200,
        left: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    particle3: {
        position: 'absolute',
        bottom: 150,
        right: 80,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    particle4: {
        position: 'absolute',
        bottom: 300,
        left: 60,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoBackground: {
        width: 120,
        height: 120,
        borderRadius: 30,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logoGradient: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 48,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '400',
    },
    loadingSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    loadingText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 16,
        fontWeight: '500',
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginHorizontal: 3,
    },
    featuresPreview: {
        alignItems: 'center',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});