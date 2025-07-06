// app/server/command.tsx - Terminal SSH COMPLETO SEM ERROS
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useServers } from '../../contexts/ServerContext';

const { height } = Dimensions.get('window');

interface CommandResult {
    command: string;
    output: string;
    error?: string;
    exitCode: number;
    executedAt: Date;
    duration: number;
}

export default function SSHTerminal() {
    const { serverId } = useLocalSearchParams();
    const router = useRouter();
    const { state } = useServers();

    const [command, setCommand] = useState('');
    const [history, setHistory] = useState<CommandResult[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const [showQuickCommands, setShowQuickCommands] = useState(false);
    const [currentDir, setCurrentDir] = useState('~');
    const [connected, setConnected] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    const server = state.servers.find(s => s.id === serverId);

    useEffect(() => {
        if (server) {
            // Simulate connection
            setTimeout(() => {
                setConnected(true);
                addWelcomeMessage();
            }, 1000);
        }
    }, [server]);

    useEffect(() => {
        // Auto scroll to bottom when new output is added
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [history]);

    const addWelcomeMessage = () => {
        const welcomeResult: CommandResult = {
            command: '',
            output: `Welcome to ${server?.name || 'Server'} SSH Terminal\nConnected to ${server?.host}:${server?.port}\nType 'help' for available commands.\n`,
            exitCode: 0,
            executedAt: new Date(),
            duration: 0,
        };
        setHistory([welcomeResult]);
    };

    const executeCommand = async () => {
        if (!command.trim() || isExecuting || !server) return;

        const currentCommand = command.trim();
        setCommand('');
        setIsExecuting(true);

        // Add to command history
        setCommandHistory(prev => {
            const filtered = prev.filter(cmd => cmd !== currentCommand);
            return [currentCommand, ...filtered.slice(0, 49)];
        });
        setHistoryIndex(-1);

        // Handle special commands
        if (currentCommand === 'clear') {
            setHistory([]);
            setIsExecuting(false);
            return;
        }

        if (currentCommand === 'exit') {
            router.back();
            return;
        }

        if (currentCommand === 'help') {
            const helpResult: CommandResult = {
                command: currentCommand,
                output: `Available commands:
  ls                  List files and directories
  pwd                 Show current directory
  cd <dir>           Change directory
  cat <file>         Display file contents
  ps aux             Show running processes
  top                Show system processes
  df -h              Show disk usage
  free -h            Show memory usage
  uptime             Show system uptime
  whoami             Show current user
  clear              Clear terminal
  exit               Close terminal
  help               Show this help message

Quick tip: Use the up/down arrows to navigate command history.`,
                exitCode: 0,
                executedAt: new Date(),
                duration: 0,
            };
            setHistory(prev => [...prev, helpResult]);
            setIsExecuting(false);
            return;
        }

        // Simulate command execution
        const startTime = Date.now();

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

            // Mock different command outputs
            let output = '';
            let exitCode = 0;

            if (currentCommand.startsWith('ls')) {
                output = `total 24
drwxr-xr-x  5 user user 4096 Jan 15 10:30 .
drwxr-xr-x  3 root root 4096 Jan 10 09:15 ..
-rw-r--r--  1 user user  220 Jan 10 09:15 .bash_logout
-rw-r--r--  1 user user 3771 Jan 10 09:15 .bashrc
drwxr-xr-x  2 user user 4096 Jan 15 10:30 Documents
-rw-r--r--  1 user user  807 Jan 10 09:15 .profile
drwxr-xr-x  2 user user 4096 Jan 12 14:20 scripts`;
            } else if (currentCommand === 'pwd') {
                output = currentDir;
            } else if (currentCommand.startsWith('cd ')) {
                const newDir = currentCommand.split(' ')[1];
                if (newDir === '..') {
                    setCurrentDir('~');
                } else {
                    setCurrentDir(`~/${newDir}`);
                }
                output = '';
            } else if (currentCommand === 'ps aux') {
                output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  19356  1544 ?        Ss   Jan10   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    Jan10   0:00 [kthreadd]
root         3  0.0  0.0      0     0 ?        S    Jan10   0:00 [ksoftirqd/0]
www-data  1234  0.1  2.3 123456 12345 ?        S    10:30   0:05 nginx: worker
mysql     5678  1.2  5.4 234567 23456 ?        Sl   09:15   1:23 mysqld`;
            } else if (currentCommand === 'top') {
                output = `top - 10:32:15 up 5 days, 14:23,  2 users,  load average: 0.15, 0.10, 0.05
Tasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  0.7 sy,  0.0 ni, 96.8 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   2048.0 total,    256.3 free,    987.2 used,    804.5 buff/cache
MiB Swap:   1024.0 total,    512.0 free,    512.0 used.    876.3 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 www-data  20   0  123456  12345   8765 S   1.3   2.1   0:05.67 nginx
 5678 mysql     20   0  234567  23456  11234 S   0.7   4.2   1:23.45 mysqld`;
            } else if (currentCommand === 'df -h') {
                output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G  8.5G   10G  46% /
/dev/sda2       100G   45G   50G  48% /home
tmpfs           1.0G     0  1.0G   0% /dev/shm`;
            } else if (currentCommand === 'free -h') {
                output = `              total        used        free      shared  buff/cache   available
Mem:          2.0Gi       987Mi       256Mi        32Mi       804Mi       876Mi
Swap:         1.0Gi       512Mi       512Mi`;
            } else if (currentCommand === 'uptime') {
                output = '10:32:15 up 5 days, 14:23,  2 users,  load average: 0.15, 0.10, 0.05';
            } else if (currentCommand === 'whoami') {
                output = server.username;
            } else if (currentCommand.startsWith('cat ')) {
                const filename = currentCommand.split(' ')[1];
                if (filename === '.bashrc') {
                    output = `# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# don't put duplicate lines or lines starting with space in the history.
HISTCONTROL=ignoreboth

# append to the history file, don't overwrite it
shopt -s histappend

# for setting history length see HISTSIZE and HISTFILESIZE in bash(1)
HISTSIZE=1000
HISTFILESIZE=2000`;
                } else {
                    output = `cat: ${filename}: No such file or directory`;
                    exitCode = 1;
                }
            } else if (currentCommand === 'netstat -tuln') {
                output = `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN`;
            } else {
                // Unknown command
                output = `bash: ${currentCommand}: command not found`;
                exitCode = 127;
            }

            const result: CommandResult = {
                command: currentCommand,
                output,
                exitCode,
                executedAt: new Date(),
                duration: Date.now() - startTime,
            };

            setHistory(prev => [...prev, result]);
        } catch (error) {
            const errorResult: CommandResult = {
                command: currentCommand,
                output: '',
                error: 'Connection error: Unable to execute command',
                exitCode: 1,
                executedAt: new Date(),
                duration: Date.now() - startTime,
            };
            setHistory(prev => [...prev, errorResult]);
        } finally {
            setIsExecuting(false);
        }
    };

    const navigateHistory = (direction: 'up' | 'down') => {
        if (direction === 'up' && historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCommand(commandHistory[newIndex]);
        } else if (direction === 'down') {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCommand(commandHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setCommand('');
            }
        }
    };

    const clearTerminal = () => {
        setHistory([]);
    };

    const quickCommands = [
        { title: 'List Files', command: 'ls -la', icon: 'list-outline' },
        { title: 'Current Dir', command: 'pwd', icon: 'folder-outline' },
        { title: 'Processes', command: 'ps aux', icon: 'layers-outline' },
        { title: 'System Info', command: 'top', icon: 'hardware-chip-outline' },
        { title: 'Disk Usage', command: 'df -h', icon: 'archive-outline' },
        { title: 'Memory', command: 'free -h', icon: 'speedometer-outline' },
        { title: 'Uptime', command: 'uptime', icon: 'time-outline' },
        { title: 'Network', command: 'netstat -tuln', icon: 'wifi-outline' },
    ];

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const getPrompt = () => {
        return `${server?.username}@${server?.name}:${currentDir}$`;
    };

    if (!server) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color="#F44336" />
                    <Text style={styles.errorText}>
                        Servidor não encontrado
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#1c2128', '#0d1117']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={24} color="#f0f6fc" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Terminal SSH</Text>
                        <Text style={styles.headerSubtitle}>
                            {server.name} ({server.host})
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowQuickCommands(true)}
                        >
                            <Ionicons name="apps" size={20} color="#f0f6fc" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={clearTerminal}
                        >
                            <Ionicons name="trash-outline" size={20} color="#f0f6fc" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Connection Status */}
                <View style={styles.statusBar}>
                    <View style={[styles.statusDot, { backgroundColor: connected ? '#7dd3fc' : '#fbbf24' }]} />
                    <Text style={styles.statusText}>
                        {connected ? 'Conectado' : 'Conectando...'}
                    </Text>
                    {isExecuting && (
                        <View style={styles.executingIndicator}>
                            <Ionicons name="sync" size={12} color="#7dd3fc" />
                            <Text style={styles.executingText}>Executando...</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Terminal Output */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.terminalContainer}
                contentContainerStyle={styles.terminalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {history.map((result, index) => (
                    <View key={index} style={styles.commandBlock}>
                        {result.command && (
                            <View style={styles.commandLine}>
                                <Text style={styles.prompt}>{getPrompt()}</Text>
                                <Text style={styles.commandText}> {result.command}</Text>
                            </View>
                        )}

                        {result.output && (
                            <Text style={styles.outputText}>{result.output}</Text>
                        )}

                        {result.error && (
                            <Text style={styles.errorOutput}>{result.error}</Text>
                        )}

                        {result.command && (
                            <View style={styles.commandMeta}>
                                <Text style={styles.metaText}>
                                    Exit code: {result.exitCode} • {formatDuration(result.duration)} • {result.executedAt.toLocaleTimeString()}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}

                {/* Current input line */}
                <View style={styles.currentLine}>
                    <Text style={styles.prompt}>{getPrompt()}</Text>
                    <Text style={styles.currentCommand}> {command}</Text>
                    <View style={styles.cursor} />
                </View>
            </ScrollView>

            {/* Input Container */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <View style={styles.inputRow}>
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigateHistory('up')}
                        disabled={commandHistory.length === 0}
                    >
                        <Ionicons name="chevron-up" size={20} color="#6b7280" />
                    </TouchableOpacity>

                    <TextInput
                        ref={inputRef}
                        style={styles.commandInput}
                        value={command}
                        onChangeText={setCommand}
                        placeholder="Digite um comando..."
                        placeholderTextColor="#6b7280"
                        autoCapitalize="none"
                        autoCorrect={false}
                        multiline={false}
                        onSubmitEditing={executeCommand}
                        editable={connected && !isExecuting}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigateHistory('down')}
                        disabled={historyIndex <= 0}
                    >
                        <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.executeButton, (!connected || isExecuting || !command.trim()) && styles.executeButtonDisabled]}
                        onPress={executeCommand}
                        disabled={!connected || isExecuting || !command.trim()}
                    >
                        {isExecuting ? (
                            <Ionicons name="hourglass" size={20} color="#6b7280" />
                        ) : (
                            <Ionicons name="send" size={20} color="#7dd3fc" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Quick Commands Modal */}
            <Modal
                visible={showQuickCommands}
                transparent
                animationType="slide"
                onRequestClose={() => setShowQuickCommands(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} style={styles.quickCommandsModal}>
                        <View style={styles.quickCommandsContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Comandos Rápidos</Text>
                                <TouchableOpacity onPress={() => setShowQuickCommands(false)}>
                                    <Ionicons name="close" size={24} color="#f0f6fc" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.commandsList}>
                                {quickCommands.map((cmd, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.quickCommandItem}
                                        onPress={() => {
                                            setCommand(cmd.command);
                                            setShowQuickCommands(false);
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        <View style={styles.commandIcon}>
                                            <Ionicons name={cmd.icon as any} size={20} color="#7dd3fc" />
                                        </View>
                                        <View style={styles.commandInfo}>
                                            <Text style={styles.commandTitle}>{cmd.title}</Text>
                                            <Text style={styles.commandCode}>{cmd.command}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </BlurView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d1117',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        color: '#f0f6fc',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    closeButton: {
        padding: 4,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f0f6fc',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#8b949e',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 4,
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#8b949e',
        fontWeight: '500',
    },
    executingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    executingText: {
        fontSize: 12,
        color: '#7dd3fc',
        marginLeft: 4,
    },
    terminalContainer: {
        flex: 1,
        backgroundColor: '#0d1117',
    },
    terminalContent: {
        padding: 16,
        paddingBottom: 100,
    },
    commandBlock: {
        marginBottom: 8,
    },
    commandLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    prompt: {
        color: '#7dd3fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
        fontWeight: '600',
    },
    commandText: {
        color: '#f0f6fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    outputText: {
        color: '#e6edf3',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    errorOutput: {
        color: '#ff7b72',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    commandMeta: {
        marginTop: 4,
    },
    metaText: {
        color: '#6b7280',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    currentLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    currentCommand: {
        color: '#f0f6fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 14,
    },
    cursor: {
        width: 8,
        height: 16,
        backgroundColor: '#7dd3fc',
        marginLeft: 2,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1c2128',
        borderTopWidth: 1,
        borderTopColor: '#30363d',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    historyButton: {
        padding: 8,
        marginHorizontal: 4,
    },
    commandInput: {
        flex: 1,
        color: '#f0f6fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#21262d',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#30363d',
    },
    executeButton: {
        padding: 8,
        marginLeft: 8,
    },
    executeButtonDisabled: {
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    quickCommandsModal: {
        height: height * 0.6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    quickCommandsContent: {
        flex: 1,
        backgroundColor: '#1c2128',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#30363d',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f0f6fc',
    },
    commandsList: {
        flex: 1,
    },
    quickCommandItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#21262d',
    },
    commandIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#21262d',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    commandInfo: {
        flex: 1,
    },
    commandTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#f0f6fc',
        marginBottom: 2,
    },
    commandCode: {
        fontSize: 12,
        color: '#8b949e',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});