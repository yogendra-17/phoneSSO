import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '808254346543-636a2mump211q24nrql4s9jdcucjd6gq.apps.googleusercontent.com', // From GoogleService-Info.plist
  iosClientId: '808254346543-636a2mump211q24nrql4s9jdcucjd6gq.apps.googleusercontent.com', // From GoogleService-Info.plist
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

// Initialize Firebase Auth
const firebaseAuth = auth();

export { firebaseAuth as auth, GoogleSignin, auth as authModule };
export type { FirebaseAuthTypes };
