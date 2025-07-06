// components/ServerCard.tsx - Componente ServerCard Atualizado
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ServerCardProps {
    server: any;
    status?: any;
    onPress?: () => void;
    onLongPress?: () => void;
}

export function ServerCard({ server, status, onPress, onLongPress }: ServerCardProps) {
    const { theme } = useTheme();

    const isOnline = status?.isOnline;
    const statusColor = isOnline ? theme.colors.success : theme.colors.error;

    const formatUptime = (uptime: number) => {
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return `${Math.floor(uptime / 60)}m`;
    };

    const getUsageColor = (usage: number) => {
        if (usage > 80) return theme.colors.error;
        if (usage > 60) return theme.colors.warning;
        return theme.colors.success;
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.serverInfo}>
                    <View style={styles.titleRow}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.serverName, { color: theme.colors.text }]} numberOfLines={1}>
                            {server.name}
                        </Text>
                    </View>
                    <Text style={[styles.serverHost, { color: theme.colors.textSecondary }]}>
                        {server.host}:{server.port}
                    </Text>
                </View>

                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Status and Stats */}
            {status && isOnline ? (
                <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                        <View style={styles.stat}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>CPU</Text>
                            <View style={[styles.statBar, { backgroundColor: theme.colors.border }]}>
                                <View
                                    style={[
                                        styles.statFill,
                                        {
                                            width: `${Math.min(status.cpuUsage, 100)}%`,
                                            backgroundColor: getUsageColor(status.cpuUsage)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {status.cpuUsage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statRow}>
                        <View style={styles.stat}>
                            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>RAM</Text>
                            <View style={[styles.statBar, { backgroundColor: theme.colors.border }]}>
                                <View
                                    style={[
                                        styles.statFill,
                                        {
                                            width: `${Math.min(status.memoryUsage, 100)}%`,
                                            backgroundColor: getUsageColor(status.memoryUsage)
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.statValue, { color: theme.colors.text }]}>
                                {status.memoryUsage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.uptimeRow}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.success} />
                        <Text style={[styles.uptimeText, { color: theme.colors.success }]}>
                            Uptime: {formatUptime(status.uptime)}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.offlineContainer}>
                    <Ionicons name="warning-outline" size={16} color={statusColor} />
                    <Text style={[styles.offlineText, { color: statusColor }]}>
                        {status ? 'Servidor offline' : 'Verificando status...'}
                    </Text>
                </View>
            )}

            {/* Tags */}
            {server.tags && server.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {server.tags.slice(0, 3).map((tag: string, index: number) => (
                        <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
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
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Notifications styles
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    filterTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    markAllReadButton: {
        marginLeft: 'auto',
    },
    markAllReadText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    notificationCard: {
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4FACFE',
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    settingsModal: {
        height: '60%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    settingsContent: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    settingsList: {
        flex: 1,
    },
    settingGroup: {
        padding: 20,
    },
    settingGroupTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    switch: {
        width: 36,
        height: 20,
        borderRadius: 10,
        position: 'relative',
    },
    switchThumb: {
        width: 16,
        height: 16,
        borderRadius: 8,
        position: 'absolute',
        top: 2,
    },

    // ServerCard styles
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    serverInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    serverName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    serverHost: {
        fontSize: 14,
    },
    moreButton: {
        padding: 4,
    },
    statsContainer: {
        marginBottom: 8,
    },
    statRow: {
        marginBottom: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        width: 35,
    },
    statBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 8,
    },
    statFill: {
        height: '100%',
        borderRadius: 2,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '500',
        width: 35,
        textAlign: 'right',
    },
    uptimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    uptimeText: {
        fontSize: 12,
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
        marginLeft: 6,
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '500',
    },
    moreTagsText: {
        fontSize: 10,
        fontWeight: '500',
    },
});