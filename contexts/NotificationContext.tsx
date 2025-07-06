// contexts/NotificationContext.tsx - VERSÃO CORRIGIDA SEM WRAPPER
import React, { createContext, useContext, useEffect, useState } from 'react';

// Tipos simplificados
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
    notifications: PushNotification[];
    settings: NotificationSettings;
    hasPermission: boolean;
    unreadCount: number;
    isReady: boolean; // NOVO: indica se o contexto está pronto
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

// MUDANÇA 1: Criar contexto com valor padrão mais completo
const defaultContextValue: NotificationContextType = {
    notifications: [],
    settings: defaultSettings,
    hasPermission: false,
    unreadCount: 0,
    isReady: false,
    requestPermission: async () => false,
    updateSettings: async () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearNotifications: () => { },
    sendLocalNotification: async () => undefined,
    addNotification: () => { },
};

const NotificationContext = createContext<NotificationContextType>(defaultContextValue);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<PushNotification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [hasPermission, setHasPermission] = useState(false);
    const [isReady, setIsReady] = useState(false); // NOVO: controla se está pronto

    // MUDANÇA 2: Inicialização controlada
    useEffect(() => {
        let isMounted = true;

        const initializeContext = async () => {
            try {
                // Pequeno delay para garantir que o provider está montado
                await new Promise(resolve => setTimeout(resolve, 10));

                if (isMounted) {
                    // Adicionar notificações de exemplo
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
                    ];

                    setNotifications(exampleNotifications);
                    setIsReady(true); // NOVO: marca como pronto
                }
            } catch (error) {
                console.error('Erro ao inicializar NotificationContext:', error);
                if (isMounted) {
                    setIsReady(true); // Marca como pronto mesmo com erro
                }
            }
        };

        initializeContext();

        return () => {
            isMounted = false;
        };
    }, []);

    const requestPermission = async (): Promise<boolean> => {
        try {
            // Simular solicitação de permissão
            setHasPermission(true);
            return true;
        } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            setHasPermission(false);
            return false;
        }
    };

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
    };

    const addNotificationToList = (notification: PushNotification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 99)]);
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
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const sendLocalNotification = async (title: string, body: string, data?: any) => {
        if (!settings.enabled || !hasPermission) return;

        try {
            // Simular envio de notificação local
            const notificationId = Date.now().toString();

            // Adicionar à lista local
            addNotification({
                title,
                body,
                data,
                type: data?.type || 'general',
            });

            console.log('Notificação enviada:', title);
            return notificationId;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // MUDANÇA 3: Sempre fornecer um valor válido
    const contextValue: NotificationContextType = {
        notifications,
        settings,
        hasPermission,
        unreadCount,
        isReady,
        requestPermission,
        updateSettings,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        sendLocalNotification,
        addNotification,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

// MUDANÇA 4: Hook melhorado com verificação
export function useNotifications() {
    const context = useContext(NotificationContext);

    // NOVO: Se o contexto não está pronto, retorna valores padrão seguros
    if (!context.isReady) {
        return {
            notifications: [],
            settings: defaultSettings,
            hasPermission: false,
            unreadCount: 0,
            isReady: false,
            requestPermission: async () => false,
            updateSettings: async () => { },
            markAsRead: () => { },
            markAllAsRead: () => { },
            clearNotifications: () => { },
            sendLocalNotification: async () => undefined,
            addNotification: () => { },
        };
    }

    return context;
}