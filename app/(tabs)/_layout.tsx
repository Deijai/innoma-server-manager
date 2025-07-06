// app/(tabs)/_layout.tsx - Layout das Tabs Elegante e Moderno
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useServers } from '../../contexts/ServerContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
    const { user } = useAuth();
    const { state } = useServers();
    const { unreadCount } = useNotifications();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    if (!user) {
        return null;
    }

    // Calcular estatísticas dos servidores para badges
    const totalServers = state.servers.length;
    const onlineServers = Object.values(state.serverStatuses).filter(s => s.isOnline).length;
    const hasOfflineServers = totalServers > onlineServers;

    // Componente para Badge personalizado
    const TabBadge = ({ count, color = theme.colors.error, show = true }: {
        count: number;
        color?: string;
        show?: boolean;
    }) => {
        if (!show || count === 0) return null;

        return (
            <View style={[styles.badge, { backgroundColor: color }]}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count.toString()}
                </Text>
            </View>
        );
    };

    // Componente para Dot de alerta
    const AlertDot = ({ show = true }: { show?: boolean }) => {
        if (!show) return null;

        return (
            <View style={[styles.alertDot, { backgroundColor: theme.colors.warning }]} />
        );
    };

    // Componente para Status dos servidores
    const ServerStatusIndicator = () => (
        <View style={styles.headerRight}>
            <View style={styles.statusSummary}>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={[styles.statusText, { color: theme.colors.success }]}>
                        {onlineServers}
                    </Text>
                </View>
                <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
                    <Text style={[styles.statusText, { color: theme.colors.error }]}>
                        {totalServers - onlineServers}
                    </Text>
                </View>
            </View>
        </View>
    );

    // Componente para Avatar do usuário
    const UserAvatar = () => (
        <View style={styles.headerRight}>
            <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
            </View>
        </View>
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopColor: theme.colors.border,
                        paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
                        height: 88 + (insets.bottom > 0 ? insets.bottom : 0),
                    }
                ],
                tabBarLabelStyle: [styles.tabBarLabel, { color: theme.colors.textSecondary }],
                tabBarIconStyle: styles.tabBarIcon,
                headerStyle: [styles.header, { backgroundColor: theme.colors.surface }],
                headerTitleStyle: [styles.headerTitle, { color: theme.colors.text }],
                headerTintColor: theme.colors.text,
                tabBarBackground: () => (
                    <BlurView
                        intensity={theme.dark ? 80 : 100}
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: theme.dark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)' }
                        ]}
                    />
                ),
                headerBackground: () => (
                    <BlurView
                        intensity={theme.dark ? 80 : 100}
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: theme.dark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
                        ]}
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
                            <View style={[
                                styles.iconBackground,
                                focused && { backgroundColor: theme.colors.primary + '15' }
                            ]}>
                                <Ionicons
                                    name={focused ? "speedometer" : "speedometer-outline"}
                                    size={size}
                                    color={color}
                                />
                            </View>
                            {focused && (
                                <View style={[styles.activeDot, { backgroundColor: color }]} />
                            )}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <View style={styles.summaryContainer}>
                                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
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
                            <View style={[
                                styles.iconBackground,
                                focused && { backgroundColor: theme.colors.primary + '15' }
                            ]}>
                                <Ionicons
                                    name={focused ? "server" : "server-outline"}
                                    size={size}
                                    color={color}
                                />
                            </View>
                            <AlertDot show={hasOfflineServers} />
                            <TabBadge
                                count={totalServers}
                                color={theme.colors.primary}
                                show={totalServers > 0}
                            />
                            {focused && (
                                <View style={[styles.activeDot, { backgroundColor: color }]} />
                            )}
                        </View>
                    ),
                    headerRight: () => <ServerStatusIndicator />,
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alertas',
                    headerTitle: 'Notificações',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.tabIconContainer}>
                            <View style={[
                                styles.iconBackground,
                                focused && { backgroundColor: theme.colors.primary + '15' }
                            ]}>
                                <Ionicons
                                    name={focused ? "notifications" : "notifications-outline"}
                                    size={size}
                                    color={color}
                                />
                            </View>
                            <TabBadge
                                count={unreadCount}
                                color={theme.colors.error}
                                show={unreadCount > 0}
                            />
                            {focused && (
                                <View style={[styles.activeDot, { backgroundColor: color }]} />
                            )}
                        </View>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            {unreadCount > 0 && (
                                <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.error + '15' }]}>
                                    <Text style={[styles.unreadText, { color: theme.colors.error }]}>
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
                            <View style={[
                                styles.iconBackground,
                                focused && { backgroundColor: theme.colors.primary + '15' }
                            ]}>
                                <Ionicons
                                    name={focused ? "person" : "person-outline"}
                                    size={size}
                                    color={color}
                                />
                            </View>
                            {focused && (
                                <View style={[styles.activeDot, { backgroundColor: color }]} />
                            )}
                        </View>
                    ),
                    headerRight: () => <UserAvatar />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        borderTopWidth: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 20,
        overflow: 'hidden',
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.2,
    },
    tabBarIcon: {
        marginBottom: 0,
    },
    header: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    tabIconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
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
        paddingHorizontal: 2,
    },
    alertDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
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
    summaryContainer: {
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    statusSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusItem: {
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
        fontWeight: '700',
    },
    unreadIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: '600',
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(79, 172, 254, 0.2)',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
});