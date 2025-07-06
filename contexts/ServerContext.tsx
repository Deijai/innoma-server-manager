// contexts/ServerContext.tsx - Contexto de Servidores COMPLETO
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Server, ServerStatus } from '../services/types';
import { sshService } from '../services/sshService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServerState {
  servers: Server[];
  serverStatuses: Record<string, ServerStatus>;
  selectedServer: Server | null;
  loading: boolean;
  error: string | null;
}

type ServerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SERVERS'; payload: Server[] }
  | { type: 'ADD_SERVER'; payload: Server }
  | { type: 'UPDATE_SERVER'; payload: Server }
  | { type: 'DELETE_SERVER'; payload: string }
  | { type: 'SET_SERVER_STATUS'; payload: { serverId: string; status: ServerStatus } }
  | { type: 'SET_SELECTED_SERVER'; payload: Server | null };

function serverReducer(state: ServerState, action: ServerAction): ServerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SERVERS':
      return { ...state, servers: action.payload };
    case 'ADD_SERVER':
      return { ...state, servers: [...state.servers, action.payload] };
    case 'UPDATE_SERVER':
      return {
        ...state,
        servers: state.servers.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    case 'DELETE_SERVER':
      return {
        ...state,
        servers: state.servers.filter(s => s.id !== action.payload),
        serverStatuses: Object.fromEntries(
          Object.entries(state.serverStatuses).filter(([id]) => id !== action.payload)
        )
      };
    case 'SET_SERVER_STATUS':
      return {
        ...state,
        serverStatuses: {
          ...state.serverStatuses,
          [action.payload.serverId]: action.payload.status
        }
      };
    case 'SET_SELECTED_SERVER':
      return { ...state, selectedServer: action.payload };
    default:
      return state;
  }
}

const initialState: ServerState = {
  servers: [],
  serverStatuses: {},
  selectedServer: null,
  loading: false,
  error: null,
};

interface ServerContextType {
  state: ServerState;
  dispatch: React.Dispatch<ServerAction>;
  addServer: (server: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateServer: (server: Server) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  getServerStatus: (id: string) => Promise<void>;
  refreshAllStatuses: () => Promise<void>;
  loadServers: () => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(serverReducer, initialState);
  const { user } = useAuth();
  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    if (user) {
      loadServers();
      
      // Add some example servers for demo
      setTimeout(() => {
        addExampleServers();
      }, 1000);
    }
  }, [user]);

  const addExampleServers = async () => {
    if (state.servers.length === 0) {
      const exampleServers = [
        {
          name: 'Servidor de Produção',
          host: '192.168.1.100',
          port: 22,
          username: 'root',
          password: 'encrypted_password_here',
          description: 'Servidor principal de produção',
          tags: ['production', 'web'],
          isActive: true,
        },
        {
          name: 'Servidor de Desenvolvimento',
          host: '192.168.1.101',
          port: 22,
          username: 'dev',
          password: 'encrypted_password_here',
          description: 'Servidor para desenvolvimento e testes',
          tags: ['development', 'testing'],
          isActive: true,
        },
        {
          name: 'Banco de Dados',
          host: '192.168.1.102',
          port: 22,
          username: 'dbadmin',
          password: 'encrypted_password_here',
          description: 'Servidor de banco de dados MySQL',
          tags: ['database', 'mysql'],
          isActive: true,
        },
      ];

      for (const serverData of exampleServers) {
        await addServer(serverData);
      }
    }
  };

  const loadServers = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const stored = await AsyncStorage.getItem(`servers_${user?.uid}`);
      if (stored) {
        const servers = JSON.parse(stored).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        dispatch({ type: 'SET_SERVERS', payload: servers });
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar servidores' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveServers = async (servers: Server[]) => {
    try {
      await AsyncStorage.setItem(`servers_${user?.uid}`, JSON.stringify(servers));
    } catch (error) {
      console.error('Error saving servers:', error);
    }
  };

  const addServer = async (serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newServer: Server = {
        ...serverData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_SERVER', payload: newServer });
      
      const updatedServers = [...state.servers, newServer];
      await saveServers(updatedServers);
      
      // Test connection after adding
      setTimeout(() => {
        getServerStatus(newServer.id);
      }, 500);
      
    } catch (error) {
      console.error('Error adding server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateServer = async (server: Server) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedServer = {
        ...server,
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'UPDATE_SERVER', payload: updatedServer });
      
      const updatedServers = state.servers.map(s => 
        s.id === server.id ? updatedServer : s
      );
      await saveServers(updatedServers);
      
    } catch (error) {
      console.error('Error updating server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteServer = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'DELETE_SERVER', payload: id });
      
      const updatedServers = state.servers.filter(s => s.id !== id);
      await saveServers(updatedServers);
      
    } catch (error) {
      console.error('Error deleting server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao excluir servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getServerStatus = async (id: string) => {
    try {
      const server = state.servers.find(s => s.id === id);
      if (!server) return;

      const credentials = {
        host: server.host,
        port: server.port,
        username: server.username,
        password: server.password, // In real app, decrypt this
        privateKey: server.privateKey,
      };

      const status = await sshService.getServerStatus(credentials);
      status.serverId = id;

      // Check for status changes and send notifications
      const previousStatus = state.serverStatuses[id];
      
      if (previousStatus && previousStatus.isOnline !== status.isOnline) {
        await sendLocalNotification(
          status.isOnline ? 'Servidor Online' : 'Servidor Offline',
          `${server.name} está ${status.isOnline ? 'online' : 'offline'} agora`,
          { serverId: id, type: 'status_change' }
        );
      }

      // Check for high usage alerts
      if (status.isOnline) {
        if (status.cpuUsage > 90) {
          await sendLocalNotification(
            'Alto Uso de CPU',
            `${server.name}: CPU em ${status.cpuUsage.toFixed(1)}%`,
            { serverId: id, type: 'high_cpu' }
          );
        }

        if (status.memoryUsage > 90) {
          await sendLocalNotification(
            'Alto Uso de Memória',
            `${server.name}: Memória em ${status.memoryUsage.toFixed(1)}%`,
            { serverId: id, type: 'high_memory' }
          );
        }

        if (status.diskUsage > 90) {
          await sendLocalNotification(
            'Disco Quase Cheio',
            `${server.name}: Disco em ${status.diskUsage.toFixed(1)}%`,
            { serverId: id, type: 'disk_space' }
          );
        }
      }

      dispatch({ type: 'SET_SERVER_STATUS', payload: { serverId: id, status } });
      
    } catch (error) {
      console.error(`Error getting status for server ${id}:`, error);
      
      // Set server as offline on error
      const offlineStatus: ServerStatus = {
        serverId: id,
        isOnline: false,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0,
        lastCheck: new Date(),
        services: [],
        runningServices: 0,
      };
      
      dispatch({ type: 'SET_SERVER_STATUS', payload: { serverId: id, status: offlineStatus } });
    }
  };

  const refreshAllStatuses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const promises = state.servers.map(server => getServerStatus(server.id));
      await Promise.all(promises);
      
    } catch (error) {
      console.error('Error refreshing all statuses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar status dos servidores' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <ServerContext.Provider value={{
      state,
      dispatch,
      addServer,
      updateServer,
      deleteServer,
      getServerStatus,
      refreshAllStatuses,
      loadServers,
    }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServers() {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServers must be used within ServerProvider');
  }
  return context;
}