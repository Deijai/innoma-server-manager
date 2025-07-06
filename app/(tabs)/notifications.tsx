// app/(tabs)/notifications.tsx - Página de Notificações COMPLETA
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
import { useNotifications } from '../../contexts/NotificationContext';

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
            case 'server_offline': return '#F44336';
            case 'high_cpu': return '#FF9800';
            case 'high_memory': return '#FF9800';
            case 'disk_space': return '#F44336';
            case 'ssh_failed': return '#F44336';
            default: return '#4FACFE';
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' || (filter === 'unread' && !n.read)
    );

    const NotificationCard = ({ notification }: { notification: any }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
            ]}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.7}
        >
            <View style={styles.notificationContent}>
                <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) + '20' }
                ]}>
                    <Ionicons
                        name={getNotificationIcon(notification.type) as any}
                        size={20}
                        color={getNotificationColor(notification.type)}
                    />
                </View>

                <View style={styles.notificationText}>
                    <Text style={[
                        styles.notificationTitle,
                        !notification.read && styles.unreadTitle
                    ]}>
                        {notification.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                        {notification.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                        {notification.timestamp.toLocaleString('pt-BR')}
                    </Text>
                </View>

                {!notification.read && (
                    <View style={styles.unreadDot} />
                )}
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
                    <View style={styles.settingsContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Configurações de Notificação
                            </Text>
                            <TouchableOpacity onPress={() => setShowSettings(false)}>
                                <Ionicons name="close" size={24} color="#1D1D1F" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.settingsList}>
                            {/* Main Toggle */}
                            <View style={styles.settingGroup}>
                                <Text style={styles.settingGroupTitle}>
                                    Geral
                                </Text>

                                <View style={styles.settingItem}>
                                    <Ionicons name="notifications-outline" size={20} color="#8E8E93" />
                                    <Text style={styles.settingLabel}>
                                        Todas as notificações
                                    </Text>
                                    <Switch
                                        value={settings.enabled}
                                        onValueChange={(value) => updateSettings({ enabled: value })}
                                        trackColor={{ false: '#E5E5EA', true: '#4FACFE' }}
                                        thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
                                    />
                                </View>
                            </View>

                            {/* Alert Types */}
                            <View style={styles.settingGroup}>
                                <Text style={styles.settingGroupTitle}>
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
                                        <Ionicons name={setting.icon as any} size={20} color="#8E8E93" />
                                        <Text style={styles.settingLabel}>
                                            {setting.label}
                                        </Text>
                                        <Switch
                                            value={settings[setting.key as keyof typeof settings] as boolean}
                                            onValueChange={(value) => updateSettings({
                                                [setting.key]: value
                                            })}
                                            trackColor={{ false: '#E5E5EA', true: '#4FACFE' }}
                                            thumbColor="#FFFFFF"
                                            disabled={!settings.enabled}
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Thresholds */}
                            <View style={styles.settingGroup}>
                                <Text style={styles.settingGroupTitle}>
                                    Limites de Alerta
                                </Text>

                                <View style={styles.thresholdItem}>
                                    <Text style={styles.thresholdLabel}>CPU</Text>
                                    <Text style={styles.thresholdValue}>{settings.threshold.cpu}%</Text>
                                </View>

                                <View style={styles.thresholdItem}>
                                    <Text style={styles.thresholdLabel}>Memória</Text>
                                    <Text style={styles.thresholdValue}>{settings.threshold.memory}%</Text>
                                </View>

                                <View style={styles.thresholdItem}>
                                    <Text style={styles.thresholdLabel}>Disco</Text>
                                    <Text style={styles.thresholdValue}>{settings.threshold.disk}%</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#4FACFE', '#00F2FE']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
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
            <View style={styles.filterTabs}>
                {[
                    { key: 'all', label: 'Todas', count: notifications.length },
                    { key: 'unread', label: 'Não lidas', count: unreadCount },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.filterTab,
                            filter === tab.key && styles.filterTabActive
                        ]}
                        onPress={() => setFilter(tab.key as any)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            filter === tab.key && styles.filterTabTextActive
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
                        <Text style={styles.markAllReadText}>
                            Marcar todas como lidas
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4FACFE"
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
                        <View style={styles.emptyIcon}>
                            <Ionicons
                                name={filter === 'unread' ? 'checkmark-circle-outline' : 'notifications-outline'}
                                size={48}
                                color="#4FACFE"
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {filter === 'unread' ? 'Tudo em dia!' : 'Nenhuma notificação'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
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
        backgroundColor: '#f8f9fa',
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8E8E93',
    },
    filterTabTextActive: {
        color: '#4FACFE',
        fontWeight: '600',
    },
    markAllReadButton: {
        marginLeft: 'auto',
    },
    markAllReadText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4FACFE',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    notificationCard: {
        backgroundColor: 'white',
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
        color: '#1D1D1F',
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
        color: '#8E8E93',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#8E8E93',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4FACFE',
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
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    settingsModal: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    settingsContent: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1F',
    },
    settingsList: {
        flex: 1,
    },
    settingGroup: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    settingGroupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D1D1F',
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
        color: '#1D1D1F',
        marginLeft: 12,
    },
    thresholdItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        marginBottom: 8,
    },
    thresholdLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1D1D1F',
    },
    thresholdValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4FACFE',
    },
});