import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Firebase configuration with environment variables and fallbacks
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ,
  projectId: process.env.FIREBASE_PROJECT_ID ,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ,
  appId: process.env.FIREBASE_APP_ID ,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Log configuration for debugging (without exposing full API key)
console.log('Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT_SET',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 20)}...` : 'NOT_SET'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

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
