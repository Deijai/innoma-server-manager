// app/(tabs)/profile.tsx - Página de Perfil COMPLETA
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function Profile() {
  const { user, logout, updateUserProfile } = useAuth();
  const { theme, themePreference, setTheme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useNotifications();
  const router = useRouter();
  
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
    disabled = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, disabled && styles.settingItemDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={disabled ? theme.colors.textSecondary : theme.colors.primary} 
          style={styles.settingIcon} 
        />
        <View>
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
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditProfile(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
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
                { key: 'light', label: 'Claro', icon: 'sunny-outline' },
                { key: 'dark', label: 'Escuro', icon: 'moon-outline' },
                { key: 'system', label: 'Automático', icon: 'phone-portrait-outline' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.themeOption}
                  onPress={() => {
                    setTheme(option.key as any);
                    setShowThemeSelector(false);
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={themePreference === option.key ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.themeOptionText,
                    { 
                      color: themePreference === option.key ? theme.colors.primary : theme.colors.text,
                      fontWeight: themePreference === option.key ? '600' : '400'
                    }
                  ]}>
                    {option.label}
                  </Text>
                  {themePreference === option.key && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
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
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0)?.toUpperCase() || 
               user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setDisplayName(user?.displayName || user?.email?.split('@')[0] || '');
              setShowEditProfile(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Configurações Gerais */}
        <ProfileSection title="Aparência">
          <SettingItem
            icon="palette-outline"
            title="Tema"
            subtitle={themePreference === 'system' ? 'Automático' : 
                     themePreference === 'dark' ? 'Escuro' : 'Claro'}
            onPress={() => setShowThemeSelector(true)}
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
          />
        </ProfileSection>

        {/* Suporte */}
        <ProfileSection title="Suporte">
          <SettingItem
            icon="help-circle-outline"
            title="Central de Ajuda"
            subtitle="FAQ e documentação"
            onPress={() => Alert.alert('Em breve', 'Central de ajuda em desenvolvimento')}
          />
          
          <SettingItem
            icon="bug-outline"
            title="Reportar Bug"
            subtitle="Enviar feedback sobre problemas"
            onPress={() => Alert.alert('Em breve', 'Sistema de feedback em desenvolvimento')}
          />
          
          <SettingItem
            icon="star-outline"
            title="Avaliar App"
            subtitle="Deixe sua avaliação na loja"
            onPress={() => Alert.alert('Obrigado!', 'Redirecionamento para loja em breve')}
          />
        </ProfileSection>

        {/* Sobre */}
        <ProfileSection title="Sobre">
          <SettingItem
            icon="information-circle-outline"
            title="Versão do App"
            subtitle="1.0.0"
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Termos de Uso"
            onPress={() => Alert.alert('Termos de Uso', 'Documento em desenvolvimento')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Política de Privacidade"
            onPress={() => Alert.alert('Privacidade', 'Documento em desenvolvimento')}
          />
        </ProfileSection>

        {/* Conta */}
        <ProfileSection title="Conta">
          <SettingItem
            icon="key-outline"
            title="Alterar Senha"
            subtitle="Redefinir sua senha"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          />
          
          <SettingItem
            icon="log-out-outline"
            title="Sair da Conta"
            subtitle="Fazer logout do aplicativo"
            onPress={handleLogout}
            rightComponent={null}
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 40,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    margin: 20,
    borderRadius: 16,
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4FACFE',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});