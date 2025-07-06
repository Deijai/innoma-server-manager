// app/auth/register.tsx - Tela de Registro Completa
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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

    const { signUp } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos');
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
            await signUp(email, password);
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
            let errorMessage = 'Erro ao criar conta';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email já está sendo usado';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email inválido';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Senha muito fraca';
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Background Gradient */}
                <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.background}
                />

                {/* Floating orbs for decoration */}
                <View style={styles.orb1} />
                <View style={styles.orb2} />
                <View style={styles.orb3} />

                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <View style={styles.backButtonBackground}>
                                <Ionicons name="arrow-back" size={20} color="#4facfe" />
                            </View>
                        </TouchableOpacity>

                        {/* Logo Section */}
                        <View style={styles.logoSection}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#ffffff', '#f8f9fa']}
                                    style={styles.logoBackground}
                                >
                                    <Text style={styles.logoIcon}>🖥️</Text>
                                </LinearGradient>
                            </View>
                            <Text style={styles.appTitle}>Criar Conta</Text>
                            <Text style={styles.appSubtitle}>Junte-se ao Server Manager hoje</Text>
                        </View>

                        {/* Register Form */}
                        <BlurView intensity={20} style={styles.formContainer}>
                            <View style={styles.formContent}>
                                <Text style={styles.formTitle}>Vamos começar</Text>
                                <Text style={styles.formSubtitle}>Crie sua conta em poucos segundos</Text>

                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        emailFocused && styles.inputContainerFocused
                                    ]}>
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={emailFocused ? "#4facfe" : "#8E8E93"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.textInput}
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="seu@email.com"
                                            placeholderTextColor="#8E8E93"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                        />
                                    </View>
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Senha</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        passwordFocused && styles.inputContainerFocused
                                    ]}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={passwordFocused ? "#4facfe" : "#8E8E93"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.textInput, styles.passwordInput]}
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Mínimo 6 caracteres"
                                            placeholderTextColor="#8E8E93"
                                            secureTextEntry={!showPassword}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color="#8E8E93"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Confirmar Senha</Text>
                                    <View style={[
                                        styles.inputContainer,
                                        confirmPasswordFocused && styles.inputContainerFocused
                                    ]}>
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={confirmPasswordFocused ? "#4facfe" : "#8E8E93"}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.textInput, styles.passwordInput]}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Repita sua senha"
                                            placeholderTextColor="#8E8E93"
                                            secureTextEntry={!showConfirmPassword}
                                            onFocus={() => setConfirmPasswordFocused(true)}
                                            onBlur={() => setConfirmPasswordFocused(false)}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <Ionicons
                                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color="#8E8E93"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Terms Checkbox */}
                                <TouchableOpacity
                                    style={styles.termsContainer}
                                    onPress={() => setAcceptTerms(!acceptTerms)}
                                >
                                    <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                        {acceptTerms && (
                                            <Ionicons name="checkmark" size={14} color="white" />
                                        )}
                                    </View>
                                    <Text style={styles.termsText}>
                                        Li e aceito os{' '}
                                        <Text style={styles.termsLink}>Termos de Uso</Text>
                                        {' '}e{' '}
                                        <Text style={styles.termsLink}>Política de Privacidade</Text>
                                    </Text>
                                </TouchableOpacity>

                                {/* Register Button */}
                                <TouchableOpacity
                                    style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#ccc', '#aaa'] : ['#4facfe', '#00f2fe']}
                                        style={styles.registerButtonGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.registerButtonText}>Criar Conta</Text>
                                                <Ionicons name="person-add" size={18} color="white" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Security Info */}
                                <View style={styles.securityInfo}>
                                    <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                                    <Text style={styles.securityText}>
                                        Seus dados estão protegidos com criptografia de ponta
                                    </Text>
                                </View>
                            </View>
                        </BlurView>

                        {/* Login Link */}
                        <View style={styles.loginSection}>
                            <Text style={styles.loginText}>Já tem uma conta?</Text>
                            <Link href="/auth/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.loginLink}>Fazer login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    orb1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    orb2: {
        position: 'absolute',
        bottom: 150,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    orb3: {
        position: 'absolute',
        top: height * 0.4,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 50,
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoBackground: {
        width: 70,
        height: 70,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    logoIcon: {
        fontSize: 28,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 6,
        textAlign: 'center',
    },
    appSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    formContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    formContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 24,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        height: 50,
    },
    inputContainerFocused: {
        backgroundColor: 'white',
        borderColor: '#4facfe',
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1D1D1F',
        fontWeight: '400',
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        padding: 4,
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
        borderColor: '#D1D1D6',
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4facfe',
        borderColor: '#4facfe',
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    termsLink: {
        color: '#4facfe',
        fontWeight: '500',
    },
    registerButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    registerButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    registerButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginRight: 8,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FFF4',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C6F6D5',
    },
    securityText: {
        fontSize: 12,
        color: '#38A169',
        marginLeft: 6,
        fontWeight: '500',
    },
    loginSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        marginRight: 4,
    },
    loginLink: {
        fontSize: 15,
        color: 'white',
        fontWeight: '600',
    },
});