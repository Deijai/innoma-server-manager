// components/StatusIndicator.tsx - CORRIGIDO
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';

export type ServerStatus = 'online' | 'offline' | 'checking' | 'error' | 'warning' | 'unknown';

interface StatusIndicatorProps {
    status: ServerStatus;
    size?: 'small' | 'medium' | 'large' | number;
    showText?: boolean;
    text?: string;
    variant?: 'dot' | 'badge' | 'card' | 'icon';
    style?: ViewStyle;
    textStyle?: TextStyle;
    showIcon?: boolean;
    customColor?: string;
}

export function StatusIndicator({
    status,
    size = 'medium',
    showText = false,
    text,
    variant = 'dot',
    style,
    textStyle,
    showIcon = false,
    customColor
}: StatusIndicatorProps) {

    // Configuração de cores e ícones para cada status
    const getStatusConfig = () => {
        const configs = {
            online: {
                color: customColor || '#4CAF50',
                icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
                text: 'Online',
                bgColor: '#E8F5E8'
            },
            offline: {
                color: customColor || '#F44336',
                icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
                text: 'Offline',
                bgColor: '#FFEBEE'
            },
            checking: {
                color: customColor || '#FF9800',
                icon: 'sync' as keyof typeof Ionicons.glyphMap,
                text: 'Verificando...',
                bgColor: '#FFF3E0'
            },
            error: {
                color: customColor || '#D32F2F',
                icon: 'warning' as keyof typeof Ionicons.glyphMap,
                text: 'Erro',
                bgColor: '#FFCDD2'
            },
            warning: {
                color: customColor || '#F57C00',
                icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
                text: 'Atenção',
                bgColor: '#FFE0B2'
            },
            unknown: {
                color: customColor || '#9E9E9E',
                icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
                text: 'Desconhecido',
                bgColor: '#F5F5F5'
            }
        };

        return configs[status] || configs.unknown;
    };

    const config = getStatusConfig();
    const displayText = text || config.text;

    // Tamanho baseado na prop size
    const getSize = () => {
        if (typeof size === 'number') return size;

        const sizes = {
            small: 8,
            medium: 12,
            large: 16
        };

        return sizes[size];
    };

    const dotSize = getSize();

    // Renderizar baseado na variante
    const renderIndicator = () => {
        switch (variant) {
            case 'dot':
                return (
                    <View
                        style={[
                            styles.dot,
                            {
                                width: dotSize,
                                height: dotSize,
                                backgroundColor: config.color,
                            },
                            style
                        ]}
                    />
                );

            case 'badge':
                return (
                    <View style={[
                        styles.badge,
                        { backgroundColor: config.bgColor },
                        style
                    ]}>
                        <View style={[
                            styles.badgeDot,
                            { backgroundColor: config.color }
                        ]} />
                        {showText && (
                            <Text style={[
                                styles.badgeText,
                                { color: config.color },
                                textStyle
                            ]}>
                                {displayText}
                            </Text>
                        )}
                    </View>
                );

            case 'card':
                return (
                    <View style={[
                        styles.card,
                        { backgroundColor: 'white' },
                        style
                    ]}>
                        <View style={[
                            styles.cardIndicator,
                            { backgroundColor: config.color }
                        ]} />
                        <View style={styles.cardContent}>
                            {showIcon && (
                                <Ionicons
                                    name={config.icon}
                                    size={16}
                                    color={config.color}
                                    style={styles.cardIcon}
                                />
                            )}
                            <Text style={[
                                styles.cardText,
                                { color: '#333' },
                                textStyle
                            ]}>
                                {displayText}
                            </Text>
                        </View>
                    </View>
                );

            case 'icon':
                return (
                    <View style={[styles.iconContainer, style]}>
                        <Ionicons
                            name={config.icon}
                            size={dotSize + 8}
                            color={config.color}
                        />
                        {showText && (
                            <Text style={[
                                styles.iconText,
                                { color: config.color },
                                textStyle
                            ]}>
                                {displayText}
                            </Text>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    return renderIndicator();
}

// Componentes especializados
export function ServerStatusBadge({
    status,
    serverName,
    ...props
}: Omit<StatusIndicatorProps, 'variant' | 'showText'> & { serverName?: string }) {
    return (
        <StatusIndicator
            status={status}
            variant="badge"
            showText
            text={serverName ? `${serverName}` : undefined}
            {...props}
        />
    );
}

export function ConnectionStatus({
    status,
    ...props
}: Omit<StatusIndicatorProps, 'variant' | 'showIcon'>) {
    return (
        <StatusIndicator
            status={status}
            variant="icon"
            showIcon
            {...props}
        />
    );
}

export function StatusCard({
    status,
    title,
    subtitle,
    ...props
}: Omit<StatusIndicatorProps, 'variant'> & {
    title?: string;
    subtitle?: string;
}) {
    return (
        <View style={[styles.statusCard, { backgroundColor: 'white' }]}>
            <StatusIndicator
                status={status}
                variant="dot"
                size="large"
                {...props}
            />
            <View style={styles.statusCardContent}>
                {title && (
                    <Text style={[styles.statusCardTitle, { color: '#333' }]}>
                        {title}
                    </Text>
                )}
                {subtitle && (
                    <Text style={[styles.statusCardSubtitle, { color: '#666' }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>
    );
}

// Hook simples para gerenciar status de múltiplos servidores
export function useServerStatus() {
    const [statuses, setStatuses] = React.useState<Record<string, ServerStatus>>({});

    const updateStatus = React.useCallback((serverId: string, status: ServerStatus) => {
        setStatuses(prev => ({
            ...prev,
            [serverId]: status
        }));
    }, []);

    const getStatus = React.useCallback((serverId: string): ServerStatus => {
        return statuses[serverId] || 'unknown';
    }, [statuses]);

    const getAllStatuses = React.useCallback(() => {
        return statuses;
    }, [statuses]);

    const getStatusSummary = React.useCallback(() => {
        const values = Object.values(statuses);
        return {
            total: values.length,
            online: values.filter(s => s === 'online').length,
            offline: values.filter(s => s === 'offline').length,
            checking: values.filter(s => s === 'checking').length,
            error: values.filter(s => s === 'error').length,
            warning: values.filter(s => s === 'warning').length,
        };
    }, [statuses]);

    return {
        updateStatus,
        getStatus,
        getAllStatuses,
        getStatusSummary,
    };
}

const styles = StyleSheet.create({
    dot: {
        borderRadius: 999,
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
    },

    cardIndicator: {
        width: 0, // A borda esquerda serve como indicador
    },

    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    cardIcon: {
        marginRight: 8,
    },

    cardText: {
        fontSize: 14,
        fontWeight: '500',
    },

    iconContainer: {
        alignItems: 'center',
    },

    iconText: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },

    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    statusCardContent: {
        marginLeft: 12,
        flex: 1,
    },

    statusCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },

    statusCardSubtitle: {
        fontSize: 14,
    },
});