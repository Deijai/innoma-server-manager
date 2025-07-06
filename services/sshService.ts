// services/sshService.ts - Serviço SSH Básico
import { CommandResult, ServerStatus, SSHCredentials } from './types';

const SSH_API_BASE = __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-ssh-service.vercel.app/api';

class SSHService {
    async testConnection(credentials: SSHCredentials): Promise<boolean> {
        try {
            // Simular teste de conexão por enquanto
            await new Promise(resolve => setTimeout(resolve, 1000));
            return Math.random() > 0.3; // 70% de chance de sucesso
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async executeCommand(credentials: SSHCredentials, command: string): Promise<CommandResult> {
        const startTime = Date.now();

        try {
            // Simular execução de comando
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

            let output = '';
            let exitCode = 0;

            // Mock responses para comandos comuns
            if (command.includes('ls')) {
                output = `total 24
drwxr-xr-x  5 user user 4096 Jan 15 10:30 .
drwxr-xr-x  3 root root 4096 Jan 10 09:15 ..
-rw-r--r--  1 user user  220 Jan 10 09:15 .bash_logout
-rw-r--r--  1 user user 3771 Jan 10 09:15 .bashrc`;
            } else if (command === 'pwd') {
                output = '/home/user';
            } else if (command.includes('ps')) {
                output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  19356  1544 ?        Ss   Jan10   0:01 /sbin/init
www-data  1234  0.1  2.3 123456 12345 ?        S    10:30   0:05 nginx`;
            } else if (command === 'uptime') {
                output = '10:32:15 up 5 days, 14:23, 2 users, load average: 0.15, 0.10, 0.05';
            } else {
                output = `Command executed: ${command}`;
            }

            return {
                command,
                output,
                exitCode,
                executedAt: new Date(),
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                command,
                output: '',
                error: error instanceof Error ? error.message : 'Unknown error',
                exitCode: 1,
                executedAt: new Date(),
                duration: Date.now() - startTime,
            };
        }
    }

    async getServerStatus(credentials: SSHCredentials): Promise<ServerStatus> {
        try {
            // Simular status do servidor
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                serverId: '',
                isOnline: Math.random() > 0.2, // 80% chance de estar online
                cpuUsage: Math.random() * 100,
                memoryUsage: Math.random() * 100,
                diskUsage: Math.random() * 100,
                uptime: Math.floor(Math.random() * 1000000),
                lastCheck: new Date(),
                services: [],
            };
        } catch (error) {
            return {
                serverId: '',
                isOnline: false,
                cpuUsage: 0,
                memoryUsage: 0,
                diskUsage: 0,
                uptime: 0,
                lastCheck: new Date(),
                services: [],
            };
        }
    }
}

export const sshService = new SSHService();