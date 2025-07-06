// app/server/_layout.tsx - CORRIGIDO
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ServerLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerStyle: styles.stackHeader,
                headerTintColor: '#1D1D1F',
                headerTitleStyle: styles.stackHeaderTitle,
                headerShadowVisible: false,
                animation: 'slide_from_right',
                animationDuration: 300,
                headerBackground: () => (
                    <BlurView
                        intensity={100}
                        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
                    />
                ),
            }}
        >
            <Stack.Screen
                name="add"
                options={{
                    title: 'Novo Servidor',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    animationDuration: 400,
                    headerStyle: styles.modalHeader,
                    headerBackground: () => (
                        <BlurView
                            intensity={80}
                            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                        />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="close" size={24} color="#1D1D1F" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Detalhes do Servidor',
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerActionButton}>
                                <Ionicons name="share-outline" size={20} color="#1D1D1F" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerActionButton}>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#1D1D1F" />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <Stack.Screen
                name="command"
                options={{
                    title: 'Terminal SSH',
                    presentation: 'fullScreenModal',
                    animation: 'slide_from_bottom',
                    animationDuration: 500,
                    headerShown: false,
                }}
            />

            <Stack.Screen
                name="edit/[id]"
                options={{
                    title: 'Editar Servidor',
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    animationDuration: 400,
                    headerBackground: () => (
                        <BlurView
                            intensity={80}
                            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                        />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="close" size={24} color="#1D1D1F" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Salvar</Text>
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
}

const styles = StyleSheet.create({
    // Tab Layout Styles
    tabBar: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        ...(Platform.OS === 'android' && { elevation: 16 }),
        position: 'absolute',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 4,
    },
    tabBarIcon: {
        marginBottom: 0,
    },
    header: {
        backgroundColor: 'white',
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        ...(Platform.OS === 'android' && { elevation: 0 }),
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    tabIconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -12,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        ...(Platform.OS === 'android' && { elevation: 4 }),
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 4,
    },
    alertDot: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF9500',
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        ...(Platform.OS === 'android' && { elevation: 3 }),
    },
    activeDot: {
        position: 'absolute',
        bottom: -8,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    headerRight: {
        paddingRight: 16,
    },
    serverSummary: {
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
    },
    statusSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
    },
    unreadIndicator: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unreadText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF3B30',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(79, 172, 254, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4FACFE',
    },

    // Server Layout Styles
    stackHeader: {
        backgroundColor: 'white',
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        ...(Platform.OS === 'android' && { elevation: 0 }),
        height: 100,
    },
    stackHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1D1D1F',
    },
    modalHeader: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalCloseButton: {
        padding: 8,
        marginLeft: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingRight: 8,
    },
    headerActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        marginRight: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4FACFE',
    },
});