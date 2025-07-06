// contexts/ThemeContext.tsx - Contexto de Tema COMPLETO
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

interface Theme {
    dark: boolean;
    colors: ThemeColors;
}

const lightTheme: Theme = {
    dark: false,
    colors: {
        primary: '#4FACFE',
        secondary: '#667eea',
        background: '#f8f9fa',
        surface: '#ffffff',
        card: '#ffffff',
        text: '#1D1D1F',
        textSecondary: '#8E8E93',
        border: '#E5E5EA',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
    },
};

const darkTheme: Theme = {
    dark: true,
    colors: {
        primary: '#4FACFE',
        secondary: '#667eea',
        background: '#000000',
        surface: '#1C1C1E',
        card: '#2C2C2E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#FF453A',
        info: '#007AFF',
    },
};

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    themePreference: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
    const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    );

    // Load theme preference from storage
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemTheme(colorScheme);
        });

        return () => subscription?.remove();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await AsyncStorage.getItem('theme_preference');
            if (saved) {
                setThemePreference(saved as 'light' | 'dark' | 'system');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const saveThemePreference = async (preference: 'light' | 'dark' | 'system') => {
        try {
            await AsyncStorage.setItem('theme_preference', preference);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const getCurrentTheme = (): Theme => {
        switch (themePreference) {
            case 'light':
                return lightTheme;
            case 'dark':
                return darkTheme;
            case 'system':
            default:
                return systemTheme === 'dark' ? darkTheme : lightTheme;
        }
    };

    const toggleTheme = () => {
        const current = getCurrentTheme();
        const newPreference = current.dark ? 'light' : 'dark';
        setTheme(newPreference);
    };

    const setTheme = (preference: 'light' | 'dark' | 'system') => {
        setThemePreference(preference);
        saveThemePreference(preference);
    };

    const theme = getCurrentTheme();

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark: theme.dark,
            toggleTheme,
            setTheme,
            themePreference,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}