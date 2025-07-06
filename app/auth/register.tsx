// app/auth/register.tsx - Design Elegante e Moderno
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Focus states
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

    // Refs para os inputs
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const { theme } = useTheme();
    const { signUp } = useAuth();
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

        if (!confirmPassword.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, confirme sua senha');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Email inválido', 'Por favor, digite um email válido');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (!acceptTerms) {
            Alert.alert('Termos de uso', 'Você deve aceitar os termos de uso para continuar');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await signUp(email.trim(), password);
            Alert.alert(
                'Conta criada! 🎉',
                'Bem-vindo ao Server Manager! Sua conta foi criada com sucesso.',
                [{
                    text: 'Continuar',
                    onPress: () => router.replace('/(tabs)/dashboard'),
                    style: 'default'
                }]
            );
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    // Função para focar no próximo campo
    const focusNextField = (nextRef: React.RefObject<TextInput>) => {
        nextRef.current?.focus();
    };

    return (
        <>
            <StatusBar barStyle="light-content" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    {/* Background com gradiente sutil */}
                    <LinearGradient
                        colors={theme.dark ? ['#0F0F23', '#1A1A2E'] : ['#4facfe', '#00f2fe']}
                        style={styles.background}
                    />

                    {/* Elementos decorativos minimalistas */}
                    <View style={[styles.decorativeCircle1, { backgroundColor: theme.colors.primary + '10' }]} />
                    <View style={[styles.decorativeCircle2, { backgroundColor: theme.colors.primary + '05' }]} />

                    <KeyboardAvoidingView
                        style={styles.keyboardView}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={0}
                    >
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Botão Voltar */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <View style={[styles.backButtonBackground, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                                    <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                                </View>
                            </TouchableOpacity>

                            {/* Logo e Título */}
                            <View style={styles.logoSection}>
                                <View style={styles.logoContainer}>
                                    <LinearGradient
                                        colors={[theme.colors.primary, theme.colors.secondary]}
                                        style={styles.logoBackground}
                                    >
                                        <Ionicons name="person-add" size={28} color="white" />
                                    </LinearGradient>
                                </View>
                                <Text style={[styles.appTitle, { color: 'white' }]}>Criar Conta</Text>
                                <Text style={styles.appSubtitle}>
                                    Junte-se ao Server Manager hoje
                                </Text>
                            </View>

                            {/* Card do Formulário */}
                            <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.formHeader}>
                                    <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                                        Vamos começar
                                    </Text>
                                    <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
                                        Crie sua conta em poucos segundos
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
                                            ref={emailRef}
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
                                            onSubmitEditing={() => focusNextField(passwordRef)}
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
                                            ref={passwordRef}
                                            style={[styles.textInput, { color: theme.colors.text }]}
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Mínimo 6 caracteres"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            secureTextEntry={!showPassword}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            editable={true}
                                            returnKeyType="next"
                                            onSubmitEditing={() => focusNextField(confirmPasswordRef)}
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

                                {/* Campo Confirmar Senha */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                        Confirmar Senha
                                    </Text>
                                    <View style={[
                                        styles.inputContainer,
                                        {
                                            backgroundColor: theme.colors.background,
                                            borderColor: confirmPasswordFocused ? theme.colors.primary : theme.colors.border
                                        }
                                    ]}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={confirmPasswordFocused ? theme.colors.primary : theme.colors.textSecondary}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            ref={confirmPasswordRef}
                                            style={[styles.textInput, { color: theme.colors.text }]}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Repita sua senha"
                                            placeholderTextColor={theme.colors.textSecondary}
                                            secureTextEntry={!showConfirmPassword}
                                            onFocus={() => setConfirmPasswordFocused(true)}
                                            onBlur={() => setConfirmPasswordFocused(false)}
                                            editable={true}
                                            returnKeyType="done"
                                            onSubmitEditing={handleRegister}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={loading}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color={theme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Checkbox Termos */}
                                <TouchableOpacity
                                    style={styles.termsContainer}
                                    onPress={() => setAcceptTerms(!acceptTerms)}
                                    disabled={loading}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: theme.colors.border },
                                        acceptTerms && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}>
                                        {acceptTerms && (
                                            <Ionicons name="checkmark" size={14} color="white" />
                                        )}
                                    </View>
                                    <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                                        Li e aceito os{' '}
                                        <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                                            Termos de Uso
                                        </Text>
                                        {' '}e{' '}
                                        <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                                            Política de Privacidade
                                        </Text>
                                    </Text>
                                </TouchableOpacity>

                                {/* Botão Criar Conta */}
                                <TouchableOpacity
                                    style={[
                                        styles.registerButton,
                                        { backgroundColor: theme.colors.primary },
                                        loading && styles.registerButtonDisabled
                                    ]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <View style={styles.registerButtonContent}>
                                            <Text style={styles.registerButtonText}>Criar Conta</Text>
                                            <Ionicons name="person-add" size={18} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Info de Segurança */}
                                <View style={[styles.securityInfo, { backgroundColor: theme.colors.success + '15' }]}>
                                    <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
                                    <Text style={[styles.securityText, { color: theme.colors.success }]}>
                                        Seus dados estão protegidos com criptografia
                                    </Text>
                                </View>
                            </View>

                            {/* Link Login */}
                            <View style={styles.loginSection}>
                                <Text style={styles.loginText}>Já tem uma conta?</Text>
                                <Link href="/auth/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.loginLink}>Fazer login</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                            {/* Espaço extra para teclado */}
                            <View style={styles.extraSpace} />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
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
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
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
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    logoBackground: {
        width: 70,
        height: 70,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
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
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 16,
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 28,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    formSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
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
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    termsLink: {
        fontWeight: '600',
    },
    registerButton: {
        borderRadius: 16,
        minHeight: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4FACFE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    registerButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    registerButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        letterSpacing: 0.3,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    securityText: {
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    loginText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    loginLink: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
    extraSpace: {
        height: Platform.OS === 'ios' ? 100 : 80,
    },
});