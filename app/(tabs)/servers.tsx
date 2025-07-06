// app/(tabs)/servers.tsx - Lista de Servidores Elegante
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useServers } from '../../contexts/ServerContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function Servers() {
    const { state, getServerStatus } = useServers();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all'); // all, online, offline

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

    // Filtrar servidores baseado na busca e filtro
    const filteredServers = state.servers.filter(server => {
        const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            server.host.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const status = state.serverStatuses[server.id];
        switch (selectedFilter) {
            case 'online':
                return status?.isOnline === true;
            case 'offline':
                return !status?.isOnline;
            default:
                return true;
        }
    });

    const formatUptime = (uptime: number) => {
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return `${Math.floor(uptime / 60)}m`;
    };

    const handleServerPress = (serverId: string) => {
        router.push(`/server/${serverId}`);
    };

    const handleServerLongPress = (server: any) => {
        Alert.alert(
            server.name,
            'O que você gostaria de fazer?',
            [
                {
                    text: 'Ver Detalhes',
                    onPress: () => router.push(`/server/${server.id}`)
                },
                {
                    text: 'Terminal SSH',
                    onPress: () => router.push({
                        pathname: '/server/command',
                        params: { serverId: server.id }
                    })
                },
                {
                    text: 'Editar',
                    onPress: () => Alert.alert('Em breve', 'Funcionalidade de edição em desenvolvimento')
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    // Componente do Card do Servidor
    const ServerCard = ({ server }: { server: any }) => {
        const status = state.serverStatuses[server.id];
        const isOnline = status?.isOnline;

        return (
            <TouchableOpacity
                style={[styles.serverCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleServerPress(server.id)}
                onLongPress={() => handleServerLongPress(server)}
                activeOpacity={0.7}
            >
                <View style={styles.serverCardContent}>
                    {/* Header */}
                    <View style={styles.serverHeader}>
                        <View style={styles.serverTitleContainer}>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: isOnline ? theme.colors.success : theme.colors.error }
                            ]} />
                            <Text style={[styles.serverName, { color: theme.colors.text }]} numberOfLines={1}>
                                {server.name}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => handleServerLongPress(server)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Server Info */}
                    <View style={styles.serverInfo}>
                        <View style={styles.serverInfoRow}>
                            <Ionicons name="globe-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={[styles.serverHost, { color: theme.colors.textSecondary }]}>
                                {server.host}:{server.port}
                            </Text>
                        </View>
                        <View style={styles.serverInfoRow}>
                            <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={[styles.serverUsername, { color: theme.colors.textSecondary }]}>
                                {server.username}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    {status && isOnline ? (
                        <View style={styles.serverStats}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>CPU</Text>
                                <View style={[styles.statBar, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.statFill,
                                            {
                                                width: `${Math.min(status.cpuUsage, 100)}%`,
                                                backgroundColor: status.cpuUsage > 80 ? theme.colors.error :
                                                    status.cpuUsage > 60 ? theme.colors.warning : theme.colors.success
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {status.cpuUsage.toFixed(0)}%
                                </Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>RAM</Text>
                                <View style={[styles.statBar, { backgroundColor: theme.colors.border }]}>
                                    <View
                                        style={[
                                            styles.statFill,
                                            {
                                                width: `${Math.min(status.memoryUsage, 100)}%`,
                                                backgroundColor: status.memoryUsage > 80 ? theme.colors.error :
                                                    status.memoryUsage > 60 ? theme.colors.warning : theme.colors.success
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                    {status.memoryUsage.toFixed(0)}%
                                </Text>
                            </View>

                            <View style={styles.uptimeContainer}>
                                <Ionicons name="time-outline" size={12} color={theme.colors.success} />
                                <Text style={[styles.uptimeText, { color: theme.colors.success }]}>
                                    Uptime: {formatUptime(status.uptime)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.offlineContainer}>
                            <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
                            <Text style={[styles.offlineText, { color: theme.colors.error }]}>
                                {status ? 'Servidor offline' : 'Verificando status...'}
                            </Text>
                        </View>
                    )}

                    {/* Tags */}
                    {server.tags && server.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {server.tags.slice(0, 3).map((tag: string, index: number) => (
                                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                                </View>
                            ))}
                            {server.tags.length > 3 && (
                                <Text style={[styles.moreTagsText, { color: theme.colors.textSecondary }]}>
                                    +{server.tags.length - 3}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Modal de Filtros
    const FilterModal = () => (
        <Modal
            visible={filterModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setFilterModalVisible(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setFilterModalVisible(false)}
            >
                <BlurView intensity={20} style={styles.filterModal}>
                    <View style={[styles.filterModalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.filterModalTitle, { color: theme.colors.text }]}>
                            Filtrar Servidores
                        </Text>

                        {[
                            { key: 'all', label: 'Todos os servidores', icon: 'server-outline' },
                            { key: 'online', label: 'Apenas online', icon: 'checkmark-circle-outline' },
                            { key: 'offline', label: 'Apenas offline', icon: 'close-circle-outline' }
                        ].map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterOption,
                                    selectedFilter === filter.key && { backgroundColor: theme.colors.primary + '15' }
                                ]}
                                onPress={() => {
                                    setSelectedFilter(filter.key);
                                    setFilterModalVisible(false);
                                }}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={20}
                                    color={selectedFilter === filter.key ? theme.colors.primary : theme.colors.textSecondary}
                                />
                                <Text style={[
                                    styles.filterOptionText,
                                    { color: theme.colors.text },
                                    selectedFilter === filter.key && { color: theme.colors.primary, fontWeight: '600' }
                                ]}>
                                    {filter.label}
                                </Text>
                                {selectedFilter === filter.key && (
                                    <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );

    // Estado Vazio
    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons
                    name={searchQuery ? "search-outline" : "server-outline"}
                    size={48}
                    color={theme.colors.primary}
                />
            </View>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                {searchQuery ? 'Nenhum servidor encontrado' : 'Nenhum servidor ainda'}
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                {searchQuery
                    ? `Nenhum servidor corresponde à busca "${searchQuery}"`
                    : 'Adicione seu primeiro servidor para começar'
                }
            </Text>
            {!searchQuery && (
                <TouchableOpacity
                    style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push('/server/add')}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.emptyStateButtonText}>Adicionar Servidor</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header de Busca e Filtros */}
            <View style={[styles.searchSection, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Buscar servidores..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="funnel-outline" size={20} color={theme.colors.text} />
                    {selectedFilter !== 'all' && (
                        <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Lista de Servidores */}
            <FlatList
                data={filteredServers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ServerCard server={item} />}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 120 } // Espaço para as tabs
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={EmptyState}
            />

            {/* Botão Flutuante de Adicionar */}
            <TouchableOpacity
                style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/server/add')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            <FilterModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        paddingVertical: 0,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    filterBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    serverCard: {
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    serverCardContent: {
        padding: 20,
    },
    serverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serverTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    serverName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        letterSpacing: -0.3,
    },
    moreButton: {
        padding: 8,
        borderRadius: 8,
    },
    serverInfo: {
        marginBottom: 16,
        gap: 8,
    },
    serverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    serverHost: {
        fontSize: 14,
        fontWeight: '500',
    },
    serverUsername: {
        fontSize: 14,
        fontWeight: '500',
    },
    serverStats: {
        marginBottom: 12,
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        width: 35,
    },
    statBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    statFill: {
        height: '100%',
        borderRadius: 3,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
        width: 35,
        textAlign: 'right',
    },
    uptimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    uptimeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    offlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    offlineText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    moreTagsText: {
        fontSize: 10,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterModal: {
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 280,
    },
    filterModalContent: {
        padding: 20,
    },
    filterModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
        gap: 12,
    },
    filterOptionText: {
        fontSize: 16,
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
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
        fontWeight: '600',
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
    fabButton: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 16,
    },
});