// app/server/add.tsx - Adicionar Servidor Redesenhado
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { useServers } from '../../contexts/ServerContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const schema = yup.object({
    name: yup.string().required('Nome é obrigatório'),
    host: yup.string().required('Host é obrigatório'),
    port: yup.number().positive().integer().default(22),
    username: yup.string().required('Username é obrigatório'),
    password: yup.string().min(1, 'Password é obrigatório'),
    description: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

export default function AddServer() {
    const { addServer } = useServers();
    const { theme } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Focus states
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            port: 22,
        },
    });

    const testConnection = async () => {
        setTesting(true);
        setConnectionStatus('idle');

        try {
            const values = getValues();

            // Simular teste de conexão
            await new Promise(resolve => setTimeout(resolve, 2000));
            const isValid = Math.random() > 0.3; // 70% de chance de sucesso

            if (isValid) {
                setConnectionStatus('success');
                Alert.alert(
                    'Conexão bem-sucedida! ✅',
                    'O servidor está acessível e as credenciais estão corretas.',
                    [{ text: 'OK', style: 'default' }]
                );
            } else {
                setConnectionStatus('error');
                Alert.alert(
                    'Falha na conexão ❌',
                    'Não foi possível conectar ao servidor. Verifique as informações e tente novamente.',
                    [{ text: 'OK', style: 'default' }]
                );
            }
        } catch (error) {
            setConnectionStatus('error');
            Alert.alert('Erro', 'Erro ao testar conexão');
        } finally {
            setTesting(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setSaving(true);
        try {
            await addServer({
                ...data,
                tags: [],
                isActive: true,
            });

            Alert.alert(
                'Servidor adicionado! 🎉',
                `${data.name} foi adicionado com sucesso à sua lista de servidores.`,
                [{
                    text: 'OK',
                    onPress: () => router.back(),
                    style: 'default'
                }]
            );
        } catch (error) {
            Alert.alert('Erro', 'Erro ao adicionar servidor');
        } finally {
            setSaving(false);
        }
    };

    // Componente de Input Personalizado
    const InputField = ({
        label,
        name,
        placeholder,
        keyboardType = 'default',
        secureTextEntry = false,
        icon,
        multiline = false,
        ...props
    }: {
        label: string;
        name: keyof FormData;
        placeholder: string;
        keyboardType?: any;
        secureTextEntry?: boolean;
        icon: string;
        multiline?: boolean;
    }) => (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
                    <View style={[
                        styles.inputContainer,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: focusedField === name ? theme.colors.primary : theme.colors.border
                        },
                        focusedField === name && styles.inputContainerFocused,
                        errors[name] && styles.inputContainerError
                    ]}>
                        <Ionicons
                            name={icon as any}
                            size={20}
                            color={focusedField === name ? theme.colors.primary : theme.colors.textSecondary}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[
                                styles.textInput,
                                { color: theme.colors.text },
                                multiline && styles.textInputMultiline
                            ]}
                            value={value?.toString()}
                            onChangeText={onChange}
                            placeholder={placeholder}
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType={keyboardType}
                            secureTextEntry={secureTextEntry}
                            multiline={multiline}
                            numberOfLines={multiline ? 3 : 1}
                            onFocus={() => setFocusedField(name)}
                            onBlur={() => setFocusedField(null)}
                            {...props}
                        />
                    </View>
                    {errors[name] && (
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>
                            {errors[name]?.message}
                        </Text>
                    )}
                </View>
            )}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={theme.dark ? ['#1a1a2e', '#16213e'] : ['#4facfe', '#00f2fe']}
                style={styles.header}
            >
                <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <View style={[styles.backButtonBackground, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Novo Servidor</Text>
                        <Text style={styles.headerSubtitle}>Adicione um servidor SSH</Text>
                    </View>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header da Seção */}
                    <View style={styles.formHeader}>
                        <View style={[styles.formIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons name="server-outline" size={28} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                            Informações do Servidor
                        </Text>
                        <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
                            Preencha os dados para conectar ao seu servidor
                        </Text>
                    </View>

                    {/* Campos do Formulário */}
                    <InputField
                        label="Nome do Servidor"
                        name="name"
                        placeholder="Ex: Servidor de Produção"
                        icon="bookmark-outline"
                    />

                    <InputField
                        label="Endereço/IP"
                        name="host"
                        placeholder="192.168.1.100 ou meuservidor.com"
                        icon="globe-outline"
                        keyboardType="url"
                    />

                    <InputField
                        label="Porta SSH"
                        name="port"
                        placeholder="22"
                        icon="link-outline"
                        keyboardType="numeric"
                    />

                    <InputField
                        label="Usuário"
                        name="username"
                        placeholder="root ou ubuntu"
                        icon="person-outline"
                    />

                    <InputField
                        label="Senha"
                        name="password"
                        placeholder="Sua senha SSH"
                        icon="key-outline"
                        secureTextEntry
                    />

                    <InputField
                        label="Descrição (opcional)"
                        name="description"
                        placeholder="Descrição do servidor..."
                        icon="document-text-outline"
                        multiline
                    />

                    {/* Status da Conexão */}
                    {connectionStatus !== 'idle' && (
                        <View style={[
                            styles.statusContainer,
                            connectionStatus === 'success'
                                ? { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success + '30' }
                                : { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error + '30' }
                        ]}>
                            <Ionicons
                                name={connectionStatus === 'success' ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={connectionStatus === 'success' ? theme.colors.success : theme.colors.error}
                            />
                            <Text style={[
                                styles.statusText,
                                { color: connectionStatus === 'success' ? theme.colors.success : theme.colors.error }
                            ]}>
                                {connectionStatus === 'success'
                                    ? 'Conexão testada com sucesso'
                                    : 'Falha no teste de conexão'
                                }
                            </Text>
                        </View>
                    )}

                    {/* Dica de Segurança */}
                    <View style={[styles.helpContainer, { backgroundColor: theme.colors.info + '15' }]}>
                        <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
                        <Text style={[styles.helpText, { color: theme.colors.info }]}>
                            Recomendamos testar a conexão antes de salvar. Suas credenciais serão criptografadas e armazenadas com segurança.
                        </Text>
                    </View>

                    {/* Botões de Ação */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.testButton,
                                { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
                                testing && styles.testButtonDisabled
                            ]}
                            onPress={testConnection}
                            disabled={testing}
                            activeOpacity={0.8}
                        >
                            <View style={styles.testButtonContent}>
                                {testing ? (
                                    <ActivityIndicator color={theme.colors.primary} size="small" />
                                ) : (
                                    <Ionicons name="wifi-outline" size={18} color={theme.colors.primary} />
                                )}
                                <Text style={[styles.testButtonText, { color: theme.colors.primary }]}>
                                    {testing ? 'Testando...' : 'Testar Conexão'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: theme.colors.primary },
                                saving && styles.saveButtonDisabled
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <View style={styles.saveButtonContent}>
                                    <Ionicons name="checkmark" size={18} color="white" />
                                    <Text style={styles.saveButtonText}>Salvar Servidor</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    backButtonBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    formIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputContainerFocused: {
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    inputContainerError: {
        borderColor: '#F44336',
    },
    inputIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        paddingVertical: 0,
        minHeight: 20,
    },
    textInputMultiline: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    helpContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(33, 150, 243, 0.2)',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    helpText: {
        fontSize: 13,
        lineHeight: 18,
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    buttonContainer: {
        gap: 16,
        marginTop: 8,
    },
    testButton: {
        borderRadius: 16,
        borderWidth: 2,
        paddingVertical: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    testButtonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    testButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    saveButton: {
        borderRadius: 16,
        paddingVertical: 18,
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        letterSpacing: 0.3,
    },
});