// utils/validation.ts - Sistema de Validações
import * as yup from 'yup';
import { SSHCredentials } from './encryption';

// Regex patterns comuns
const PATTERNS = {
    // IPv4 address
    IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

    // IPv6 address (simplificado)
    IPV6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,

    // Hostname/FQDN
    HOSTNAME: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,

    // Username SSH (mais restritivo)
    SSH_USERNAME: /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,31}$/,

    // Senha forte
    STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

    // Comando SSH perigoso
    DANGEROUS_COMMANDS: /(rm\s+-rf|sudo\s+rm|format|mkfs|dd\s+if=|:(){ :|:&};:|del\s+\/|rmdir\s+\/)/i,
} as const;

// Validação de email
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validação de senha
export const validatePassword = (password: string): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong'
} => {
    const errors: string[] = [];

    if (password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (password.length < 8) {
        errors.push('Recomendado: pelo menos 8 caracteres');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra minúscula');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra maiúscula');
    }

    if (!/\d/.test(password)) {
        errors.push('Deve conter pelo menos um número');
    }

    if (!/[@$!%*?&]/.test(password)) {
        errors.push('Recomendado: caracteres especiais (@$!%*?&)');
    }

    // Determinar força da senha
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length >= 12 && PATTERNS.STRONG_PASSWORD.test(password)) {
        strength = 'strong';
    } else if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        strength = 'medium';
    }

    return {
        valid: password.length >= 6,
        errors: errors.filter(error => !error.startsWith('Recomendado:')),
        strength
    };
};

// Validação de host (IP ou hostname)
export const validateHost = (host: string): { valid: boolean; type: 'ipv4' | 'ipv6' | 'hostname' | 'invalid' } => {
    if (!host || host.trim().length === 0) {
        return { valid: false, type: 'invalid' };
    }

    const trimmedHost = host.trim();

    if (PATTERNS.IPV4.test(trimmedHost)) {
        return { valid: true, type: 'ipv4' };
    }

    if (PATTERNS.IPV6.test(trimmedHost)) {
        return { valid: true, type: 'ipv6' };
    }

    if (PATTERNS.HOSTNAME.test(trimmedHost)) {
        return { valid: true, type: 'hostname' };
    }

    return { valid: false, type: 'invalid' };
};

// Validação de porta
export const validatePort = (port: number | string): boolean => {
    const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
    return Number.isInteger(portNum) && portNum > 0 && portNum <= 65535;
};

// Validação de username SSH
export const validateSSHUsername = (username: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
        errors.push('Username é obrigatório');
        return { valid: false, errors };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length > 32) {
        errors.push('Username não pode ter mais de 32 caracteres');
    }

    if (trimmedUsername.length < 1) {
        errors.push('Username não pode estar vazio');
    }

    if (!PATTERNS.SSH_USERNAME.test(trimmedUsername)) {
        errors.push('Username deve começar com letra ou número e conter apenas letras, números, pontos, hífens e underscores');
    }

    // Usernames reservados
    const reservedUsernames = ['root', 'admin', 'administrator', 'guest', 'nobody', 'daemon'];
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
        // Apenas aviso, não erro
        console.warn(`⚠️ Username '${trimmedUsername}' é um username de sistema`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Validação de credenciais SSH completas
export const validateSSHCredentials = (credentials: Partial<SSHCredentials>): {
    valid: boolean;
    errors: Record<string, string[]>;
    warnings: string[];
} => {
    const errors: Record<string, string[]> = {};
    const warnings: string[] = [];

    // Validar host
    if (!credentials.host) {
        errors.host = ['Host é obrigatório'];
    } else {
        const hostValidation = validateHost(credentials.host);
        if (!hostValidation.valid) {
            errors.host = ['Host deve ser um IP válido ou hostname'];
        }
    }

    // Validar porta
    if (credentials.port && !validatePort(credentials.port)) {
        errors.port = ['Porta deve ser um número entre 1 e 65535'];
    }

    // Validar username
    if (!credentials.username) {
        errors.username = ['Username é obrigatório'];
    } else {
        const usernameValidation = validateSSHUsername(credentials.username);
        if (!usernameValidation.valid) {
            errors.username = usernameValidation.errors;
        }
    }

    // Validar credenciais de autenticação
    if (!credentials.password && !credentials.privateKey) {
        errors.auth = ['Senha ou chave privada é obrigatória'];
    }

    if (credentials.password) {
        const passwordValidation = validatePassword(credentials.password);
        if (passwordValidation.strength === 'weak') {
            warnings.push('Senha fraca - considere usar uma senha mais forte');
        }
    }

    // Verificar porta padrão
    if (!credentials.port || credentials.port === 22) {
        warnings.push('Usando porta SSH padrão (22) - considere usar uma porta customizada para maior segurança');
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
        warnings
    };
};

// Validação de comandos SSH (segurança)
export const validateSSHCommand = (command: string): {
    safe: boolean;
    warnings: string[];
    errors: string[];
} => {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!command || command.trim().length === 0) {
        errors.push('Comando não pode estar vazio');
        return { safe: false, warnings, errors };
    }

    const trimmedCommand = command.trim();

    // Verificar comandos perigosos
    if (PATTERNS.DANGEROUS_COMMANDS.test(trimmedCommand)) {
        errors.push('Comando potencialmente perigoso detectado');
        return { safe: false, warnings, errors };
    }

    // Verificar comandos que precisam de sudo
    if (trimmedCommand.startsWith('sudo ')) {
        warnings.push('Comando requer privilégios de administrador');
    }

    // Verificar comandos que podem demorar
    const longRunningCommands = ['find /', 'dd ', 'tar ', 'rsync ', 'scp '];
    if (longRunningCommands.some(cmd => trimmedCommand.includes(cmd))) {
        warnings.push('Comando pode demorar para executar');
    }

    // Verificar pipes e redirecionamentos suspeitos
    if (trimmedCommand.includes(' > /dev/') || trimmedCommand.includes(' >> /dev/')) {
        warnings.push('Redirecionamento para dispositivo do sistema');
    }

    return {
        safe: errors.length === 0,
        warnings,
        errors
    };
};

