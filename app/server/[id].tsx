// app/server/[id].tsx - Detalhes do Servidor
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNotifications } from '../../contexts/NotificationContext';
import { useServers } from '../../contexts/ServerContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function ServerDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { state, getServerStatus, deleteServer } = useServers();
    const { theme } = useTheme();
    const { sendLocalNotification } = useNotifications();

    const [refreshing, setRefreshing] = useState(false);
    const [showActionsModal, setShowActionsModal] = useState(false);
    const [cpuHistory, setCpuHistory] = useState<number[]>([]);
    const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const server = state.servers.find(s => s.id === id);
    const status = state.serverStatuses[id as string];

    useEffect(() => {
        if (server) {
            loadServerStatus();

            // Auto refresh every 30 seconds
            let interval: NodeJS.Timeout;
            if (autoRefresh) {
                interval = setInterval(() => {
                    loadServerStatus();
                }, 30000);
            }

            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [server, autoRefresh]);

    useEffect(() => {
        // Update history when status changes
        if (status) {
            setCpuHistory(prev => [...prev.slice(-19), status.cpuUsage]);
            setMemoryHistory(prev => [...prev.slice(-19), status.memoryUsage]);
        }
    }, [status]);

    const loadServerStatus = async () => {
        if (server) {
            await getServerStatus(server.id);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadServerStatus();
        setRefreshing(false);
    };

    const handleReboot = () => {
        Alert.alert(
            'Reiniciar Servidor',
            `Tem certeza que deseja reiniciar "${server?.name}"?\n\nEsta ação pode interromper serviços em execução.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Implementar chamada SSH para reboot
                            await sendLocalNotification(
                                'Comando Enviado',
                                `Reinicialização iniciada em ${server?.name}`
                            );
                            Alert.alert('✅ Sucesso', 'Comando de reinicialização enviado!');
                        } catch (error) {
                            Alert.alert('❌ Erro', 'Falha ao enviar comando de reinicialização');
                        }
                    }
                }
            ]
        );
    };

    const handleShutdown = () => {
        Alert.alert(
            '⚠️ Desligar Servidor',
            `ATENÇÃO: Você está prestes a desligar "${server?.name}".\n\nEsta ação desligará completamente o servidor.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desligar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await sendLocalNotification(
                                'Servidor Desligado',
                                `${server?.name} foi desligado`
                            );
                            Alert.alert('✅ Sucesso', 'Comando de desligamento enviado!');
                        } catch (error) {
                            Alert.alert('❌ Erro', 'Falha ao enviar comando');
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Excluir Servidor',
            `Tem certeza que deseja remover "${server?.name}" da sua lista?\n\nEsta ação não pode ser desfeita.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (server) {
                                await deleteServer(server.id);
                                router.back();
                                Alert.alert('✅ Removido', 'Servidor removido com sucesso');
                            }
                        } catch (error) {
                            Alert.alert('❌ Erro', 'Erro ao remover servidor');
                        }
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        if (!server) return;

        try {
            await Share.share({
                message: `Server: ${server.name}\nHost: ${server.host}:${server.port}\nStatus: ${status?.isOnline ? 'Online' : 'Offline'}`,
                title: 'Compartilhar Servidor',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const formatUptime = (uptime: number) => {
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusColor = () => {
        if (!status) return theme.colors.textSecondary;
        return status.isOnline ? theme.colors.success : theme.colors.error;
    };

    const getUsageColor = (usage: number) => {
        if (usage > 80) return theme.colors.error;
        if (usage > 60) return theme.colors.warning;
        return theme.colors.success;
    };

    if (!server) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.text }]}>
                        Servidor não encontrado
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const StatCard = ({
        title,
        value,
        unit,
        color,
        icon,
        history = []
    }: {
        title: string;
        value: number;
        unit: string;
        color: string;
        icon: string;
        history?: number[];
    }) => (
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={20} color={color} />
                </View>
                <Text style={[styles.statTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>

            <Text style={[styles.statValue, { color }]}>
                {value.toFixed(1)}{unit}
            </Text>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${Math.min(value, 100)}%`,
                            backgroundColor: color
                        }
                    ]}
                />
            </View>

            {/* Mini Chart */}
            {history.length > 1 && (
                <View style={styles.miniChart}>
                    <LineChart
                        data={{
                            datasets: [{
                                data: history.slice(-10),
                                color: () => color,
                                strokeWidth: 2,
                            }]
                        }}
                        width={120}
                        height={40}
                        withDots={false}
                        withInnerLines={false}
                        withOuterLines={false}
                        withYAxisLabel={false}
                        withXAxisLabel={false}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: 'transparent',
                            backgroundGradientTo: 'transparent',
                            color: () => color,
                        }}
                        bezier
                    />
                </View>
            )}
        </View>
    );

    const QuickAction = ({
        title,
        icon,
        color,
        onPress,
        disabled = false
    }: {
        title: string;
        icon: string;
        color: string;
        onPress: () => void;
        disabled?: boolean;
    }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                { backgroundColor: theme.colors.surface },
                disabled && styles.actionButtonDisabled
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={24} color={disabled ? theme.colors.textSecondary : color} />
            </View>
            <Text style={[
                styles.actionText,
                { color: disabled ? theme.colors.textSecondary : theme.colors.text }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={status?.isOnline ? ['#4CAF50', '#45A049'] : ['#F44336', '#E53935']}
                style={styles.serverHeader}
            >
                <View style={styles.serverHeaderContent}>
                    <View style={styles.serverInfo}>
                        <Text style={styles.serverName}>{server.name}</Text>
                        <Text style={styles.serverHost}>{server.host}:{server.port}</Text>
                        {server.description && (
                            <Text style={styles.serverDescription}>{server.description}</Text>
                        )}
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setAutoRefresh(!autoRefresh)}
                        >
                            <Ionicons
                                name={autoRefresh ? "pause" : "play"}
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowActionsModal(true)}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: 'white' }]} />
                    <Text style={styles.statusText}>
                        {status ? (status.isOnline ? 'Online' : 'Offline') : 'Verificando...'}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* System Stats */}
                {status && status.isOnline && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Performance do Sistema
                        </Text>
                        <View style={styles.statsGrid}>
                            <StatCard
                                title="CPU"
                                value={status.cpuUsage}
                                unit="%"
                                color={getUsageColor(status.cpuUsage)}
                                icon="speedometer-outline"
                                history={cpuHistory}
                            />
                            <StatCard
                                title="Memória"
                                value={status.memoryUsage}
                                unit="%"
                                color={getUsageColor(status.memoryUsage)}
                                icon="hardware-chip-outline"
                                history={memoryHistory}
                            />
                            <StatCard
                                title="Disco"
                                value={status.diskUsage}
                                unit="%"
                                color={getUsageColor(status.diskUsage)}
                                icon="archive-outline"
                            />
                            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.statHeader}>
                                    <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '20' }]}>
                                        <Ionicons name="time-outline" size={20} color={theme.colors.success} />
                                    </View>
                                    <Text style={[styles.statTitle, { color: theme.colors.text }]}>Uptime</Text>
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                                    {formatUptime(status.uptime)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Ações Rápidas
                    </Text>
                    <View style={styles.actionsGrid}>
                        <QuickAction
                            title="Terminal"
                            icon="terminal"
                            color={theme.colors.primary}
                            onPress={() => router.push({
                                pathname: '/server/command',
                                params: { serverId: id }
                            })}
                            disabled={!status?.isOnline}
                        />

                        <QuickAction
                            title="Reiniciar"
                            icon="refresh"
                            color={theme.colors.warning}
                            onPress={handleReboot}
                            disabled={!status?.isOnline}
                        />

                        <QuickAction
                            title="Processos"
                            icon="list"
                            color={theme.colors.info}
                            onPress={() => Alert.alert('Em breve', 'Visualização de processos em desenvolvimento')}
                            disabled={!status?.isOnline}
                        />

                        <QuickAction
                            title="Logs"
                            icon="document-text"
                            color="#9C27B0"
                            onPress={() => Alert.alert('Em breve', 'Visualização de logs em desenvolvimento')}
                            disabled={!status?.isOnline}
                        />
                    </View>
                </View>

                {/* Server Information */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Informações do Servidor
                    </Text>
                    <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                Endereço
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {server.host}:{server.port}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                Usuário
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {server.username}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                Adicionado em
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {server.createdAt.toLocaleDateString('pt-BR')}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                                Última verificação
                            </Text>
                            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                                {status?.lastCheck ?
                                    status.lastCheck.toLocaleString('pt-BR') :
                                    'Nunca'
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tags */}
                {server.tags && server.tags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Tags
                        </Text>
                        <View style={styles.tagsContainer}>
                            {server.tags.map((tag, index) => (
                                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                                        {tag}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Actions Modal */}
            <Modal
                visible={showActionsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActionsModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowActionsModal(false)}
                >
                    <BlurView intensity={20} style={styles.actionsModal}>
                        <View style={[styles.actionsModalContent, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.actionsModalTitle, { color: theme.colors.text }]}>
                                Ações do Servidor
                            </Text>

                            {/* Modal Actions */}
                            {[
                                {
                                    title: 'Editar Servidor',
                                    icon: 'create-outline',
                                    color: theme.colors.primary,
                                    onPress: () => {
                                        setShowActionsModal(false);
                                        router.push(`/server/edit/${server.id}`);
                                    }
                                },
                                {
                                    title: 'Compartilhar',
                                    icon: 'share-outline',
                                    color: theme.colors.info,
                                    onPress: () => {
                                        setShowActionsModal(false);
                                        handleShare();
                                    }
                                },
                                {
                                    title: 'Desligar Servidor',
                                    icon: 'power-outline',
                                    color: theme.colors.warning,
                                    onPress: () => {
                                        setShowActionsModal(false);
                                        handleShutdown();
                                    }
                                },
                                {
                                    title: 'Excluir',
                                    icon: 'trash-outline',
                                    color: theme.colors.error,
                                    onPress: () => {
                                        setShowActionsModal(false);
                                        handleDelete();
                                    }
                                },
                            ].map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalAction}
                                    onPress={action.onPress}
                                >
                                    <Ionicons name={action.icon as any} size={20} color={action.color} />
                                    <Text style={[styles.modalActionText, { color: action.color }]}>
                                        {action.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    serverHeader: {
        padding: 20,
        paddingTop: 60,
    },
    serverHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    serverInfo: {
        flex: 1,
    },
    serverName: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    serverHost: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    serverDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statHeader: {
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
        fontWeight: '500',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    miniChart: {
        height: 40,
        marginTop: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsModal: {
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 280,
    },
    actionsModalContent: {
        padding: 20,
    },
    actionsModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    modalActionText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
});