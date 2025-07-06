// components/LoadingSpinner.tsx - CORRIGIDO
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large' | number;
    color?: string;
    text?: string;
    variant?: 'default' | 'overlay' | 'inline' | 'custom';
    style?: ViewStyle;
    textStyle?: TextStyle;
    showIcon?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function LoadingSpinner({
    size = 'large',
    color = '#4FACFE',
    text,
    variant = 'default',
    style,
    textStyle,
    showIcon = false,
    icon = 'refresh'
}: LoadingSpinnerProps) {

    // Estilos baseados na variante
    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            justifyContent: 'center',
            alignItems: 'center',
        };

        switch (variant) {
            case 'overlay':
                return {
                    ...baseStyle,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                };

            case 'inline':
                return {
                    ...baseStyle,
                    flexDirection: 'row',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                };

            case 'custom':
                return {
                    ...baseStyle,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                };

            default:
                return {
                    ...baseStyle,
                    flex: 1,
                };
        }
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            color: '#333',
            fontSize: 16,
        };

        switch (variant) {
            case 'overlay':
                return {
                    ...baseStyle,
                    color: 'white',
                    fontWeight: '600',
                    marginTop: 12,
                };

            case 'inline':
                return {
                    ...baseStyle,
                    fontSize: 14,
                    marginLeft: 8,
                };

            case 'custom':
                return {
                    ...baseStyle,
                    fontWeight: '500',
                    marginTop: 12,
                };

            default:
                return {
                    ...baseStyle,
                    marginTop: 16,
                };
        }
    };

    const renderSpinner = () => {
        if (showIcon) {
            const iconSize = typeof size === 'number' ? size : size === 'large' ? 32 : 20;

            return (
                <Ionicons
                    name={icon}
                    size={iconSize}
                    color={color}
                />
            );
        }

        return (
            <ActivityIndicator
                size={size}
                color={color}
            />
        );
    };

    return (
        <View style={[getContainerStyle(), style]}>
            {renderSpinner()}

            {text && (
                <Text style={[getTextStyle(), textStyle]}>
                    {text}
                </Text>
            )}
        </View>
    );
}

// Componentes especializados para casos específicos
export function OverlaySpinner({ text = 'Carregando...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
    return (
        <LoadingSpinner
            variant="overlay"
            text={text}
            {...props}
        />
    );
}

export function InlineSpinner({ text, size = 'small', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
    return (
        <LoadingSpinner
            variant="inline"
            size={size}
            text={text}
            {...props}
        />
    );
}

export function CustomSpinner({ text = 'Processando...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
    return (
        <LoadingSpinner
            variant="custom"
            text={text}
            showIcon
            icon="sync"
            {...props}
        />
    );
}

// Hook simples para controlar estados de carregamento
export function useLoadingState(initialState = false) {
    const [loading, setLoading] = React.useState(initialState);
    const [error, setError] = React.useState<string | null>(null);

    const startLoading = () => {
        setLoading(true);
        setError(null);
    };

    const stopLoading = () => {
        setLoading(false);
    };

    const setLoadingError = (errorMessage: string) => {
        setLoading(false);
        setError(errorMessage);
    };

    const executeWithLoading = async (asyncFunction: () => Promise<any>) => {
        try {
            startLoading();
            const result = await asyncFunction();
            stopLoading();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setLoadingError(errorMessage);
            return null;
        }
    };

    return {
        loading,
        error,
        startLoading,
        stopLoading,
        setLoadingError,
        executeWithLoading,
    };
}