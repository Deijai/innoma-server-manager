// contexts/AuthContext.tsx - CORRIGIDO PARA FIREBASE
import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login realizado com sucesso:', userCredential.user.email);
        } catch (error: any) {
            console.error('Erro no login:', error);

            // Tratar erros específicos do Firebase
            let errorMessage = 'Erro ao fazer login';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Senha incorreta';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet';
                    break;
                default:
                    errorMessage = error.message || 'Erro desconhecido';
            }

            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        if (password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }

        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Definir nome de exibição padrão
            const displayName = email.split('@')[0];
            await updateProfile(userCredential.user, { displayName });

            console.log('Conta criada com sucesso:', userCredential.user.email);
        } catch (error: any) {
            console.error('Erro ao criar conta:', error);

            let errorMessage = 'Erro ao criar conta';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email já está sendo usado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Senha muito fraca';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet';
                    break;
                default:
                    errorMessage = error.message || 'Erro desconhecido';
            }

            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            console.log('Logout realizado com sucesso');
        } catch (error: any) {
            console.error('Erro no logout:', error);
            Alert.alert('Erro', 'Erro ao fazer logout');
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        if (!email) {
            throw new Error('Email é obrigatório');
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'Email Enviado',
                'Verifique sua caixa de entrada para redefinir sua senha.'
            );
        } catch (error: any) {
            console.error('Erro ao resetar senha:', error);

            let errorMessage = 'Erro ao enviar email de recuperação';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email não encontrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet';
                    break;
                default:
                    errorMessage = error.message || 'Erro desconhecido';
            }

            Alert.alert('Erro', errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateUserProfile = async (displayName: string) => {
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        if (!displayName.trim()) {
            throw new Error('Nome não pode estar vazio');
        }

        try {
            await updateProfile(user, { displayName: displayName.trim() });

            // Atualizar estado local
            setUser({
                ...user,
                displayName: displayName.trim()
            });

            console.log('Perfil atualizado com sucesso');
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            throw new Error('Erro ao atualizar perfil');
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        resetPassword,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
}