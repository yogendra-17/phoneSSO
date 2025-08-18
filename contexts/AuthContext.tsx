import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, GoogleSignin, FirebaseAuthTypes, authModule } from '../config/firebase';
import { router } from 'expo-router';
import { Platform } from 'react-native';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const result = await auth.signInWithEmailAndPassword(email, password);
      console.log('Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign up with:', email);
      const result = await auth.createUserWithEmailAndPassword(email, password);
      console.log('Sign up successful:', result.user.email);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      // Create a Google credential with the token
      const googleCredential = authModule.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth.signInWithCredential(googleCredential);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      await GoogleSignin.signOut();
      router.replace('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
