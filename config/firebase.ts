import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration with fallback values for development
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Validate required Firebase configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  console.error('❌ Missing required Firebase configuration:', missingFields);
  console.error('Please check your environment variables or .env file');
}

// Log configuration for debugging (without exposing full API key)
console.log('Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT_SET',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'NOT_SET'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
let auth: any;
try {
  // Try to initialize with AsyncStorage persistence
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth/react-native');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  console.warn('⚠️ Could not initialize with AsyncStorage, falling back to default auth:', error);
  // Fallback to default auth
  auth = getAuth(app);
}

// Add auth state change listener for debugging
onAuthStateChanged(auth, (user: any) => {
  if (user) {
    console.log('✅ User authenticated:', user.email);
  } else {
    console.log('ℹ️ No user authenticated');
  }
}, (error: any) => {
  console.error('❌ Auth state change error:', error);
});

// Add token refresh error handling
auth.onIdTokenChanged((user: any) => {
  if (user) {
    user.getIdToken(true).catch((error: any) => {
      console.error('❌ Error refreshing token:', error);
      // Don't throw here, just log the error
    });
  }
});

// Google Sign-In function (simplified for now)
export const signInWithGoogle = async () => {
  try {
    console.log('Google Sign-In not fully implemented yet');
    console.log('For now, use email/password or implement Google Sign-In with expo-web-browser');
    throw new Error('Google Sign-In needs to be implemented. Use email/password for now.');
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

// Function to sign in with Google ID token (for testing)
export const signInWithGoogleIdToken = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result;
  } catch (error) {
    console.error('Google ID token sign-in error:', error);
    throw error;
  }
};

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail };
export type { User as FirebaseAuthTypes };
