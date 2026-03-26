import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  sendEmailVerification, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import { getFirestore, getDocFromServer, doc, initializeFirestore, FirestoreError, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = initializeApp(firebaseConfig);

// Initialize Analytics if supported
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firestore
console.log('Initializing Firestore with Project ID:', firebaseConfig.projectId, 'and Database ID:', firebaseConfig.firestoreDatabaseId);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
console.log('Firestore DB instance:', db);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();

export const logout = () => signOut(auth);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, deleteUser };

export const verifyEmail = (user?: User | null) => {
  const currentUser = user || auth.currentUser;
  if (currentUser) {
    if (!currentUser.email) {
      return Promise.reject('Este usuário não possui um endereço de e-mail associado.');
    }
    return sendEmailVerification(currentUser);
  }
  return Promise.reject('Nenhum usuário logado');
};

// Test connection
async function testConnection() {
  const path = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('permission') || error.message.includes('insufficient'))) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    console.error("Firestore Error:", error);
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore'))) {
      console.error("ERRO DE CONEXÃO: O Firestore não pôde ser alcançado.");
      console.error("Certifique-se de que:");
      console.error("1. O banco de dados Firestore foi criado no console do Firebase.");
      console.error("2. O ID do projeto no firebase-applet-config.json está correto.");
      console.error("3. A chave de API tem permissões para acessar o Firestore.");
    }
  }
}
testConnection();
