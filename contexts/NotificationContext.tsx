// contexts/NotificationContext.tsx - Contexto de Notificações COMPLETO
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }) as any,
});

interface NotificationSettings {
    enabled: boolean;
    serverOffline: boolean;
    highCpuUsage: boolean;
    highMemoryUsage: boolean;
    diskSpaceLow: boolean;
    sshConnectionFailed: boolean;
    threshold: {
        cpu: number;
        memory: number;
        disk: number;
    };
}

interface PushNotification {
    id: string;
    title: string;
    body: string;
    data?: any;
    timestamp: Date;
    read: boolean;
    type: 'server_offline' | 'high_cpu' | 'high_memory' | 'disk_space' | 'ssh_failed' | 'general';
}

interface NotificationContextType {
    expoPushToken: string | null;
    notifications: PushNotification[];
    settings: NotificationSettings;
    hasPermission: boolean;
    unreadCount: number;
    requestPermission: () => Promise<boolean>;
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    sendLocalNotification: (title: string, body: string, data?: any) => Promise<string | undefined>;
    addNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const defaultSettings: NotificationSettings = {
    enabled: true,
    serverOffline: true,
    highCpuUsage: true,
    highMemoryUsage: true,
    diskSpaceLow: true,
    sshConnectionFailed: true,
    threshold: {
        cpu: 80,
        memory: 85,
        disk: 90,
    },
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<PushNotification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        initializeNotifications();
        loadSettings();
        loadNotifications();

        // Adicionar algumas notificações de exemplo
        addExampleNotifications();
    }, []);

    const addExampleNotifications = () => {
        const exampleNotifications: PushNotification[] = [
            {
                id: '1',
                title: 'Servidor Offline',
                body: 'Servidor de Produção está offline há 5 minutos',
                type: 'server_offline',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                data: { serverId: 'server-1' }
            },
            {
                id: '2',
                title: 'Alto Uso de CPU',
                body: 'Servidor Web: CPU em 95%',
                type: 'high_cpu',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                read: false,
                data: { serverId: 'server-2', value: 95 }
            },
            {
                id: '3',
                title: 'Backup Concluído',
                body: 'Backup diário do banco de dados foi concluído com sucesso',
                type: 'general',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: true,
                data: { type: 'backup' }
            },
            {
                id: '4',
                title: 'Pouco Espaço em Disco',
                body: 'Servidor de Arquivos: Disco em 92%',
                type: 'disk_space',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                read: false,
                data: { serverId: 'server-3', value: 92 }
            },
        ];

        setNotifications(exampleNotifications);
    };

    const initializeNotifications = async () => {
        await requestPermission();

        // Listen for notifications
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            const newNotification: PushNotification = {
                id: notification.request.identifier,
                title: notification.request.content.title || 'Notification',
                body: notification.request.content.body || '',
                data: notification.request.content.data,
                timestamp: new Date(),
                read: false,
                type: notification.request.content.data?.type || 'general' as any,
            };

            addNotificationToList(newNotification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const notificationId = response.notification.request.identifier;
            markAsRead(notificationId);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    };

    const requestPermission = async (): Promise<boolean> => {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            setHasPermission(false);
            return false;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permission not granted');
                setHasPermission(false);
                return false;
            }

            setHasPermission(true);

            // Get push token
            try {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: 'your-expo-project-id', // Configure this
                });
                setExpoPushToken(tokenData.data);
            } catch (error) {
                console.error('Failed to get push token:', error);
            }

            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('server-alerts', {
                    name: 'Server Alerts',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#4FACFE',
                    sound: 'default',
                });

                await Notifications.setNotificationChannelAsync('general', {
                    name: 'General Notifications',
                    importance: Notifications.AndroidImportance.DEFAULT,
                    vibrationPattern: [0, 250],
                    lightColor: '#4FACFE',
                    sound: 'default',
                });
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            setHasPermission(false);
            return false;
        }
    };

    const loadSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem('notification_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                setSettings({ ...defaultSettings, ...parsed });
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const saved = await AsyncStorage.getItem('notifications');
            if (saved) {
                const parsed = JSON.parse(saved).map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp),
                }));
                // Não sobrescrever se já temos notificações de exemplo
                if (notifications.length === 0) {
                    setNotifications(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const saveSettings = async (newSettings: NotificationSettings) => {
        try {
            await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    };

    const saveNotifications = async (newNotifications: PushNotification[]) => {
        try {
            // Keep only last 100 notifications
            const limited = newNotifications.slice(0, 100);
            await AsyncStorage.setItem('notifications', JSON.stringify(limited));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    };

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        await saveSettings(updated);
    };

    const addNotificationToList = (notification: PushNotification) => {
        setNotifications(prev => {
            const updated = [notification, ...prev];
            saveNotifications(updated);
            return updated;
        });
    };

    const addNotification = (notificationData: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
        const notification: PushNotification = {
            ...notificationData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false,
        };

        addNotificationToList(notification);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            saveNotifications(updated);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveNotifications(updated);
            return updated;
        });
    };

    const clearNotifications = () => {
        setNotifications([]);
        saveNotifications([]);
    };

    const sendLocalNotification = async (title: string, body: string, data?: any) => {
        if (!settings.enabled || !hasPermission) return;

        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: {
                        ...data,
                        timestamp: new Date().toISOString(),
                    },
                    sound: settings.enabled,
                    badge: 1,
                },
                trigger: null, // Send immediately
            });

            // Also add to local notifications list
            addNotification({
                title,
                body,
                data,
                type: data?.type || 'general',
            });

            return notificationId;
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            expoPushToken,
            notifications,
            settings,
            hasPermission,
            unreadCount,
            requestPermission,
            updateSettings,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            sendLocalNotification,
            addNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}