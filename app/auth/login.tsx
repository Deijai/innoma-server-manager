// app/auth/login.tsx - Design Original com Teclado Corrigido
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

const { width, height } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

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
            let errorMessage = 'Erro ao fazer login';

            if (error.message) {
                errorMessage = error.message;
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
                    colors={['#667eea', '#764ba2']}
                    style={styles.background}
                />

                {/* Floating orbs for decoration */}
                <View style={styles.orb1} />
                <View style={styles.orb2} />
                <View style={styles.orb3} />

                {/* SCROLL VIEW SEM KEYBOARD AVOIDING VIEW */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
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
                        <Text style={styles.appTitle}>Server Manager</Text>
                        <Text style={styles.appSubtitle}>Gerencie seus servidores com facilidade</Text>
                    </View>

                    {/* Login Form */}
                    <BlurView intensity={20} style={styles.formContainer}>
                        <View style={styles.formContent}>
                            <Text style={styles.formTitle}>Bem-vindo de volta</Text>
                            <Text style={styles.formSubtitle}>Entre na sua conta para continuar</Text>

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
                                        color={emailFocused ? "#667eea" : "#8E8E93"}
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
                                        editable={!loading}
                                        returnKeyType="next"
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
                                        color={passwordFocused ? "#667eea" : "#8E8E93"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.textInput, styles.passwordInput]}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Sua senha"
                                        placeholderTextColor="#8E8E93"
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        editable={!loading}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                                            size={20}
                                            color="#8E8E93"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotPasswordButton}>
                                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={loading ? ['#ccc', '#aaa'] : ['#667eea', '#764ba2']}
                                    style={styles.loginButtonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.loginButtonText}>Entrar</Text>
                                            <Ionicons name="arrow-forward" size={18} color="white" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Login Buttons */}
                            <View style={styles.socialButtons}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-apple" size={20} color="#000" />
                                    <Text style={styles.socialButtonText}>Apple</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>

                    {/* Register Link */}
                    <View style={styles.registerSection}>
                        <Text style={styles.registerText}>Não tem uma conta?</Text>
                        <Link href="/auth/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.registerLink}>Criar conta</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Extra padding for keyboard */}
                    <View style={{ height: 100 }} />
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
        bottom: 100,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    orb3: {
        position: 'absolute',
        top: height * 0.3,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    logoIcon: {
        fontSize: 32,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
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
        fontSize: 24,
        fontWeight: '700',
        color: '#1D1D1F',
        textAlign: 'center',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: 20,
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
        minHeight: 50,
    },
    inputContainerFocused: {
        backgroundColor: 'white',
        borderColor: '#667eea',
        shadowColor: '#667eea',
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
        paddingVertical: 15,
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPasswordButton: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 15,
        color: '#667eea',
        fontWeight: '500',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginRight: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5EA',
    },
    dividerText: {
        fontSize: 14,
        color: '#8E8E93',
        marginHorizontal: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1D1D1F',
        marginLeft: 8,
    },
    registerSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        marginRight: 4,
    },
    registerLink: {
        fontSize: 15,
        color: 'white',
        fontWeight: '600',
    },
});