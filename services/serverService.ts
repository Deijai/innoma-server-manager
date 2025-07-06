// services/serverService.ts - Serviço de Gerenciamento de Servidores
import { get, onValue, ref, remove, set } from 'firebase/database';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    removeCredentialsSecurely,
    retrieveCredentialsSecurely,
    storeCredentialsSecurely
} from '../utils/encryption';
import { validateSSHCredentials } from '../utils/validation';
import { COLLECTIONS, db, realtimeDb, RTDB_PATHS } from './firebase';
import { Server, ServerStatus } from './types';

// Configuração da API SSH
const SSH_API_BASE = __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-ssh-service.vercel.app/api';

class ServerService {
    private statusListeners: Map<string, () => void> = new Map();
    private serverListeners: Map<string, () => void> = new Map();

    // ==================== CRUD BÁSICO ====================

    // Criar novo servidor
    async createServer(
        serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>,
        userId: string
    ): Promise<Server> {
        try {
            // Validar dados do servidor
            const validation = validateSSHCredentials({
                host: serverData.host,
                port: serverData.port,
                username: serverData.username,
                password: serverData.password,
                privateKey: serverData.privateKey
            });

            if (!validation.valid) {
                throw new Error('Dados do servidor inválidos: ' + Object.values(validation.errors).flat().join(', '));
            }

            // Criar documento no Firestore (sem credenciais)
            const serverDoc = {
                name: serverData.name,
                host: serverData.host,
                port: serverData.port || 22,
                username: serverData.username,
                description: serverData.description || '',
                tags: serverData.tags || [],
                isActive: serverData.isActive !== false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                userId: userId
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.SERVERS), serverDoc);

            // Armazenar credenciais de forma segura
            if (serverData.password || serverData.privateKey) {
                await storeCredentialsSecurely(docRef.id, {
                    host: serverData.host,
                    port: serverData.port || 22,
                    username: serverData.username,
                    password: serverData.password,
                    privateKey: serverData.privateKey,
                    passphrase: serverData.passphrase
                }, userId);
            }

            // Criar servidor completo
            const server: Server = {
                id: docRef.id,
                ...serverDoc,
                createdAt: serverDoc.createdAt.toDate(),
                updatedAt: serverDoc.updatedAt.toDate(),
                password: serverData.password,
                privateKey: serverData.privateKey,
                passphrase: serverData.passphrase
            };

            console.log('✅ Servidor criado:', server.name);
            return server;

        } catch (error) {
            console.error('❌ Erro ao criar servidor:', error);
            throw error;
        }
    }

    // Buscar servidores do usuário
    async getUserServers(userId: string): Promise<Server[]> {
        try {
            const q = query(
                collection(db, COLLECTIONS.SERVERS),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const servers: Server[] = [];

            for (const docSnapshot of querySnapshot.docs) {
                const data = docSnapshot.data();

                // Recuperar credenciais
                const credentials = await retrieveCredentialsSecurely(docSnapshot.id, userId);

                const server: Server = {
                    id: docSnapshot.id,
                    name: data.name,
                    host: data.host,
                    port: data.port,
                    username: data.username,
                    description: data.description,
                    tags: data.tags || [],
                    isActive: data.isActive,
                    createdAt: data.createdAt.toDate(),
                    updatedAt: data.updatedAt.toDate(),
                    password: credentials?.password,
                    privateKey: credentials?.privateKey,
                    passphrase: credentials?.passphrase
                };

                servers.push(server);
            }

            console.log(`📋 Carregados ${servers.length} servidores`);
            return servers;

        } catch (error) {
            console.error('❌ Erro ao buscar servidores:', error);
            throw error;
        }
    }

    // Atualizar servidor
    async updateServer(
        serverId: string,
        updates: Partial<Omit<Server, 'id' | 'createdAt' | 'userId'>>,
        userId: string
    ): Promise<void> {
        try {
            const serverRef = doc(db, COLLECTIONS.SERVERS, serverId);

            // Preparar dados para update (sem credenciais)
            const updateData: any = {
                ...updates,
                updatedAt: Timestamp.now()
            };

            // Remover credenciais dos dados de update
            delete updateData.password;
            delete updateData.privateKey;
            delete updateData.passphrase;

            await updateDoc(serverRef, updateData);

            // Atualizar credenciais se fornecidas
            if (updates.password || updates.privateKey) {
                const currentCredentials = await retrieveCredentialsSecurely(serverId, userId);

                await storeCredentialsSecurely(serverId, {
                    host: updates.host || currentCredentials?.host || '',
                    port: updates.port || currentCredentials?.port || 22,
                    username: updates.username || currentCredentials?.username || '',
                    password: updates.password || currentCredentials?.password,
                    privateKey: updates.privateKey || currentCredentials?.privateKey,
                    passphrase: updates.passphrase || currentCredentials?.passphrase
                }, userId);
            }

            console.log('✅ Servidor atualizado:', serverId);

        } catch (error) {
            console.error('❌ Erro ao atualizar servidor:', error);
            throw error;
        }
    }

    // Deletar servidor
    async deleteServer(serverId: string, userId: string): Promise<void> {
        try {
            // Remover credenciais
            await removeCredentialsSecurely(serverId, userId);

            // Remover status do Realtime Database
            await this.removeServerStatus(serverId);

            // Remover documento do Firestore
            await deleteDoc(doc(db, COLLECTIONS.SERVERS, serverId));

            console.log('🗑️ Servidor deletado:', serverId);

        } catch (error) {
            console.error('❌ Erro ao deletar servidor:', error);
            throw error;
        }
    }

    // ==================== STATUS E MONITORAMENTO ====================

    // Buscar status de um servidor
    async getServerStatus(serverId: string): Promise<ServerStatus | null> {
        try {
            const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${serverId}`);
            const snapshot = await get(statusRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                return {
                    ...data,
                    lastCheck: new Date(data.lastCheck),
                    services: data.services || []
                };
            }

            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar status:', error);
            return null;
        }
    }

    // Atualizar status de um servidor
    async updateServerStatus(serverId: string, status: Omit<ServerStatus, 'serverId'>): Promise<void> {
        try {
            const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${serverId}`);
            const statusData = {
                ...status,
                serverId,
                lastCheck: status.lastCheck.toISOString(),
                updatedAt: new Date().toISOString()
            };

            await set(statusRef, statusData);
            console.log('📊 Status atualizado:', serverId);

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            throw error;
        }
    }

    // Remover status de um servidor
    async removeServerStatus(serverId: string): Promise<void> {
        try {
            const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${serverId}`);
            await remove(statusRef);
            console.log('🗑️ Status removido:', serverId);
        } catch (error) {
            console.error('❌ Erro ao remover status:', error);
        }
    }

    // Escutar mudanças de status em tempo real
    subscribeToServerStatus(
        serverId: string,
        callback: (status: ServerStatus | null) => void
    ): () => void {
        const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${serverId}`);

        const unsubscribe = onValue(statusRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const status: ServerStatus = {
                    ...data,
                    lastCheck: new Date(data.lastCheck),
                    services: data.services || []
                };
                callback(status);
            } else {
                callback(null);
            }
        });

        // Armazenar listener para cleanup
        this.statusListeners.set(serverId, unsubscribe);

        return unsubscribe;
    }

    // Parar de escutar status
    unsubscribeFromServerStatus(serverId: string): void {
        const unsubscribe = this.statusListeners.get(serverId);
        if (unsubscribe) {
            unsubscribe();
            this.statusListeners.delete(serverId);
        }
    }

    // ==================== COMANDOS SSH ====================

    // Testar conexão SSH
    async testConnection(serverId: string, userId: string): Promise<boolean> {
        try {
            const credentials = await retrieveCredentialsSecurely(serverId, userId);
            if (!credentials) {
                throw new Error('Credenciais não encontradas');
            }

            const response = await fetch(`${SSH_API_BASE}/ssh/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result.success === true;

        } catch (error) {
            console.error('❌ Erro no teste de conexão:', error);
            return false;
        }
    }

    // Executar comando SSH
    async executeCommand(
        serverId: string,
        command: string,
        userId: string
    ): Promise<{
        success: boolean;
        output?: string;
        error?: string;
        exitCode?: number;
        duration?: number;
    }> {
        try {
            const credentials = await retrieveCredentialsSecurely(serverId, userId);
            if (!credentials) {
                throw new Error('Credenciais não encontradas');
            }

            const startTime = Date.now();

            const response = await fetch(`${SSH_API_BASE}/ssh/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...credentials,
                    command
                }),
            });

            const result = await response.json();
            const duration = Date.now() - startTime;

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `HTTP ${response.status}`,
                    duration
                };
            }

            return {
                success: result.success,
                output: result.output,
                error: result.error,
                exitCode: result.exitCode,
                duration
            };

        } catch (error) {
            console.error('❌ Erro ao executar comando:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }

    // Obter status detalhado do sistema via SSH
    async getSystemStats(serverId: string, userId: string): Promise<ServerStatus | null> {
        try {
            const credentials = await retrieveCredentialsSecurely(serverId, userId);
            if (!credentials) {
                throw new Error('Credenciais não encontradas');
            }

            const response = await fetch(`${SSH_API_BASE}/ssh/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                const status: ServerStatus = {
                    serverId,
                    isOnline: true,
                    cpuUsage: result.stats.cpu || 0,
                    memoryUsage: result.stats.memory || 0,
                    diskUsage: result.stats.disk || 0,
                    uptime: result.stats.uptime || 0,
                    lastCheck: new Date(),
                    services: result.stats.services || [],
                    networkIn: result.stats.networkIn,
                    networkOut: result.stats.networkOut,
                    loadAverage: result.stats.loadAverage,
                    processCount: result.stats.processCount
                };

                // Atualizar status no banco
                await this.updateServerStatus(serverId, status);

                return status;
            }

            return null;

        } catch (error) {
            console.error('❌ Erro ao obter stats do sistema:', error);

            // Marcar como offline em caso de erro
            const offlineStatus: ServerStatus = {
                serverId,
                isOnline: false,
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0,
                uptime: 0,
                lastCheck: new Date(),
                services: []
            };

            await this.updateServerStatus(serverId, offlineStatus);
            return offlineStatus;
        }
    }

    // ==================== UTILITÁRIOS ====================

    // Verificar se o serviço SSH está disponível
    async checkSSHServiceHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${SSH_API_BASE}/health`, {
                method: 'GET',
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Serviço SSH indisponível:', error);
            return false;
        }
    }

    // Limpar todos os listeners
    cleanup(): void {
        this.statusListeners.forEach((unsubscribe) => {
            unsubscribe();
        });
        this.statusListeners.clear();

        this.serverListeners.forEach((unsubscribe) => {
            unsubscribe();
        });
        this.serverListeners.clear();

        console.log('🧹 Listeners limpos');
    }
}

// Singleton instance
export const serverService = new ServerService();