// services/types.ts - Tipos Básicos para o Sistema
export interface Server {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string; // Será criptografado
    privateKey?: string; // Será criptografado
    description?: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServerStatus {
    serverId: string;
    isOnline: boolean;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
    lastCheck: Date;
    services: ServiceStatus[];
}

export interface ServiceStatus {
    name: string;
    isRunning: boolean;
    pid?: number;
    cpu?: number;
    memory?: number;
}

export interface CommandResult {
    command: string;
    output: string;
    error?: string;
    exitCode: number;
    executedAt: Date;
    duration: number;
}

export interface SSHCredentials {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
}