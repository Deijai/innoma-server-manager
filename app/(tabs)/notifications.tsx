// app/(tabs)/notifications.tsx - Página de Notificações Redesenhada
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function Notifications() {
    const {
        notifications,
        settings,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        updateSettings
    } = useNotifications();

    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleClearAll = () => {
        Alert.alert(
            'Limpar Notificações',
            'Tem certeza que deseja remover todas as notificações?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpar', style: 'destructive', onPress: clearNotifications }
            ]
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'server_offline': return 'server-outline';
            case 'high_cpu': return 'speedometer-outline';
            case 'high_memory': return 'hardware-chip-outline';
            case 'disk_space': return 'archive-outline';
            case 'ssh_failed': return 'key-outline';
            default: return 'notifications-outline';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'server_offline': return theme.colors.error;
            case 'high_cpu': return theme.colors.warning;
            case 'high_memory': return theme.colors.warning;
            case 'disk_space': return theme.colors.error;
            case 'ssh_failed': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}m atrás`;
        return 'Agora';
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' || (filter === 'unread' && !n.read)
    );

    const NotificationCard = ({ notification }: { notification: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                { backgroundColor: theme.colors.surface },
                !notification.read && styles.unreadCard
            ]}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.7}
        >
            <View style={styles.notificationContent}>
                <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) + '15' }
                ]}>
                    <Ionicons
                        name={getNotificationIcon(notification.type) as any}
                        size={20}
                        color={getNotificationColor(notification.type)}
                    />
                </View>

                <View style={styles.notificationText}>
                    <View style={styles.notificationHeader}>
                        <Text style={[
                            styles.notificationTitle,
                            { color: theme.colors.text },
                            !notification.read && styles.unreadTitle
                        ]}>
                            {notification.title}
                        </Text>
                        {!notification.read && (
                            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                        )}
                    </View>
                    <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>
                        {notification.body}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
                        {formatTimeAgo(notification.timestamp)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const SettingsModal = () => (
        <Modal
            visible={showSettings}
            transparent
            animationType="slide"
            onRequestClose={() => setShowSettings(false)}
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} style={styles.settingsModal}>
                    <View style={[styles.settingsContent, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Configurações de Notificação
                            </Text>
                            <TouchableOpacity onPress={() => setShowSettings(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
                            {/* Main Toggle */}
                            <View style={styles.settingGroup}>
                                <Text style={[styles.settingGroupTitle, { color: theme.colors.text }]}>
                                    Geral
                                </Text>

                                <View style={styles.settingItem}>
                                    <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                                    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                                        Todas as notificações
                                    </Text>
                                    <Switch
                                        value={settings.enabled}
                                        onValueChange={(value) => updateSettings({ enabled: value })}
                                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                        thumbColor="white"
                                    />
                                </View>
                            </View>

                            {/* Alert Types */}
                            <View style={styles.settingGroup}>
                                <Text style={[styles.settingGroupTitle, { color: theme.colors.text }]}>
                                    Tipos de Alerta
                                </Text>

                                {[
                                    { key: 'serverOffline', label: 'Servidor offline', icon: 'server-outline' },
                                    { key: 'highCpuUsage', label: 'Alto uso de CPU', icon: 'speedometer-outline' },
                                    { key: 'highMemoryUsage', label: 'Alto uso de memória', icon: 'hardware-chip-outline' },
                                    { key: 'diskSpaceLow', label: 'Pouco espaço em disco', icon: 'archive-outline' },
                                    { key: 'sshConnectionFailed', label: 'Falha na conexão SSH', icon: 'key-outline' },
                                ].map((setting) => (
                                    <View key={setting.key} style={styles.settingItem}>
                                        <Ionicons
                                            name={setting.icon as any}
                                            size={20}
                                            color={theme.colors.textSecondary}
                                        />
                                        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                                            {setting.label}
                                        </Text>
                                        <Switch
                                            value={settings[setting.key as keyof typeof settings] as boolean}
                                            onValueChange={(value) => updateSettings({
                                                [setting.key]: value
                                            })}
                                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                            thumbColor="white"
                                            disabled={!settings.enabled}
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Thresholds */}
                            <View style={styles.settingGroup}>
                                <Text style={[styles.settingGroupTitle, { color: theme.colors.text }]}>
                                    Limites de Alerta
                                </Text>

                                <View style={[styles.thresholdCard, { backgroundColor: theme.colors.background }]}>
                                    <View style={styles.thresholdItem}>
                                        <View style={styles.thresholdInfo}>
                                            <Ionicons name="speedometer-outline" size={16} color={theme.colors.warning} />
                                            <Text style={[styles.thresholdLabel, { color: theme.colors.text }]}>CPU</Text>
                                        </View>
                                        <Text style={[styles.thresholdValue, { color: theme.colors.warning }]}>
                                            {settings.threshold.cpu}%
                                        </Text>
                                    </View>

                                    <View style={styles.thresholdItem}>
                                        <View style={styles.thresholdInfo}>
                                            <Ionicons name="hardware-chip-outline" size={16} color={theme.colors.info} />
                                            <Text style={[styles.thresholdLabel, { color: theme.colors.text }]}>Memória</Text>
                                        </View>
                                        <Text style={[styles.thresholdValue, { color: theme.colors.info }]}>
                                            {settings.threshold.memory}%
                                        </Text>
                                    </View>

                                    <View style={styles.thresholdItem}>
                                        <View style={styles.thresholdInfo}>
                                            <Ionicons name="archive-outline" size={16} color={theme.colors.error} />
                                            <Text style={[styles.thresholdLabel, { color: theme.colors.text }]}>Disco</Text>
                                        </View>
                                        <Text style={[styles.thresholdValue, { color: theme.colors.error }]}>
                                            {settings.threshold.disk}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={theme.dark ? ['#1a1a2e', '#16213e'] : ['#4FACFE', '#00F2FE']}
                style={styles.header}
            >
                <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Notificações</Text>
                        <Text style={styles.headerSubtitle}>
                            {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowSettings(true)}
                        >
                            <Ionicons name="settings-outline" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleClearAll}
                        >
                            <Ionicons name="trash-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            <View style={[styles.filterTabs, { backgroundColor: theme.colors.surface }]}>
                {[
                    { key: 'all', label: 'Todas', count: notifications.length },
                    { key: 'unread', label: 'Não lidas', count: unreadCount },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.filterTab,
                            { backgroundColor: theme.colors.background },
                            filter === tab.key && [styles.filterTabActive, { backgroundColor: theme.colors.primary + '15' }]
                        ]}
                        onPress={() => setFilter(tab.key as any)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            { color: theme.colors.textSecondary },
                            filter === tab.key && [styles.filterTabTextActive, { color: theme.colors.primary }]
                        ]}>
                            {tab.label} ({tab.count})
                        </Text>
                    </TouchableOpacity>
                ))}

                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllReadButton}
                        onPress={markAllAsRead}
                    >
                        <Text style={[styles.markAllReadText, { color: theme.colors.primary }]}>
                            Marcar todas como lidas
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 120 }
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
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons
                                name={filter === 'unread' ? 'checkmark-circle-outline' : 'notifications-outline'}
                                size={48}
                                color={theme.colors.primary}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                            {filter === 'unread' ? 'Tudo em dia!' : 'Nenhuma notificação'}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            {filter === 'unread'
                                ? 'Você não tem notificações não lidas'
                                : 'Suas notificações aparecerão aqui'
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>

            <SettingsModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        letterSpacing: -0.5,
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterTabActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterTabTextActive: {
        fontWeight: '600',
    },
    markAllReadButton: {
        marginLeft: 'auto',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    markAllReadText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    notificationCard: {
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4FACFE',
        shadowOpacity: 0.12,
        elevation: 4,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        letterSpacing: -0.2,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    settingsModal: {
        height: '75%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
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
        borderBottomColor: 'rgba(0,0,0,0.05)',
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    settingGroupTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        letterSpacing: -0.2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    thresholdCard: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    thresholdItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    thresholdInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    thresholdLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    thresholdValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});