// Schemas Yup para formulários
export const serverFormSchema = yup.object({
    name: yup
        .string()
        .required('Nome é obrigatório')
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(50, 'Nome não pode ter mais de 50 caracteres'),

    host: yup
        .string()
        .required('Host é obrigatório')
        .test('valid-host', 'Host deve ser um IP válido ou hostname', (value) => {
            if (!value) return false;
            return validateHost(value).valid;
        }),

    port: yup
        .number()
        .integer('Porta deve ser um número inteiro')
        .min(1, 'Porta deve ser maior que 0')
        .max(65535, 'Porta deve ser menor que 65536')
        .default(22),

    username: yup
        .string()
        .required('Username é obrigatório')
        .test('valid-username', 'Username inválido', (value) => {
            if (!value) return false;
            return validateSSHUsername(value).valid;
        }),

    password: yup
        .string()
        .min(1, 'Senha é obrigatória'),

    description: yup
        .string()
        .max(200, 'Descrição não pode ter mais de 200 caracteres'),

    tags: yup
        .array()
        .of(yup.string())
        .default([])
});

export const authFormSchema = yup.object({
    email: yup
        .string()
        .required('Email é obrigatório')
        .email('Email deve ser válido'),

    password: yup
        .string()
        .required('Senha é obrigatória')
        .min(6, 'Senha deve ter pelo menos 6 caracteres'),

    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Senhas devem coincidir')
        .when('password', {
            is: (password: string) => password && password.length > 0,
            then: (schema) => schema.required('Confirmação de senha é obrigatória'),
            otherwise: (schema) => schema
        })
});

// Utilitários de validação em tempo real
export const createRealTimeValidator = <T>(schema: yup.ObjectSchema<any>) => {
    return {
        validateField: async (fieldName: keyof T, value: any) => {
            try {
                await schema.validateAt(fieldName as string, { [fieldName]: value });
                return { valid: true, error: null };
            } catch (error) {
                return {
                    valid: false,
                    error: error instanceof yup.ValidationError ? error.message : 'Erro de validação'
                };
            }
        },

        validateAll: async (values: Partial<T>) => {
            try {
                await schema.validate(values, { abortEarly: false });
                return { valid: true, errors: {} };
            } catch (error) {
                if (error instanceof yup.ValidationError) {
                    const errors: Record<string, string> = {};
                    error.inner.forEach(err => {
                        if (err.path) {
                            errors[err.path] = err.message;
                        }
                    });
                    return { valid: false, errors };
                }
                return { valid: false, errors: { general: 'Erro de validação' } };
            }
        }
    };
};

// Validadores pré-criados
export const serverValidator = createRealTimeValidator(serverFormSchema);
export const authValidator = createRealTimeValidator(authFormSchema);

// Utilitário para sanitizar entrada do usuário
export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>\"']/g, '') // Remove caracteres perigosos básicos
        .replace(/\s+/g, ' '); // Normaliza espaços
};

// Validação de arquivos (para upload de chaves SSH)
export const validateSSHKeyFile = (content: string): {
    valid: boolean;
    type: 'rsa' | 'ed25519' | 'ecdsa' | 'unknown';
    errors: string[];
} => {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
        errors.push('Conteúdo da chave não pode estar vazio');
        return { valid: false, type: 'unknown', errors };
    }

    const trimmedContent = content.trim();

    // Verificar formato básico de chave privada
    if (!trimmedContent.includes('-----BEGIN') || !trimmedContent.includes('-----END')) {
        errors.push('Formato de chave SSH inválido');
        return { valid: false, type: 'unknown', errors };
    }

    // Detectar tipo de chave
    let type: 'rsa' | 'ed25519' | 'ecdsa' | 'unknown' = 'unknown';

    if (trimmedContent.includes('RSA PRIVATE KEY')) {
        type = 'rsa';
    } else if (trimmedContent.includes('OPENSSH PRIVATE KEY') && trimmedContent.includes('ed25519')) {
        type = 'ed25519';
    } else if (trimmedContent.includes('EC PRIVATE KEY')) {
        type = 'ecdsa';
    }

    // Verificar se a chave não está corrompida (verificação básica)
    const lines = trimmedContent.split('\n');
    if (lines.length < 3) {
        errors.push('Chave SSH parece estar corrompida');
    }

    return {
        valid: errors.length === 0,
        type,
        errors
    };
};

// Export de tipos para uso em outros arquivos
export type ValidationResult = {
    valid: boolean;
    errors?: string[] | Record<string, string[]>;
    warnings?: string[];
};

export type FieldValidationResult = {
    valid: boolean;
    error: string | null;
};