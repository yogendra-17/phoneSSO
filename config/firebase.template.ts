import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Firebase configuration template
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

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
