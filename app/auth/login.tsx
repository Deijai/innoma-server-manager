// app/auth/login.tsx - Design Elegante e Moderno
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const { theme } = useTheme();
    const { signIn } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        if (!email.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, digite seu email');
            return false;
        }

        if (!password.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, digite sua senha');
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Background com gradiente sutil */}
                <LinearGradient
                    colors={theme.dark ? ['#0F0F23', '#1A1A2E'] : ['#667eea', '#764ba2']}
                    style={styles.background}
                />

                {/* Elementos decorativos minimalistas */}
                <View style={[styles.decorativeCircle1, { backgroundColor: theme.colors.primary + '10' }]} />
                <View style={[styles.decorativeCircle2, { backgroundColor: theme.colors.primary + '05' }]} />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo e Título */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.secondary]}
                                style={styles.logoBackground}
                            >
                                <Ionicons name="server" size={32} color="white" />
                            </LinearGradient>
                        </View>
                        <Text style={[styles.appTitle, { color: 'white' }]}>Server Manager</Text>
                        <Text style={styles.appSubtitle}>
                            Gerencie seus servidores com simplicidade
                        </Text>
                    </View>

                    {/* Card do Formulário */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                                Bem-vindo de volta
                            </Text>
                            <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
                                Entre na sua conta para continuar
                            </Text>
                        </View>

                        {/* Campo Email */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                Email
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.colors.background,
                                    borderColor: emailFocused ? theme.colors.primary : theme.colors.border
                                }
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={emailFocused ? theme.colors.primary : theme.colors.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.textInput, { color: theme.colors.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="seu@email.com"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    editable={true}
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        {/* Campo Senha */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                Senha
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.colors.background,
                                    borderColor: passwordFocused ? theme.colors.primary : theme.colors.border
                                }
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={passwordFocused ? theme.colors.primary : theme.colors.textSecondary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.textInput, { color: theme.colors.text }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Sua senha"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    editable={true}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Link Esqueceu Senha */}
                        <TouchableOpacity style={styles.forgotPasswordButton}>
                            <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                                Esqueceu a senha?
                            </Text>
                        </TouchableOpacity>

                        {/* Botão Entrar */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                { backgroundColor: theme.colors.primary },
                                loading && styles.loginButtonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <View style={styles.loginButtonContent}>
                                    <Text style={styles.loginButtonText}>Entrar</Text>
                                    <Ionicons name="arrow-forward" size={18} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                                ou
                            </Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                        </View>

                        {/* Botões Sociais */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: theme.colors.background }]}
                            >
                                <Ionicons name="logo-apple" size={20} color={theme.colors.text} />
                                <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                                    Apple
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: theme.colors.background }]}
                            >
                                <Ionicons name="logo-google" size={20} color="#4285F4" />
                                <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                                    Google
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Link Criar Conta */}
                    <View style={styles.registerSection}>
                        <Text style={styles.registerText}>Não tem uma conta?</Text>
                        <Link href="/auth/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.registerLink}>Criar conta</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -80,
        left: -60,
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
        justifyContent: 'center',
        minHeight: height - 100,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    appSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    formCard: {
        borderRadius: 24,
        padding: 32,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 16,
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
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
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        minHeight: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
        paddingVertical: 0,
        minHeight: 56,
        textAlignVertical: 'center',
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
    forgotPasswordButton: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 16,
        minHeight: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    loginButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 14,
        marginHorizontal: 16,
        fontWeight: '500',
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        minHeight: 48,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    registerSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    registerText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    registerLink: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
});