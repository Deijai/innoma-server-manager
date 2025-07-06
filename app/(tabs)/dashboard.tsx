// app/(tabs)/dashboard.tsx - Dashboard Elegante com Espaçamento Correto
import { Ionicons } from '@expo/vector-icons';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useServers } from '../../contexts/ServerContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function Dashboard() {
    const { state, getServerStatus } = useServers();
    const { user } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
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

    // Componente de Card de Estatística
    const StatCard = ({
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
            style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.statCardContent}>
                <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
                        <Ionicons name={icon as any} size={24} color={color} />
                    </View>
                    <Text style={[styles.statTitle, { color: theme.colors.text }]}>
                        {title}
                    </Text>
                </View>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={[styles.statSubtitle, { color: theme.colors.textSecondary }]}>
                    {subtitle}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // Componente de Card de Servidor Rápido
    const ServerQuickCard = ({ server, status }: { server: any, status: any }) => (
        <TouchableOpacity
            style={[styles.serverCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/server/${server.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.serverCardContent}>
                <View style={styles.serverHeader}>
                    <View style={[
                        styles.serverStatusDot,
                        { backgroundColor: status?.isOnline ? theme.colors.success : theme.colors.error }
                    ]} />
                    <Text style={[styles.serverName, { color: theme.colors.text }]} numberOfLines={1}>
                        {server.name}
                    </Text>
                </View>

                <Text style={[styles.serverHost, { color: theme.colors.textSecondary }]}>
                    {server.host}
                </Text>

                {status && status.isOnline ? (
                    <View style={styles.serverStats}>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                CPU
                            </Text>
                            <Text style={[styles.statValueSmall, { color: theme.colors.text }]}>
                                {status.cpuUsage.toFixed(0)}%
                            </Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                RAM
                            </Text>
                            <Text style={[styles.statValueSmall, { color: theme.colors.text }]}>
                                {status.memoryUsage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.offlineStatus}>
                        <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                        <Text style={[styles.offlineText, { color: theme.colors.error }]}>
                            Offline
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 120 } // Espaço para as tabs
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header de Boas-vindas */}
                <View style={styles.welcomeSection}>
                    <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                        {getGreeting()},
                    </Text>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>
                        {getUserName()}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Aqui está um resumo dos seus servidores
                    </Text>
                </View>

                {/* Cards de Estatísticas */}
                <View style={styles.statsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Visão Geral
                    </Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Total"
                            value={totalServers}
                            subtitle="servidores"
                            color={theme.colors.primary}
                            icon="server-outline"
                            onPress={() => router.push('/(tabs)/servers')}
                        />
                        <StatCard
                            title="Online"
                            value={onlineServers}
                            subtitle="funcionando"
                            color={theme.colors.success}
                            icon="checkmark-circle-outline"
                        />
                        <StatCard
                            title="Offline"
                            value={offlineServers}
                            subtitle="com problemas"
                            color={theme.colors.error}
                            icon="close-circle-outline"
                        />
                        <StatCard
                            title="CPU Médio"
                            value={`${avgCpuUsage.toFixed(1)}%`}
                            subtitle="uso geral"
                            color={theme.colors.warning}
                            icon="speedometer-outline"
                        />
                    </View>
                </View>

                {/* Ações Rápidas */}
                <View style={styles.actionsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Ações Rápidas
                    </Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
                            onPress={() => router.push('/server/add')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.primaryActionContent}>
                                <Ionicons name="add-circle" size={24} color="white" />
                                <Text style={styles.primaryActionText}>Adicionar Servidor</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryAction, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => router.push('/(tabs)/servers')}
                            activeOpacity={0.7}
                        >
                            <View style={styles.secondaryActionContent}>
                                <Ionicons name="list" size={20} color={theme.colors.primary} />
                                <Text style={[styles.secondaryActionText, { color: theme.colors.primary }]}>
                                    Ver Todos
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Servidores Recentes */}
                {state.servers.length > 0 ? (
                    <View style={styles.serversSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Servidores Recentes
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/servers')}>
                                <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>
                                    Ver todos
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.serversGrid}>
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
                    // Estado Vazio
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyStateCard, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.emptyStateContent}>
                                <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="server-outline" size={48} color={theme.colors.primary} />
                                </View>
                                <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                                    Nenhum servidor ainda
                                </Text>
                                <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                                    Adicione seu primeiro servidor para começar a monitorar
                                </Text>
                                <TouchableOpacity
                                    style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={() => router.push('/server/add')}
                                >
                                    <Ionicons name="add" size={20} color="white" />
                                    <Text style={styles.emptyStateButtonText}>Adicionar Servidor</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    welcomeSection: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    statsSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        width: (width - 52) / 2,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statCardContent: {
        padding: 20,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    actionsSection: {
        marginBottom: 32,
    },
    actionsGrid: {
        gap: 12,
    },
    primaryAction: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 12,
    },
    primaryActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 12,
    },
    primaryActionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    secondaryAction: {
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    secondaryActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    secondaryActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    serversSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllButton: {
        fontSize: 14,
        fontWeight: '600',
    },
    serversGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    serverCard: {
        width: (width - 52) / 2,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    serverCardContent: {
        padding: 16,
    },
    serverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    serverStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    serverName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    serverHost: {
        fontSize: 12,
        marginBottom: 12,
    },
    serverStats: {
        gap: 6,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statValueSmall: {
        fontSize: 12,
        fontWeight: '600',
    },
    offlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    offlineText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        marginTop: 40,
    },
    emptyStateCard: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    emptyStateContent: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    emptyStateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});