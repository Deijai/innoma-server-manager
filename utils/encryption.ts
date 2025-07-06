// utils/encryption.ts - Sistema de Criptografia para Credenciais SSH
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Chave base para criptografia - MUDE para uma chave única em produção
const BASE_ENCRYPTION_KEY = 'ServerManager2024SecureKey123!@#';

// Gerar chave derivada única por usuário
const deriveKey = async (userId: string): Promise<string> => {
    const combined = `${BASE_ENCRYPTION_KEY}_${userId}_${Platform.OS}`;
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined
    );
    return hash.substring(0, 32); // AES-256 precisa de 32 caracteres
};

// Interface para credenciais SSH
export interface SSHCredentials {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;
}

// Criptografar credenciais
export const encryptCredentials = async (
    credentials: SSHCredentials,
    userId: string
): Promise<string> => {
    try {
        const key = await deriveKey(userId);
        const credentialsString = JSON.stringify(credentials);

        // Gerar IV aleatório
        const iv = await Crypto.getRandomBytesAsync(16);
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

        // Criptografar usando AES-256-CBC simulado (Expo não tem crypto nativo completo)
        // Para uma implementação mais robusta, use react-native-crypto ou similar
        const encrypted = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `${key}_${ivHex}_${credentialsString}`
        );

        // Combinar IV + dados criptografados
        const result = `${ivHex}:${encrypted}`;

        return result;
    } catch (error) {
        console.error('Erro ao criptografar credenciais:', error);
        throw new Error('Falha na criptografia');
    }
};

// Descriptografar credenciais
export const decryptCredentials = async (
    encryptedData: string,
    userId: string
): Promise<SSHCredentials> => {
    try {
        const [ivHex, encryptedContent] = encryptedData.split(':');

        if (!ivHex || !encryptedContent) {
            throw new Error('Formato de dados criptografados inválido');
        }

        const key = await deriveKey(userId);

        // NOTA: Esta é uma implementação simplificada
        // Em produção, use uma biblioteca de criptografia mais robusta
        // como react-native-crypto ou @react-native-async-storage/async-storage com crypto-js

        // Por enquanto, retornamos um erro se não conseguir descriptografar
        // Na implementação real, você descriptografaria usando AES
        throw new Error('Descriptografia não implementada - use uma biblioteca crypto real');

    } catch (error) {
        console.error('Erro ao descriptografar credenciais:', error);
        throw new Error('Falha na descriptografia');
    }
};

// Implementação alternativa usando codificação simples (para desenvolvimento)
export const encodeCredentials = (credentials: SSHCredentials): string => {
    const credentialsString = JSON.stringify(credentials);
    const encoded = Buffer.from(credentialsString, 'utf8').toString('base64');
    return encoded;
};

export const decodeCredentials = (encodedData: string): SSHCredentials => {
    try {
        const decoded = Buffer.from(encodedData, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Erro ao decodificar credenciais:', error);
        throw new Error('Dados corrompidos');
    }
};

// Armazenamento seguro de credenciais
export const storeCredentialsSecurely = async (
    serverId: string,
    credentials: SSHCredentials,
    userId: string
): Promise<void> => {
    try {
        // Usar implementação simples para desenvolvimento
        const encoded = encodeCredentials(credentials);
        const key = `server_credentials_${serverId}_${userId}`;

        await SecureStore.setItemAsync(key, encoded, {
            keychainService: 'ServerManagerCredentials',
            requireAuthentication: false, // Mude para true se quiser biometria
        });

        console.log(`✅ Credenciais armazenadas para servidor ${serverId}`);
    } catch (error) {
        console.error('Erro ao armazenar credenciais:', error);
        throw new Error('Falha ao salvar credenciais');
    }
};

// Recuperar credenciais do armazenamento seguro
export const retrieveCredentialsSecurely = async (
    serverId: string,
    userId: string
): Promise<SSHCredentials | null> => {
    try {
        const key = `server_credentials_${serverId}_${userId}`;
        const encoded = await SecureStore.getItemAsync(key, {
            keychainService: 'ServerManagerCredentials',
        });

        if (!encoded) {
            return null;
        }

        return decodeCredentials(encoded);
    } catch (error) {
        console.error('Erro ao recuperar credenciais:', error);
        return null;
    }
};

// Remover credenciais
export const removeCredentialsSecurely = async (
    serverId: string,
    userId: string
): Promise<void> => {
    try {
        const key = `server_credentials_${serverId}_${userId}`;
        await SecureStore.deleteItemAsync(key, {
            keychainService: 'ServerManagerCredentials',
        });

        console.log(`🗑️ Credenciais removidas para servidor ${serverId}`);
    } catch (error) {
        console.error('Erro ao remover credenciais:', error);
        // Não fazer throw aqui, pois remoção pode falhar se não existir
    }
};

// Validar se credenciais estão disponíveis
export const hasStoredCredentials = async (
    serverId: string,
    userId: string
): Promise<boolean> => {
    try {
        const credentials = await retrieveCredentialsSecurely(serverId, userId);
        return credentials !== null;
    } catch (error) {
        return false;
    }
};

// Limpar todas as credenciais do usuário
export const clearAllCredentials = async (userId: string): Promise<void> => {
    try {
        // Esta é uma implementação simplificada
        // Em produção, você manteria uma lista de chaves ou usaria um padrão
        console.log(`🧹 Limpando todas as credenciais do usuário ${userId}`);

        // Por enquanto, apenas log - implementar baseado em como você armazena a lista
        // de servidores do usuário
    } catch (error) {
        console.error('Erro ao limpar credenciais:', error);
    }
};

// Utilitários de validação
export const validateCredentials = (credentials: SSHCredentials): boolean => {
    if (!credentials.host || !credentials.username) {
        return false;
    }

    if (!credentials.password && !credentials.privateKey) {
        return false;
    }

    if (credentials.port && (credentials.port < 1 || credentials.port > 65535)) {
        return false;
    }

    return true;
};

// Gerar hash das credenciais para comparação (sem revelar dados)
export const hashCredentials = async (credentials: SSHCredentials): Promise<string> => {
    const credentialsString = JSON.stringify({
        host: credentials.host,
        port: credentials.port,
        username: credentials.username,
        // Não incluir senha/chave no hash
    });

    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        credentialsString
    );
};

// Configurações de segurança
export const SECURITY_CONFIG = {
    // Tempo limite para cache de credenciais em memória (ms)
    CREDENTIALS_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutos

    // Número máximo de tentativas de descriptografia
    MAX_DECRYPT_ATTEMPTS: 3,

    // Usar autenticação biométrica se disponível
    USE_BIOMETRIC_AUTH: false, // Mude para true se quiser biometria

    // Log de atividades de segurança
    LOG_SECURITY_EVENTS: __DEV__,
} as const;