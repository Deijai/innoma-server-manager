// components/SafeNotificationWrapper.tsx - Wrapper para uso seguro
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useHasNotificationContext, useNotificationsOptional } from '@/contexts/NotificationContext';

interface SafeNotificationWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function SafeNotificationWrapper({ children, fallback }: SafeNotificationWrapperProps) {
    const hasContext = useHasNotificationContext();
    const notifications = useNotificationsOptional();

    // Se não há contexto disponível, mostra fallback
    if (!hasContext) {
        return (
            <View style={styles.fallbackContainer}>
                {fallback || (
                    <Text style={styles.fallbackText}>
                        NotificationContext não disponível
                    </Text>
                )}
            </View>
        );
    }

    // Se contexto existe mas ainda não foi inicializado
    if (!notifications?.isInitialized) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando notificações...</Text>
            </View>
        );
    }

    // Renderiza o conteúdo normalmente
    return <>{children}</>;
}

// Componente para usar em qualquer lugar que precise de notificações
export function NotificationBadge() {
    return (
        <SafeNotificationWrapper
            fallback={<View style={styles.badgeEmpty} />}
        >
            <NotificationBadgeContent />
        </SafeNotificationWrapper>
    );
}

function NotificationBadgeContent() {
    const notifications = useNotificationsOptional();
    
    if (!notifications || notifications.unreadCount === 0) {
        return null;
    }

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>
                {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    fallbackContainer: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    fallbackText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 8,
    },
    loadingText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#ff4757',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    badgeEmpty: {
        width: 20,
        height: 20,
    },
});