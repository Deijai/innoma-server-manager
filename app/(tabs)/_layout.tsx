// app/(tabs)/_layout.tsx - Layout das Tabs COMPLETO
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useServers } from '../../contexts/ServerContext';

export default function TabLayout() {
    const { user } = useAuth();
    const { state } = useServers();
    const { unreadCount } = useNotifications();
    const insets = useSafeAreaInsets();

    if (!user) {
        return null;
    }

    // Calculate server stats for badges
    const totalServers = state.servers.length;
    const onlineServers = Object.values(state.serverStatuses).filter(s => s.isOnline).length;
    const hasOfflineServers = totalServers > onlineServers;

    const TabBarBadge = ({ count, color = '#FF3B30' }: { count: number; color?: string }) => {
        if (count === 0) return null;

        return (
            <View style={[styles.badge, { backgroundColor: color }]}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count.toString()}
                </Text>
            </View>
        );
    };

    const AlertDot = () => (
        <View style={styles.alertDot} />
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#4FACFE',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: [
                    styles.tabBar,
                    {
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                        height: 88 + (insets.bottom > 0 ? insets.bottom : 0),
                    }
                ],
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIconStyle: styles.tabBarIcon,
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                headerTintColor: '#1D1D1F',
                tabBarBackground: () => (
                    <BlurView
                        intensity={100}
                        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    headerTitle: 'Dashboard',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.tabIconContainer}>
                            <Ionicons
                                name={focused ? "speedometer" : "speedometer-outline"}
                                size={size}
                                color={color}
                            />
                            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <View style={styles.serverSummary}>
                                <Text style={styles.summaryText}>
                                    {onlineServers}/{totalServers} online
                                </Text>
                            </View>
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="servers"
                options={{
                    title: 'Servidores',
                    headerTitle: 'Meus Servidores',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.tabIconContainer}>
                            <Ionicons
                                name={focused ? "server" : "server-outline"}
                                size={size}
                                color={color}
                            />
                            {hasOfflineServers && <AlertDot />}
                            {totalServers > 0 && (
                                <TabBarBadge count={totalServers} color="#4FACFE" />
                            )}
                            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <View style={styles.statusSummary}>
                                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                                <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                                    {onlineServers}
                                </Text>
                                <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                                <Text style={[styles.statusText, { color: '#F44336' }]}>
                                    {totalServers - onlineServers}
                                </Text>
                            </View>
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alertas',
                    headerTitle: 'Notificações',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.tabIconContainer}>
                            <Ionicons
                                name={focused ? "notifications" : "notifications-outline"}
                                size={size}
                                color={color}
                            />
                            {unreadCount > 0 && (
                                <TabBarBadge count={unreadCount} color="#FF3B30" />
                            )}
                            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            {unreadCount > 0 && (
                                <View style={styles.unreadIndicator}>
                                    <Text style={styles.unreadText}>
                                        {unreadCount} não lidas
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    headerTitle: 'Meu Perfil',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.tabIconContainer}>
                            <Ionicons
                                name={focused ? "person" : "person-outline"}
                                size={size}
                                color={color}
                            />
                            {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 16,
        position: 'absolute',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 4,
    },
    tabBarIcon: {
        marginBottom: 0,
    },
    header: {
        backgroundColor: 'white',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    tabIconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -12,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 4,
    },
    alertDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF9500',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
    },
    activeDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    headerRight: {
        paddingRight: 16,
    },
    serverSummary: {
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },
    statusSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
    },
    unreadIndicator: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF3B30',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(79, 172, 254, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4FACFE',
    },
});