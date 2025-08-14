import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Check if we have a valid Firebase configuration from environment variables
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
export const hasValidConfig = !!(firebaseApiKey && firebaseApiKey !== 'YOUR_API_KEY');

// Only initialize Firebase if the configuration is valid
if (hasValidConfig) {
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);

  // Initialize Auth with platform-specific persistence
  try {
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  } catch (error) {
    console.error('Firebase auth initialization error:', error);
    // Fallback to basic auth instance on error
    auth = getAuth(app);
  }
}

export { auth };
export default app;
