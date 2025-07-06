// contexts/AuthContext.tsx - Contexto de Autenticação COMPLETO
import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    reload,
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
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Set default display name
            if (result.user) {
                await updateProfile(result.user, {
                    displayName: email.split('@')[0],
                });
                await reload(result.user);
            }

            return result;
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
        } catch (error: any) {
            console.error('Logout error:', error);
            Alert.alert('Erro', 'Erro ao fazer logout');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'Email Enviado',
                'Verifique sua caixa de entrada para redefinir sua senha.'
            );
        } catch (error: any) {
            console.error('Reset password error:', error);
            let errorMessage = 'Erro ao enviar email de recuperação';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Email não encontrado';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email inválido';
            }

            Alert.alert('Erro', errorMessage);
            throw error;
        }
    };

    const updateUserProfile = async (displayName: string) => {
        try {
            if (user) {
                await updateProfile(user, { displayName });
                await reload(user);
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            if (user) {
                await reload(user);
            }
        } catch (error: any) {
            console.error('Refresh user error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            logout,
            resetPassword,
            updateUserProfile,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}