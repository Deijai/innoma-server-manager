// app/(tabs)/profile.tsx - Página de Perfil Redesenhada
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const { theme, themePreference, setTheme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Erro', 'Nome não pode estar vazio');
      return;
    }

    try {
      setUpdating(true);
      await updateUserProfile(displayName.trim());
      setShowEditProfile(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const ProfileSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    disabled = false,
    color
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconContainer, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={disabled ? theme.colors.textSecondary : (color || theme.colors.primary)}
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, {
            color: disabled ? theme.colors.textSecondary : theme.colors.text
          }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (
        !disabled && <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const EditProfileModal = () => (
    <Modal
      visible={showEditProfile}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEditProfile(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Editar Perfil
              </Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Nome de exibição
              </Text>
              <TextInput
                style={[styles.textInput, {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Digite seu nome"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  const ThemeSelectorModal = () => (
    <Modal
      visible={showThemeSelector}
      transparent
      animationType="slide"
      onRequestClose={() => setShowThemeSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} style={styles.modal}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Escolher Tema
              </Text>
              <TouchableOpacity onPress={() => setShowThemeSelector(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {[
                { key: 'light', label: 'Claro', icon: 'sunny-outline', color: '#FF9500' },
                { key: 'dark', label: 'Escuro', icon: 'moon-outline', color: '#5856D6' },
                { key: 'system', label: 'Automático', icon: 'phone-portrait-outline', color: '#34C759' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeOption,
                    themePreference === option.key && [
                      styles.themeOptionActive,
                      { backgroundColor: option.color + '15' }
                    ]
                  ]}
                  onPress={() => {
                    setTheme(option.key as any);
                    setShowThemeSelector(false);
                  }}
                >
                  <View style={[styles.themeIconContainer, { backgroundColor: option.color + '15' }]}>
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={option.color}
                    />
                  </View>
                  <Text style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themePreference === option.key && { fontWeight: '600' }
                  ]}>
                    {option.label}
                  </Text>
                  {themePreference === option.key && (
                    <Ionicons name="checkmark-circle" size={20} color={option.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.dark ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={[styles.userHeader, { paddingTop: insets.top + 10 }]}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setDisplayName(user?.displayName || user?.email?.split('@')[0] || '');
                  setShowEditProfile(true);
                }}
              >
                <Ionicons name="create-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Configurações Gerais */}
        <ProfileSection title="Aparência">
          <SettingItem
            icon="palette-outline"
            title="Tema"
            subtitle={themePreference === 'system' ? 'Automático' :
              themePreference === 'dark' ? 'Escuro' : 'Claro'}
            onPress={() => setShowThemeSelector(true)}
            color="#FF9500"
          />
        </ProfileSection>

        {/* Notificações */}
        <ProfileSection title="Notificações">
          <SettingItem
            icon="notifications-outline"
            title="Notificações"
            subtitle="Receber alertas de servidores"
            rightComponent={
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSettings({ enabled: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="white"
              />
            }
            color="#FF3B30"
          />

          <SettingItem
            icon="server-outline"
            title="Servidor Offline"
            subtitle="Alertar quando servidor ficar offline"
            disabled={!settings.enabled}
            rightComponent={
              <Switch
                value={settings.serverOffline}
                onValueChange={(value) => updateSettings({ serverOffline: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="white"
                disabled={!settings.enabled}
              />
            }
            color="#FF9500"
          />

          <SettingItem
            icon="speedometer-outline"
            title="Alto Uso de CPU"
            subtitle={`Alertar quando CPU > ${settings.threshold.cpu}%`}
            disabled={!settings.enabled}
            rightComponent={
              <Switch
                value={settings.highCpuUsage}
                onValueChange={(value) => updateSettings({ highCpuUsage: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="white"
                disabled={!settings.enabled}
              />
            }
            color="#FFCC00"
          />
        </ProfileSection>

        {/* Suporte */}
        <ProfileSection title="Suporte">
          <SettingItem
            icon="help-circle-outline"
            title="Central de Ajuda"
            subtitle="FAQ e documentação"
            onPress={() => Alert.alert('Em breve', 'Central de ajuda em desenvolvimento')}
            color="#007AFF"
          />

          <SettingItem
            icon="bug-outline"
            title="Reportar Bug"
            subtitle="Enviar feedback sobre problemas"
            onPress={() => Alert.alert('Em breve', 'Sistema de feedback em desenvolvimento')}
            color="#FF9500"
          />

          <SettingItem
            icon="star-outline"
            title="Avaliar App"
            subtitle="Deixe sua avaliação na loja"
            onPress={() => Alert.alert('Obrigado!', 'Redirecionamento para loja em breve')}
            color="#FFCC00"
          />
        </ProfileSection>

        {/* Sobre */}
        <ProfileSection title="Sobre">
          <SettingItem
            icon="information-circle-outline"
            title="Versão do App"
            subtitle="1.0.0"
            color="#34C759"
          />

          <SettingItem
            icon="document-text-outline"
            title="Termos de Uso"
            onPress={() => Alert.alert('Termos de Uso', 'Documento em desenvolvimento')}
            color="#5856D6"
          />

          <SettingItem
            icon="shield-checkmark-outline"
            title="Política de Privacidade"
            onPress={() => Alert.alert('Privacidade', 'Documento em desenvolvimento')}
            color="#32ADE6"
          />
        </ProfileSection>

        {/* Conta */}
        <ProfileSection title="Conta">
          <SettingItem
            icon="key-outline"
            title="Alterar Senha"
            subtitle="Redefinir sua senha"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
            color="#FF9500"
          />

          <SettingItem
            icon="log-out-outline"
            title="Sair da Conta"
            subtitle="Fazer logout do aplicativo"
            onPress={handleLogout}
            rightComponent={null}
            color="#FF3B30"
          />
        </ProfileSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Server Manager v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Desenvolvido com ❤️
          </Text>
        </View>
      </ScrollView>

      <EditProfileModal />
      <ThemeSelectorModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  userHeader: {
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionContent: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeOptionActive: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});