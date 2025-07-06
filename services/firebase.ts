// services/firebase.ts - Configuração Firebase Simples
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - SUBSTITUA pelos seus valores
const firebaseConfig = {
    apiKey: "AIzaSyBuU9y00_HU1yqSKSku_LbDYQs2HCBk7n8",
    authDomain: "innoma-server-manager.firebaseapp.com",
    projectId: "innoma-server-manager",
    storageBucket: "innoma-server-manager.firebasestorage.app",
    messagingSenderId: "963859832951",
    appId: "1:963859832951:web:9c0bceb24374566073a672",
    measurementId: "G-0GBL0THNTN"
};


// Inicializar Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

// Constantes para collections
export const COLLECTIONS = {
    USERS: 'users',
    SERVERS: 'servers',
    SERVER_STATUS: 'serverStatus',
    COMMANDS: 'commands',
    NOTIFICATIONS: 'notifications'
} as const;

export const RTDB_PATHS = {
    SERVER_STATUS: 'serverStatus',
    ONLINE_SERVERS: 'onlineServers',
    SYSTEM_STATS: 'systemStats'
} as const;

export { app };
