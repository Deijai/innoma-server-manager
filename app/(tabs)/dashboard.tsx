// app/(tabs)/dashboard.tsx - Dashboard Principal
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useServers } from '../../contexts/ServerContext';

const { width } = Dimensions.get('window');

export default function Dashboard() {
    const { state, getServerStatus } = useServers();
    const { user } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadServerStatuses();
    }, []);

    const loadServerStatuses = async () => {
        for (const server of state.servers) {
            await getServerStatus(server.id);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadServerStatuses();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const getUserName = () => {
        return user?.email?.split('@')[0] || 'Usuário';
    };

    // Calcular estatísticas
    const totalServers = state.servers.length;
    const onlineServers = Object.values(state.serverStatuses).filter(s => s.isOnline).length;
    const offlineServers = totalServers - onlineServers;
    const avgCpuUsage = onlineServers > 0
        ? Object.values(state.serverStatuses)
            .filter(s => s.isOnline)
            .reduce((acc, s) => acc + s.cpuUsage, 0) / onlineServers
        : 0;

    const QuickStatCard = ({
        title,
        value,
        subtitle,
        color,
        icon,
        onPress
    }: {
        title: string;
        value: string | number;
        subtitle: string;
        color: string;
        icon: string;
        onPress?: () => void;
    }) => (
        <TouchableOpacity
            style={styles.statCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <BlurView intensity={20} style={styles.statCardBlur}>
                <View style={styles.statCardContent}>
                    <View style={styles.statCardHeader}>
                        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon as any} size={20} color={color} />
                        </View>
                        <Text style={styles.statTitle}>{title}</Text>
                    </View>
                    <Text style={[styles.statValue, { color }]}>{value}</Text>
                    <Text style={styles.statSubtitle}>{subtitle}</Text>
                </View>
            </BlurView>
        </TouchableOpacity>
    );

    const ServerQuickCard = ({ server, status }: { server: any, status: any }) => (
        <TouchableOpacity
            style={styles.serverQuickCard}
            onPress={() => router.push(`/server/${server.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.serverQuickCardContent}>
                <View style={styles.serverQuickHeader}>
                    <View style={[
                        styles.serverStatusDot,
                        { backgroundColor: status?.isOnline ? '#4CAF50' : '#F44336' }
                    ]} />
                    <Text style={styles.serverQuickName} numberOfLines={1}>
                        {server.name}
                    </Text>
                </View>

                <Text style={styles.serverQuickHost}>{server.host}</Text>

                {status && (
                    <View style={styles.serverQuickStats}>
                        <View style={styles.serverQuickStat}>
                            <Text style={styles.serverQuickStatLabel}>CPU</Text>
                            <Text style={styles.serverQuickStatValue}>
                                {status.cpuUsage.toFixed(0)}%
                            </Text>
                        </View>
                        <View style={styles.serverQuickStat}>
                            <Text style={styles.serverQuickStatLabel}>RAM</Text>
                            <Text style={styles.serverQuickStatValue}>
                                {status.memoryUsage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const ActionButton = ({
        title,
        icon,
        color,
        onPress
    }: {
        title: string;
        icon: string;
        color: string;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={[color, color + 'DD']}
                style={styles.actionButtonGradient}
            >
                <Ionicons name={icon as any} size={24} color="white" />
                <Text style={styles.actionButtonText}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.backgroundGradient}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="white"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.userName}>{getUserName()}</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <View style={styles.notificationBackground}>
                            <Ionicons name="notifications-outline" size={20} color="#667eea" />
                            <View style={styles.notificationBadge} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.statsRow}>
                        <QuickStatCard
                            title="Total"
                            value={totalServers}
                            subtitle="servidores"
                            color="#4FACFE"
                            icon="server-outline"
                            onPress={() => router.push('/(tabs)/servers')}
                        />
                        <QuickStatCard
                            title="Online"
                            value={onlineServers}
                            subtitle="ativos agora"
                            color="#4CAF50"
                            icon="checkmark-circle-outline"
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <QuickStatCard
                            title="Offline"
                            value={offlineServers}
                            subtitle="inativos"
                            color="#F44336"
                            icon="close-circle-outline"
                        />
                        <QuickStatCard
                            title="CPU Médio"
                            value={`${avgCpuUsage.toFixed(1)}%`}
                            subtitle="uso geral"
                            color="#FF9800"
                            icon="speedometer-outline"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.quickActions}>
                        <ActionButton
                            title="Adicionar Servidor"
                            icon="add-circle"
                            color="#4CAF50"
                            onPress={() => router.push('/server/add')}
                        />
                        <ActionButton
                            title="Ver Todos"
                            icon="list"
                            color="#2196F3"
                            onPress={() => router.push('/(tabs)/servers')}
                        />
                    </View>
                </View>

                {/* Recent Servers */}
                {state.servers.length > 0 ? (
                    <View style={styles.recentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Servidores Recentes</Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/servers')}>
                                <Text style={styles.seeAllButton}>Ver todos</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.recentServers}>
                            {state.servers.slice(0, 4).map(server => (
                                <ServerQuickCard
                                    key={server.id}
                                    server={server}
                                    status={state.serverStatuses[server.id]}
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    // Empty State
                    <View style={styles.emptyState}>
                        <BlurView intensity={20} style={styles.emptyStateCard}>
                            <View style={styles.emptyStateContent}>
                                <View style={styles.emptyStateIcon}>
                                    <Ionicons name="server-outline" size={48} color="#667eea" />
                                </View>
                                <Text style={styles.emptyStateTitle}>Nenhum servidor ainda</Text>
                                <Text style={styles.emptyStateSubtitle}>
                                    Adicione seu primeiro servidor para começar a monitorar
                                </Text>
                                <TouchableOpacity
                                    style={styles.emptyStateButton}
                                    onPress={() => router.push('/server/add')}
                                >
                                    <LinearGradient
                                        colors={['#4CAF50', '#45A049']}
                                        style={styles.emptyStateButtonGradient}
                                    >
                                        <Ionicons name="add" size={20} color="white" />
                                        <Text style={styles.emptyStateButtonText}>Adicionar Servidor</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </BlurView>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greetingContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        color: 'white',
        fontWeight: '700',
        marginTop: 2,
    },
    notificationButton: {
        padding: 4,
    },
    notificationBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F44336',
    },
    quickStats: {
        marginBottom: 28,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 16,
        overflow: 'hidden',
    },
    statCardBlur: {
        flex: 1,
    },
    statCardContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 16,
    },
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    statTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    quickActionsSection: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    recentSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllButton: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    recentServers: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serverQuickCard: {
        width: (width - 52) / 2,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        overflow: 'hidden',
    },
    serverQuickCardContent: {
        padding: 12,
    },
    serverQuickHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    serverStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    serverQuickName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    serverQuickHost: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    serverQuickStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    serverQuickStat: {
        alignItems: 'center',
    },
    serverQuickStatLabel: {
        fontSize: 10,
        color: '#999',
        marginBottom: 2,
    },
    serverQuickStatValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    emptyState: {
        marginTop: 40,
    },
    emptyStateCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    emptyStateContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 40,
        alignItems: 'center',
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyStateButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    emptyStateButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    emptyStateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});