// app/server/add.tsx - Adicionar Servidor
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';
import { useServers } from '../../contexts/ServerContext';

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
    const router = useRouter();
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

            // Simular teste de conexão (substituir pela chamada real)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // const isValid = await sshService.testConnection({
            //   host: values.host,
            //   port: values.port,
            //   username: values.username,
            //   password: values.password,
            // });

            const isValid = Math.random() > 0.3; // Simulação

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
                    <Text style={styles.inputLabel}>{label}</Text>
                    <View style={[
                        styles.inputContainer,
                        focusedField === name && styles.inputContainerFocused,
                        errors[name] && styles.inputContainerError
                    ]}>
                        <Ionicons
                            name={icon as any}
                            size={20}
                            color={focusedField === name ? "#4FACFE" : "#8E8E93"}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={[styles.textInput, multiline && styles.textInputMultiline]}
                            value={value?.toString()}
                            onChangeText={onChange}
                            placeholder={placeholder}
                            placeholderTextColor="#8E8E93"
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
                        <Text style={styles.errorText}>{errors[name]?.message}</Text>
                    )}
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.backgroundGradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <View style={styles.backButtonBackground}>
                        <Ionicons name="arrow-back" size={20} color="#4facfe" />
                    </View>
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Novo Servidor</Text>
                    <Text style={styles.headerSubtitle}>Adicione um servidor SSH</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Form Container */}
                    <BlurView intensity={20} style={styles.formContainer}>
                        <View style={styles.formContent}>
                            <View style={styles.formHeader}>
                                <View style={styles.formIcon}>
                                    <Ionicons name="server-outline" size={24} color="#4facfe" />
                                </View>
                                <Text style={styles.formTitle}>Informações do Servidor</Text>
                                <Text style={styles.formSubtitle}>
                                    Preencha os dados para conectar ao seu servidor
                                </Text>
                            </View>

                            {/* Form Fields */}
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
                            //autoCapitalize="none"
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

                            {/* Connection Status */}
                            {connectionStatus !== 'idle' && (
                                <View style={[
                                    styles.statusContainer,
                                    connectionStatus === 'success' ? styles.statusSuccess : styles.statusError
                                ]}>
                                    <Ionicons
                                        name={connectionStatus === 'success' ? 'checkmark-circle' : 'close-circle'}
                                        size={16}
                                        color={connectionStatus === 'success' ? '#4CAF50' : '#F44336'}
                                    />
                                    <Text style={[
                                        styles.statusText,
                                        { color: connectionStatus === 'success' ? '#4CAF50' : '#F44336' }
                                    ]}>
                                        {connectionStatus === 'success'
                                            ? 'Conexão testada com sucesso'
                                            : 'Falha no teste de conexão'
                                        }
                                    </Text>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.testButton, testing && styles.testButtonDisabled]}
                                    onPress={testConnection}
                                    disabled={testing}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.testButtonContent}>
                                        {testing ? (
                                            <ActivityIndicator color="#4FACFE" size="small" />
                                        ) : (
                                            <Ionicons name="wifi-outline" size={18} color="#4FACFE" />
                                        )}
                                        <Text style={styles.testButtonText}>
                                            {testing ? 'Testando...' : 'Testar Conexão'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={saving}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={saving ? ['#ccc', '#aaa'] : ['#4CAF50', '#45A049']}
                                        style={styles.saveButtonGradient}
                                    >
                                        {saving ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark" size={18} color="white" />
                                                <Text style={styles.saveButtonText}>Salvar Servidor</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Help Text */}
                            <View style={styles.helpContainer}>
                                <Ionicons name="information-circle-outline" size={16} color="#666" />
                                <Text style={styles.helpText}>
                                    Recomendamos testar a conexão antes de salvar. Suas credenciais serão criptografadas e armazenadas com segurança.
                                </Text>
                            </View>
                        </View>
                    </BlurView>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 16,
    },
    backButtonBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        paddingBottom: 40,
    },
    formContainer: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    formContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 24,
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 28,
    },
    formIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputContainerFocused: {
        backgroundColor: 'white',
        borderColor: '#4FACFE',
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
        color: '#333',
        fontWeight: '400',
    },
    textInputMultiline: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        color: '#F44336',
        marginTop: 6,
        marginLeft: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    statusSuccess: {
        backgroundColor: '#F0FFF4',
        borderWidth: 1,
        borderColor: '#C6F6D5',
    },
    statusError: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    buttonContainer: {
        gap: 12,
    },
    testButton: {
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4FACFE',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        paddingVertical: 12,
    },
    testButtonDisabled: {
        borderColor: '#ccc',
        backgroundColor: '#f5f5f5',
    },
    testButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4FACFE',
        marginLeft: 8,
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    helpContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginLeft: 8,
        flex: 1,
    },
});