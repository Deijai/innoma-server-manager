// hooks/useRealTimeStatus.ts - Hook para Status em Tempo Real
import { useEffect, useRef, useState } from 'react';
import { serverService } from '../services/serverService';
import { ServerStatus } from '../services/types';

interface UseRealTimeStatusProps {
    serverId: string;
    autoRefresh?: boolean;
    refreshInterval?: number; // em segundos
}

export function useRealTimeStatus({
    serverId,
    autoRefresh = true,
    refreshInterval = 30
}: UseRealTimeStatusProps) {
    const [status, setStatus] = useState<ServerStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Função para atualizar status manualmente
    const refreshStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            const newStatus = await serverService.getServerStatus(serverId);
            setStatus(newStatus);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar status');
            console.error('Erro ao atualizar status:', err);
        } finally {
            setLoading(false);
        }
    };

    // Configurar listener em tempo real
    useEffect(() => {
        if (!serverId) {
            setStatus(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Escutar mudanças em tempo real
        const unsubscribe = serverService.subscribeToServerStatus(
            serverId,
            (newStatus) => {
                setStatus(newStatus);
                setLastUpdate(new Date());
                setLoading(false);
                setError(null);
            }
        );

        unsubscribeRef.current = unsubscribe;

        // Buscar status inicial
        refreshStatus();

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [serverId]);

    // Configurar auto-refresh
    useEffect(() => {
        if (!autoRefresh || !serverId) return;

        intervalRef.current = setInterval(() => {
            refreshStatus();
        }, refreshInterval * 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, serverId]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return {
        status,
        loading,
        error,
        lastUpdate,
        refreshStatus,
        isOnline: status?.isOnline || false,
        cpuUsage: status?.cpuUsage || 0,
        memoryUsage: status?.memoryUsage || 0,
        diskUsage: status?.diskUsage || 0,
        uptime: status?.uptime || 0,
    };
}

// ==========================================================

// hooks/useSSHCommand.ts - Hook para Comandos SSH
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CommandResult } from '../services/types';
import { validateSSHCommand } from '../utils/validation';

interface UseSSHCommandProps {
    serverId: string;
    maxHistorySize?: number;
}

export function useSSHCommand({ serverId, maxHistorySize = 100 }: UseSSHCommandProps) {
    const [executing, setExecuting] = useState(false);
    const [history, setHistory] = useState<CommandResult[]>([]);
    const [lastResult, setLastResult] = useState<CommandResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const abortControllerRef = useRef<AbortController | null>(null);

    const execute = useCallback(async (command: string): Promise<CommandResult> => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        if (!command.trim()) {
            throw new Error('Comando não pode estar vazio');
        }

        // Validar comando
        const validation = validateSSHCommand(command);
        if (!validation.safe) {
            throw new Error(`Comando não seguro: ${validation.errors.join(', ')}`);
        }

        // Cancelar execução anterior se ainda estiver rodando
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setExecuting(true);
        setError(null);

        abortControllerRef.current = new AbortController();
        const startTime = Date.now();

        try {
            const result = await serverService.executeCommand(serverId, command.trim(), user.uid);

            const commandResult: CommandResult = {
                command: command.trim(),
                output: result.output || '',
                error: result.error,
                exitCode: result.exitCode || 0,
                executedAt: new Date(),
                duration: result.duration || (Date.now() - startTime),
                serverId
            };

            setLastResult(commandResult);

            // Adicionar ao histórico
            setHistory(prev => {
                const newHistory = [commandResult, ...prev];
                return newHistory.slice(0, maxHistorySize);
            });

            return commandResult;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);

            const errorResult: CommandResult = {
                command: command.trim(),
                output: '',
                error: errorMessage,
                exitCode: 1,
                executedAt: new Date(),
                duration: Date.now() - startTime,
                serverId
            };

            setLastResult(errorResult);
            setHistory(prev => [errorResult, ...prev.slice(0, maxHistorySize - 1)]);

            throw err;
        } finally {
            setExecuting(false);
            abortControllerRef.current = null;
        }
    }, [serverId, user, maxHistorySize]);

    const cancelExecution = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setExecuting(false);
        }
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setLastResult(null);
        setError(null);
    }, []);

    const getCommandHistory = useCallback(() => {
        return history.map(result => result.command);
    }, [history]);

    const getSuccessfulCommands = useCallback(() => {
        return history.filter(result => result.exitCode === 0);
    }, [history]);

    const getFailedCommands = useCallback(() => {
        return history.filter(result => result.exitCode !== 0);
    }, [history]);

    return {
        execute,
        executing,
        history,
        lastResult,
        error,
        cancelExecution,
        clearHistory,
        getCommandHistory,
        getSuccessfulCommands,
        getFailedCommands,
        commandCount: history.length,
        successRate: history.length > 0 ?
            (getSuccessfulCommands().length / history.length) * 100 : 0
    };
}