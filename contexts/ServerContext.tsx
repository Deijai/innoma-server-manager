// contexts/ServerContext.tsx - CORRIGIDO PARA FIREBASE
import { ref, remove, set } from 'firebase/database';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { COLLECTIONS, db, realtimeDb, RTDB_PATHS } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

// Tipos básicos (simplificados)
interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  description?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ServerStatus {
  serverId: string;
  isOnline: boolean;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  lastCheck: Date;
  services: any[];
}

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
      return { ...state, servers: [action.payload, ...state.servers] };
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
    }
  }, [user]);

  const loadServers = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const q = query(
        collection(db, COLLECTIONS.SERVERS),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const servers: Server[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const server: Server = {
          id: doc.id,
          name: data.name,
          host: data.host,
          port: data.port,
          username: data.username,
          description: data.description || '',
          tags: data.tags || [],
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
        servers.push(server);
      });

      dispatch({ type: 'SET_SERVERS', payload: servers });
      console.log(`Carregados ${servers.length} servidores`);

    } catch (error) {
      console.error('Erro ao carregar servidores:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar servidores' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addServer = async (serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const docData = {
        ...serverData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.SERVERS), docData);

      const newServer: Server = {
        id: docRef.id,
        ...serverData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_SERVER', payload: newServer });

      // Testar status do servidor
      setTimeout(() => {
        getServerStatus(newServer.id);
      }, 1000);

      console.log('Servidor adicionado:', newServer.name);

    } catch (error) {
      console.error('Erro ao adicionar servidor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao adicionar servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateServer = async (server: Server) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const serverRef = doc(db, COLLECTIONS.SERVERS, server.id);
      const updateData = {
        name: server.name,
        host: server.host,
        port: server.port,
        username: server.username,
        description: server.description,
        tags: server.tags,
        isActive: server.isActive,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(serverRef, updateData);

      const updatedServer = {
        ...server,
        updatedAt: new Date(),
      };

      dispatch({ type: 'UPDATE_SERVER', payload: updatedServer });
      console.log('Servidor atualizado:', server.name);

    } catch (error) {
      console.error('Erro ao atualizar servidor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteServer = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Remover do Firestore
      await deleteDoc(doc(db, COLLECTIONS.SERVERS, id));

      // Remover status do Realtime Database
      const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${id}`);
      await remove(statusRef);

      dispatch({ type: 'DELETE_SERVER', payload: id });
      console.log('Servidor deletado:', id);

    } catch (error) {
      console.error('Erro ao deletar servidor:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao deletar servidor' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getServerStatus = async (id: string) => {
    try {
      const server = state.servers.find(s => s.id === id);
      if (!server) return;

      // Simular obtenção de status (substituir por chamada real à API)
      const mockStatus: ServerStatus = {
        serverId: id,
        isOnline: Math.random() > 0.3, // 70% chance de estar online
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        uptime: Math.floor(Math.random() * 1000000),
        lastCheck: new Date(),
        services: []
      };

      // Salvar no Realtime Database
      const statusRef = ref(realtimeDb, `${RTDB_PATHS.SERVER_STATUS}/${id}`);
      await set(statusRef, {
        ...mockStatus,
        lastCheck: mockStatus.lastCheck.toISOString()
      });

      dispatch({
        type: 'SET_SERVER_STATUS',
        payload: { serverId: id, status: mockStatus }
      });

      // Verificar mudanças de status e enviar notificações
      const previousStatus = state.serverStatuses[id];

      if (previousStatus && previousStatus.isOnline !== mockStatus.isOnline) {
        await sendLocalNotification(
          mockStatus.isOnline ? 'Servidor Online' : 'Servidor Offline',
          `${server.name} está ${mockStatus.isOnline ? 'online' : 'offline'} agora`,
          { serverId: id, type: 'status_change' }
        );
      }

    } catch (error) {
      console.error('Erro ao obter status do servidor:', error);

      // Status offline em caso de erro
      const offlineStatus: ServerStatus = {
        serverId: id,
        isOnline: false,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0,
        lastCheck: new Date(),
        services: []
      };

      dispatch({
        type: 'SET_SERVER_STATUS',
        payload: { serverId: id, status: offlineStatus }
      });
    }
  };

  const refreshAllStatuses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const promises = state.servers.map(server => getServerStatus(server.id));
      await Promise.all(promises);

    } catch (error) {
      console.error('Erro ao atualizar status dos servidores:', error);
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
    throw new Error('useServers deve ser usado dentro de ServerProvider');
  }
  return context;
}