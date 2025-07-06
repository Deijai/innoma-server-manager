// app/(tabs)/servers.tsx - Lista de Servidores
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useServers } from '../../contexts/ServerContext';

export default function Servers() {
    const { state, getServerStatus } = useServers();
    const router = useRouter();
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

    const ServerCard = ({ server }: { server: any }) => {
        const status = state.serverStatuses[server.id];
        const isOnline = status?.isOnline;

        return (
            <TouchableOpacity
                style={styles.serverCard}
                onPress={() => handleServerPress(server.id)}
                onLongPress={() => handleServerLongPress(server)}
                activeOpacity={0.7}
            >
                <BlurView intensity={20} style={styles.serverCardBlur}>
                    <View style={styles.serverCardContent}>
                        {/* Header */}
                        <View style={styles.serverCardHeader}>
                            <View style={styles.serverTitleContainer}>
                                <View style={[
                                    styles.statusIndicator,
                                    { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }
                                ]} />
                                <Text style={styles.serverName} numberOfLines={1}>
                                    {server.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.moreButton}
                                onPress={() => handleServerLongPress(server)}
                            >
                                <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Server Info */}
                        <View style={styles.serverInfo}>
                            <View style={styles.serverInfoRow}>
                                <Ionicons name="globe-outline" size={14} color="#666" />
                                <Text style={styles.serverHost}>{server.host}:{server.port}</Text>
                            </View>
                            <View style={styles.serverInfoRow}>
                                <Ionicons name="person-outline" size={14} color="#666" />
                                <Text style={styles.serverUsername}>{server.username}</Text>
                            </View>
                        </View>

                        {/* Stats */}
                        {status && isOnline ? (
                            <View style={styles.serverStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>CPU</Text>
                                    <View style={styles.statBar}>
                                        <View
                                            style={[
                                                styles.statFill,
                                                {
                                                    width: `${Math.min(status.cpuUsage, 100)}%`,
                                                    backgroundColor: status.cpuUsage > 80 ? '#F44336' :
                                                        status.cpuUsage > 60 ? '#FF9800' : '#4CAF50'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.statValue}>{status.cpuUsage.toFixed(0)}%</Text>
                                </View>

                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>RAM</Text>
                                    <View style={styles.statBar}>
                                        <View
                                            style={[
                                                styles.statFill,
                                                {
                                                    width: `${Math.min(status.memoryUsage, 100)}%`,
                                                    backgroundColor: status.memoryUsage > 80 ? '#F44336' :
                                                        status.memoryUsage > 60 ? '#FF9800' : '#4CAF50'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.statValue}>{status.memoryUsage.toFixed(0)}%</Text>
                                </View>

                                <View style={styles.uptimeContainer}>
                                    <Ionicons name="time-outline" size={12} color="#4CAF50" />
                                    <Text style={styles.uptimeText}>
                                        Uptime: {formatUptime(status.uptime)}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.offlineContainer}>
                                <Ionicons name="warning-outline" size={16} color="#F44336" />
                                <Text style={styles.offlineText}>
                                    {status ? 'Servidor offline' : 'Verificando status...'}
                                </Text>
                            </View>
                        )}

                        {/* Tags */}
                        {server.tags && server.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {server.tags.slice(0, 3).map((tag: string, index: number) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                                {server.tags.length > 3 && (
                                    <Text style={styles.moreTagsText}>+{server.tags.length - 3}</Text>
                                )}
                            </View>
                        )}
                    </View>
                </BlurView>
            </TouchableOpacity>
        );
    };

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
                    <View style={styles.filterModalContent}>
                        <Text style={styles.filterModalTitle}>Filtrar Servidores</Text>

                        {[
                            { key: 'all', label: 'Todos os servidores', icon: 'server-outline' },
                            { key: 'online', label: 'Apenas online', icon: 'checkmark-circle-outline' },
                            { key: 'offline', label: 'Apenas offline', icon: 'close-circle-outline' }
                        ].map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterOption,
                                    selectedFilter === filter.key && styles.filterOptionSelected
                                ]}
                                onPress={() => {
                                    setSelectedFilter(filter.key);
                                    setFilterModalVisible(false);
                                }}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={20}
                                    color={selectedFilter === filter.key ? '#4FACFE' : '#666'}
                                />
                                <Text style={[
                                    styles.filterOptionText,
                                    selectedFilter === filter.key && styles.filterOptionTextSelected
                                ]}>
                                    {filter.label}
                                </Text>
                                {selectedFilter === filter.key && (
                                    <Ionicons name="checkmark" size={16} color="#4FACFE" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </BlurView>
            </TouchableOpacity>
        </Modal>
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <Ionicons
                    name={searchQuery ? "search-outline" : "server-outline"}
                    size={48}
                    color="#667eea"
                />
            </View>
            <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'Nenhum servidor encontrado' : 'Nenhum servidor ainda'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
                {searchQuery
                    ? `Nenhum servidor corresponde à busca "${searchQuery}"`
                    : 'Adicione seu primeiro servidor para começar'
                }
            </Text>
            {!searchQuery && (
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
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.backgroundGradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Servidores</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredServers.length} de {state.servers.length} servidores
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/server/add')}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#45A049']}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <BlurView intensity={20} style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search-outline" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar servidores..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </BlurView>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <BlurView intensity={20} style={styles.filterButtonBlur}>
                        <View style={styles.filterButtonContent}>
                            <Ionicons name="funnel-outline" size={20} color="white" />
                            {selectedFilter !== 'all' && <View style={styles.filterBadge} />}
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </View>

            {/* Servers List */}
            <FlatList
                data={filteredServers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ServerCard server={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="white"
                    />
                }
                ListEmptyComponent={EmptyState}
            />

            <FilterModal />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    addButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    addButtonGradient: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    searchContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    filterButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    filterButtonBlur: {
        width: 48,
        height: 48,
    },
    filterButtonContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    serverCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    serverCardBlur: {
        flex: 1,
    },
    serverCardContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 16,
    },
    serverCardHeader: {
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
        marginRight: 8,
    },
    serverName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    moreButton: {
        padding: 4,
    },
    serverInfo: {
        marginBottom: 12,
    },
    serverInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    serverHost: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    serverUsername: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    serverStats: {
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        width: 35,
    },
    statBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        marginHorizontal: 8,
    },
    statFill: {
        height: '100%',
        borderRadius: 2,
    },
    statValue: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        width: 35,
        textAlign: 'right',
    },
    uptimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    uptimeText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '500',
    },
    offlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    offlineText: {
        fontSize: 14,
        color: '#F44336',
        marginLeft: 6,
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 6,
    },
    tagText: {
        fontSize: 10,
        color: '#1976D2',
        fontWeight: '500',
    },
    moreTagsText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 20,
    },
    filterModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    filterOptionSelected: {
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
    },
    filterOptionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    filterOptionTextSelected: {
        color: '#4FACFE',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
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