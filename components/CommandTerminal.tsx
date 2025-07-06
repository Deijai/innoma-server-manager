// components/CommandTerminal.tsx - Terminal SSH Interativo Completo
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSSHCommand } from '../hooks/useSSHCommand';

const { width } = Dimensions.get('window');

interface CommandTerminalProps {
    serverId: string;
    serverName?: string;
    initialCommand?: string;
    onClose?: () => void;
    autoFocus?: boolean;
}

export function CommandTerminal({
    serverId,
    serverName = 'Server',
    initialCommand = '',
    onClose,
    autoFocus = true
}: CommandTerminalProps) {
    const [currentCommand, setCurrentCommand] = useState(initialCommand);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showQuickCommands, setShowQuickCommands] = useState(false);

    const {
        execute,
        executing,
        history,
        error,
        cancelExecution,
        clearHistory,
        getCommandHistory
    } = useSSHCommand({ serverId });

    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    // Auto scroll to bottom when new output appears
    useEffect(() => {
        if (history.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [history.length]);

    // Load command history on mount
    useEffect(() => {
        const cmdHistory = getCommandHistory();
        setCommandHistory(cmdHistory.slice(0, 50)); // Last 50 commands
    }, [getCommandHistory]);

    // Focus input on mount
    useEffect(() => {
        if (autoFocus) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [autoFocus]);

    const handleExecuteCommand = useCallback(async () => {
        if (!currentCommand.trim() || executing) return;

        const command = currentCommand.trim();
        setCurrentCommand('');

        // Add to local command history
        setCommandHistory(prev => {
            const filtered = prev.filter(cmd => cmd !== command);
            return [command, ...filtered.slice(0, 49)];
        });
        setHistoryIndex(-1);

        try {
            await execute(command);
        } catch (err) {
            console.error('Command execution failed:', err);
        }
    }, [currentCommand, executing, execute]);

    const navigateHistory = useCallback((direction: 'up' | 'down') => {
        if (direction === 'up' && historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentCommand(commandHistory[newIndex] || '');
        } else if (direction === 'down') {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[newIndex] || '');
            } else {
                setHistoryIndex(-1);
                setCurrentCommand('');
            }
        }
    }, [historyIndex, commandHistory]);

    const insertCommand = useCallback((command: string) => {
        setCurrentCommand(command);
        setShowQuickCommands(false);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    const handleClearHistory = useCallback(() => {
        Alert.alert(
            'Limpar Histórico',
            'Tem certeza que deseja limpar todo o histórico de comandos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                        clearHistory();
                        setCommandHistory([]);
                    }
                }
            ]
        );
    }, [clearHistory]);

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    };

    const getExitCodeColor = (exitCode: number) => {
        return exitCode === 0 ? theme.colors.success : theme.colors.error;
    };

    const quickCommands = [
        { label: 'List Files', command: 'ls -la', icon: 'list-outline' },
        { label: 'Current Dir', command: 'pwd', icon: 'folder-outline' },
        { label: 'Disk Usage', command: 'df -h', icon: 'archive-outline' },
        { label: 'Memory Info', command: 'free -h', icon: 'hardware-chip-outline' },
        { label: 'Processes', command: 'ps aux', icon: 'layers-outline' },
        { label: 'System Info', command: 'uname -a', icon: 'information-circle-outline' },
        { label: 'Uptime', command: 'uptime', icon: 'time-outline' },
        { label: 'Network', command: 'netstat -tuln', icon: 'wifi-outline' },
        { label: 'Who\'s Online', command: 'who', icon: 'people-outline' },
        { label: 'Last Logins', command: 'last -10', icon: 'log-in-outline' },
    ];

    const systemCommands = [
        { label: 'Restart Apache', command: 'sudo systemctl restart apache2', icon: 'refresh-outline' },
        { label: 'Restart Nginx', command: 'sudo systemctl restart nginx', icon: 'refresh-outline' },
        { label: 'Check Services', command: 'systemctl --type=service --state=running', icon: 'checkmark-circle-outline' },
        { label: 'System Log', command: 'tail -f /var/log/syslog', icon: 'document-text-outline' },
    ];

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        {serverName}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
                        SSH Terminal
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => setShowQuickCommands(!showQuickCommands)}
                        style={[styles.headerButton, showQuickCommands && { backgroundColor: theme.colors.primary + '20' }]}
                    >
                        <Ionicons name="apps" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleClearHistory} style={styles.headerButton}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    {executing && (
                        <TouchableOpacity onPress={cancelExecution} style={styles.headerButton}>
                            <Ionicons name="stop" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}

                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Ionicons name="close" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Quick Commands Panel */}
            {showQuickCommands && (
                <View style={[styles.quickCommandsPanel, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.quickCommandsTitle, { color: theme.colors.text }]}>
                        Comandos Rápidos
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.quickCommandsGrid}>
                            <Text style={[styles.quickCommandsSubtitle, { color: theme.colors.textSecondary }]}>
                                Sistema
                            </Text>
                            <View style={styles.quickCommandsRow}>
                                {quickCommands.map((cmd, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.quickCommand, { backgroundColor: theme.colors.primary + '10' }]}
                                        onPress={() => insertCommand(cmd.command)}
                                    >
                                        <Ionicons name={cmd.icon as any} size={16} color={theme.colors.primary} />
                                        <Text style={[styles.quickCommandText, { color: theme.colors.primary }]}>
                                            {cmd.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.quickCommandsSubtitle, { color: theme.colors.textSecondary }]}>
                                Serviços
                            </Text>
                            <View style={styles.quickCommandsRow}>
                                {systemCommands.map((cmd, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.quickCommand, { backgroundColor: theme.colors.warning + '10' }]}
                                        onPress={() => insertCommand(cmd.command)}
                                    >
                                        <Ionicons name={cmd.icon as any} size={16} color={theme.colors.warning} />
                                        <Text style={[styles.quickCommandText, { color: theme.colors.warning }]}>
                                            {cmd.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Terminal Output */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.output}
                contentContainerStyle={styles.outputContent}
                showsVerticalScrollIndicator={false}
            >
                {history.length === 0 && (
                    <View style={styles.welcomeMessage}>
                        <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
                            Terminal SSH conectado a {serverName}
                        </Text>
                        <Text style={[styles.welcomeSubtext, { color: theme.colors.textSecondary }]}>
                            Digite um comando ou use os comandos rápidos acima
                        </Text>
                    </View>
                )}

                {history.map((result, index) => (
                    <View key={index} style={styles.commandBlock}>
                        {/* Command Line */}
                        <View style={styles.commandLineContainer}>
                            <Text style={[styles.commandPrompt, { color: theme.colors.primary }]}>
                                $
                            </Text>
                            <Text style={[styles.commandLine, { color: theme.colors.text }]}>
                                {result.command}
                            </Text>
                            <View style={[styles.exitCodeBadge, { backgroundColor: getExitCodeColor(result.exitCode) + '20' }]}>
                                <Text style={[styles.exitCodeText, { color: getExitCodeColor(result.exitCode) }]}>
                                    {result.exitCode}
                                </Text>
                            </View>
                        </View>

                        {/* Output */}
                        {result.output && (
                            <Text style={[styles.commandOutput, { color: theme.colors.text }]}>
                                {result.output}
                            </Text>
                        )}

                        {/* Error */}
                        {result.error && (
                            <Text style={[styles.commandError, { color: theme.colors.error }]}>
                                {result.error}
                            </Text>
                        )}

                        {/* Metadata */}
                        <Text style={[styles.commandMeta, { color: theme.colors.textSecondary }]}>
                            {result.executedAt.toLocaleTimeString()} • {formatDuration(result.duration)}
                        </Text>
                    </View>
                ))}

                {/* Current command line (when executing) */}
                {executing && (
                    <View style={styles.commandBlock}>
                        <View style={styles.commandLineContainer}>
                            <Text style={[styles.commandPrompt, { color: theme.colors.primary }]}>
                                $
                            </Text>
                            <Text style={[styles.commandLine, { color: theme.colors.text }]}>
                                {history[0]?.command || 'Executando...'}
                            </Text>
                            <View style={styles.executingIndicator}>
                                <Ionicons name="hourglass" size={12} color={theme.colors.warning} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Error Display */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '10' }]}>
                    <Ionicons name="warning" size={16} color={theme.colors.error} />
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Input Container */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.inputRow}>
                    <Text style={[styles.inputPrompt, { color: theme.colors.primary }]}>
                        $
                    </Text>

                    <TextInput
                        ref={inputRef}
                        style={[styles.input, { color: theme.colors.text }]}
                        value={currentCommand}
                        onChangeText={setCurrentCommand}
                        placeholder="Digite um comando..."
                        placeholderTextColor={theme.colors.textSecondary}
                        onSubmitEditing={handleExecuteCommand}
                        editable={!executing}
                        multiline={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                    //autoCompleteType="off"
                    />

                    <TouchableOpacity
                        onPress={() => navigateHistory('up')}
                        style={[styles.historyButton, { opacity: commandHistory.length > 0 ? 1 : 0.3 }]}
                        disabled={commandHistory.length === 0}
                    >
                        <Ionicons name="chevron-up" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigateHistory('down')}
                        style={[styles.historyButton, { opacity: historyIndex > -1 ? 1 : 0.3 }]}
                        disabled={historyIndex <= -1}
                    >
                        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleExecuteCommand}
                        style={[
                            styles.executeButton,
                            { backgroundColor: theme.colors.primary },
                            (executing || !currentCommand.trim()) && styles.executeButtonDisabled
                        ]}
                        disabled={executing || !currentCommand.trim()}
                    >
                        <Ionicons
                            name={executing ? "hourglass" : "send"}
                            size={18}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingTop: 50,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
    },
    quickCommandsPanel: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        maxHeight: 200,
    },
    quickCommandsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    quickCommandsGrid: {
        paddingRight: 16,
    },
    quickCommandsSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 8,
    },
    quickCommandsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    quickCommand: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
    },
    quickCommandText: {
        fontSize: 12,
        fontWeight: '500',
    },
    output: {
        flex: 1,
    },
    outputContent: {
        padding: 16,
        paddingBottom: 20,
    },
    welcomeMessage: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    welcomeSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    commandBlock: {
        marginBottom: 16,
    },
    commandLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commandPrompt: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    commandLine: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        flex: 1,
    },
    exitCodeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    exitCodeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    executingIndicator: {
        marginLeft: 8,
    },
    commandOutput: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
        paddingLeft: 16,
    },
    commandError: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
        paddingLeft: 16,
    },
    commandMeta: {
        fontSize: 11,
        fontStyle: 'italic',
        paddingLeft: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        flex: 1,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputPrompt: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        marginRight: 8,
    },
    historyButton: {
        padding: 8,
        marginHorizontal: 2,
    },
    executeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    executeButtonDisabled: {
        opacity: 0.5,
    },
});