import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Unsubscribe,
  type User,
} from 'firebase/auth';

import { auth, ensureAuthPersistence, googleProvider, isFirebaseConfigured } from '../lib/firebase';

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatFirebaseError(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String(error.code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'The email or password is incorrect.';
      case 'auth/email-already-in-use':
        return 'That email address already has an account.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before authentication completed.';
      case 'auth/too-many-requests':
        return 'Too many attempts were made. Please try again in a moment.';
      default:
        break;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Authentication failed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setAuthError('Firebase client configuration is missing for the dashboard.');
      return;
    }

    let unsubscribe: Unsubscribe = () => undefined;
    const firebaseAuth = auth;

    ensureAuthPersistence()
      .then(() => {
        if (!firebaseAuth) return;
        unsubscribe = onIdTokenChanged(firebaseAuth, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
          setAuthError(null);
        });
      })
      .catch((error) => {
        setAuthError(formatFirebaseError(error));
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isFirebaseConfigured,
    loading,
    user,
    authError,
    async signInWithGoogle() {
      if (!auth || !googleProvider) throw new Error('Firebase auth is not configured.');
      setAuthError(null);
      await ensureAuthPersistence();
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        const message = formatFirebaseError(error);
        setAuthError(message);
        throw new Error(message);
      }
    },
    async signInWithEmail(email: string, password: string) {
      if (!auth) throw new Error('Firebase auth is not configured.');
      setAuthError(null);
      await ensureAuthPersistence();
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        const message = formatFirebaseError(error);
        setAuthError(message);
        throw new Error(message);
      }
    },
    async signUpWithEmail(name: string, email: string, password: string) {
      if (!auth) throw new Error('Firebase auth is not configured.');
      setAuthError(null);
      await ensureAuthPersistence();
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
      } catch (error) {
        const message = formatFirebaseError(error);
        setAuthError(message);
        throw new Error(message);
      }
    },
    async resetPassword(email: string) {
      if (!auth) throw new Error('Firebase auth is not configured.');
      setAuthError(null);
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error) {
        const message = formatFirebaseError(error);
        setAuthError(message);
        throw new Error(message);
      }
    },
    async signOutUser() {
      if (!auth) return;
      setAuthError(null);
      await signOut(auth);
    },
  }), [authError, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return value;
}
