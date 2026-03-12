import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCkq2q4kxUyY-Cj2YTNXweI7ckzIx7eots',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'clex-in.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'clex-in',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'clex-in.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1050016400675',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1050016400675:web:32eaedd53bc82d2663f896',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-P5RC17ZCY2',
};

const requiredConfigKeys = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredConfigKeys.every(Boolean);

export const firebaseApp = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = auth ? new GoogleAuthProvider() : null;

if (googleProvider) {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

let persistencePromise: Promise<void> | null = null;

export function ensureAuthPersistence(): Promise<void> {
  if (!auth) return Promise.resolve();
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence);
  }
  return persistencePromise;
}

export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth?.currentUser) return null;
  await ensureAuthPersistence();
  return auth.currentUser.getIdToken(forceRefresh);
}
