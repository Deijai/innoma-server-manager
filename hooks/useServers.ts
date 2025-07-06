// hooks/useServers.ts - Hook para Gerenciamento de Servidores
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serverService } from '../services/serverService';
import { Server, ServerStatus } from '../services/types';

export function useServers() {
    const [servers, setServers] = useState<Server[]>([]);
    const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useAuth();

    // Carregar servidores do usuário
    const loadServers = useCallback(async () => {
        if (!user) {
            setServers([]);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const userServers = await serverService.getUserServers(user.uid);
            setServers(userServers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar servidores';
            setError(errorMessage);
            console.error('Erro ao carregar servidores:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Carregar status de todos os servidores
    const loadServerStatuses = useCallback(async () => {
        const serverIds = servers.map(s => s.id);
        if (serverIds.length === 0) return;

        try {
            const statusPromises = serverIds.map(id => serverService.getServerStatus(id));
            const statuses = await Promise.allSettled(statusPromises);

            const statusMap: Record<string, ServerStatus> = {};

            statuses.forEach((result, index) => {
                const serverId = serverIds[index];
                if (result.status === 'fulfilled' && result.value) {
                    statusMap[serverId] = result.value;
                }
            });

            setServerStatuses(statusMap);
        } catch (err) {
            console.error('Erro ao carregar status dos servidores:', err);
        }
    }, [servers]);

    // Adicionar servidor
    const addServer = useCallback(async (
        serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Server> => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        try {
            const newServer = await serverService.createServer(serverData, user.uid);
            setServers(prev => [newServer, ...prev]);

            // Testar conexão imediatamente
            setTimeout(() => {
                testServerConnection(newServer.id);
            }, 1000);

            return newServer;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar servidor';
            throw new Error(errorMessage);
        }
    }, [user]);

    // Atualizar servidor
    const updateServer = useCallback(async (
        serverId: string,
        updates: Partial<Omit<Server, 'id' | 'createdAt' | 'userId'>>
    ): Promise<void> => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        try {
            await serverService.updateServer(serverId, updates, user.uid);

            setServers(prev =>
                prev.map(server =>
                    server.id === serverId
                        ? { ...server, ...updates, updatedAt: new Date() }
                        : server
                )
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar servidor';
            throw new Error(errorMessage);
        }
    }, [user]);

    // Remover servidor
    const deleteServer = useCallback(async (serverId: string): Promise<void> => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        try {
            await serverService.deleteServer(serverId, user.uid);
            setServers(prev => prev.filter(server => server.id !== serverId));
            setServerStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[serverId];
                return newStatuses;
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao remover servidor';
            throw new Error(errorMessage);
        }
    }, [user]);

    // Testar conexão de um servidor
    const testServerConnection = useCallback(async (serverId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const isConnected = await serverService.testConnection(serverId, user.uid);

            // Atualizar status baseado no teste
            const status: ServerStatus = {
                serverId,
                isOnline: isConnected,
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0,
                uptime: 0,
                lastCheck: new Date(),
                services: []
            };

            setServerStatuses(prev => ({
                ...prev,
                [serverId]: status
            }));

            return isConnected;
        } catch (err) {
            console.error('Erro ao testar conexão:', err);
            return false;
        }
    }, [user]);

    // Atualizar status de todos os servidores
    const refreshAllServers = useCallback(async (): Promise<void> => {
        if (!user || servers.length === 0) return;

        setRefreshing(true);
        try {
            const serverIds = servers.map(s => s.id);
            await serverService.refreshAllServers(serverIds, user.uid);
            await loadServerStatuses();
        } catch (err) {
            console.error('Erro ao atualizar servidores:', err);
        } finally {
            setRefreshing(false);
        }
    }, [user, servers, loadServerStatuses]);

    // Obter resumo dos servidores
    const getServersSummary = useCallback(() => {
        const total = servers.length;
        const statusArray = Object.values(serverStatuses);
        const online = statusArray.filter(s => s.isOnline).length;
        const offline = total - online;

        return {
            total,
            online,
            offline,
            averageCpuUsage: statusArray.length > 0 ?
                statusArray.reduce((acc, s) => acc + s.cpuUsage, 0) / statusArray.length : 0,
            averageMemoryUsage: statusArray.length > 0 ?
                statusArray.reduce((acc, s) => acc + s.memoryUsage, 0) / statusArray.length : 0,
        };
    }, [servers, serverStatuses]);

    // Efeitos
    useEffect(() => {
        loadServers();
    }, [loadServers]);

    useEffect(() => {
        if (servers.length > 0) {
            loadServerStatuses();
        }
    }, [servers.length]); // Só quando a quantidade muda

    return {
        servers,
        serverStatuses,
        loading,
        error,
        refreshing,
        addServer,
        updateServer,
        deleteServer,
        testServerConnection,
        refreshAllServers,
        loadServers,
        getServersSummary,
        summary: getServersSummary()
    };
}