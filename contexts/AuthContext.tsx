import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth, hasValidConfig } from '../config/firebase';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for testing UI
const createDemoUser = (email: string): Partial<User> => ({
  uid: 'demo-user-' + Date.now(),
  email: email,
  emailVerified: true,
  displayName: email.split('@')[0],
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({ token: 'demo-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {} }),
  reload: async () => {},
  toJSON: () => ({}),
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !hasValidConfig;

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const hasGoogleConfig = !!(googleClientId && googleClientId !== 'YOUR_API_KEY');
  
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId || 'dummy-client-id-for-demo',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'myapp', path: 'auth' }),
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    }
  );

  useEffect(() => {
    if (isDemoMode || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  useEffect(() => {
    if (response?.type === 'success' && !isDemoMode && auth) {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(authentication.idToken);
        signInWithCredential(auth, credential).catch((error) => {
          console.error('Google sign-in error:', error);
        });
      }
    }
  }, [response, isDemoMode]);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(createDemoUser(email) as User);
      return;
    }
    if (!auth) throw new Error("Firebase not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(createDemoUser(email) as User);
      return;
    }
    if (!auth) throw new Error("Firebase not initialized");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(createDemoUser('demo@google.com') as User);
      return;
    }

    if (!hasGoogleConfig) {
      throw new Error('Google Client ID not configured');
    }
    await promptAsync();
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      router.replace('/auth');
      return;
    }
    if (!auth) throw new Error("Firebase not initialized");
    await firebaseSignOut(auth);
    router.replace('/auth');
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
