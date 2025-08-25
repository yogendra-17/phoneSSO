import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '../config/firebase';

// Network request interceptor to log Firebase API calls
const originalFetch = global.fetch;
global.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Only log Firebase API requests
  if (url.includes('identitytoolkit.googleapis.com')) {
    console.log('🔥 FIREBASE API REQUEST:');
    console.log('🔥 URL:', url);
    console.log('🔥 Method:', init?.method || 'GET');
    console.log('🔥 Headers:', init?.headers);
    
    if (init?.body) {
      try {
        const body = JSON.parse(init.body as string);
        console.log('🔥 Request Body:', JSON.stringify(body, null, 2));
        
        // Extract key information
        if (body.email) {
          console.log('🔥 Email:', body.email);
        }
        if (body.password) {
          console.log('🔥 Password Length:', body.password?.length || 0);
        }
        if (body.clientType) {
          console.log('🔥 Client Type:', body.clientType);
        }
        if (body.returnSecureToken !== undefined) {
          console.log('🔥 Return Secure Token:', body.returnSecureToken);
        }
      } catch (e) {
        console.log('🔥 Request Body (raw):', init.body);
      }
    }
    
    // Log the response
    return originalFetch.call(this, input as RequestInfo, init).then(response => {
      console.log('🔥 FIREBASE API RESPONSE:');
      console.log('🔥 Status:', response.status);
      console.log('🔥 Status Text:', response.statusText);
      console.log('🔥 Headers:', Object.fromEntries(response.headers.entries()));
      
      // Clone response to read body
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('🔥 Response Body:', JSON.stringify(data, null, 2));
        
        if (data.error) {
          console.log('🔥 ERROR DETAILS:');
          console.log('🔥 Error Code:', data.error.code);
          console.log('🔥 Error Message:', data.error.message);
        }
      }).catch(e => {
        console.log('🔥 Could not parse response body:', e.message);
      });
      
      return response;
    }).catch(error => {
      console.log('🔥 FIREBASE API ERROR:');
      console.log('🔥 Error:', error);
      throw error;
    });
  }
  
  return originalFetch.call(this, input as RequestInfo, init);
};

export const debugFirebaseConfig = () => {
  console.log('=== FIREBASE CONFIGURATION DEBUG ===');
  console.log('Project ID:', auth.app.options.projectId);
  console.log('Auth Domain:', auth.app.options.authDomain);
  console.log('API Key (first 10 chars):', auth.app.options.apiKey?.substring(0, 10) + '...');
  console.log('App ID:', auth.app.options.appId);
  console.log('Storage Bucket:', auth.app.options.storageBucket);
  console.log('Messaging Sender ID:', auth.app.options.messagingSenderId);
  console.log('Current User:', auth.currentUser ? {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    emailVerified: auth.currentUser.emailVerified,
    providerData: auth.currentUser.providerData.map((p: any) => p.providerId)
  } : 'No user signed in');
  
  // Check if configuration is valid
  const requiredFields = ['projectId', 'authDomain', 'apiKey', 'appId'];
  const missingFields = requiredFields.filter(field => !auth.app.options[field as keyof typeof auth.app.options]);
  
  if (missingFields.length > 0) {
    console.log('❌ MISSING FIREBASE CONFIGURATION:', missingFields);
    console.log('❌ Please check your environment variables or Firebase configuration');
  } else {
    console.log('✅ Firebase configuration appears valid');
  }
  
  console.log('=== END FIREBASE CONFIGURATION DEBUG ===');
};

export const testAuthentication = async (email: string, password: string) => {
  console.log('=== AUTHENTICATION TEST ===');
  console.log('Testing login for:', email);
  console.log('Password length:', password.length);
  
  // Log the Firebase config being used
  console.log('Firebase Config Used:');
  console.log('- Project ID:', auth.app.options.projectId);
  console.log('- Auth Domain:', auth.app.options.authDomain);
  console.log('- API Key:', auth.app.options.apiKey);
  console.log('- App ID:', auth.app.options.appId);
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('User details:', {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified,
      providerData: result.user.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email
      })),
      metadata: {
        creationTime: result.user.metadata.creationTime,
        lastSignInTime: result.user.metadata.lastSignInTime
      }
    });
    
    // Get ID token
    const idToken = await result.user.getIdToken();
    console.log('ID Token length:', idToken.length);
    console.log('ID Token preview:', idToken.substring(0, 50) + '...');
    
    return { success: true, user: result.user, idToken };
  } catch (error: any) {
    console.log('❌ LOGIN FAILED');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    // Provide specific guidance based on error
    switch (error.code) {
      case 'auth/invalid-credential':
        console.log('💡 This usually means:');
        console.log('   - Wrong email/password combination');
        console.log('   - Account was created with different auth method (Google vs Email)');
        console.log('   - Account exists in different Firebase project');
        break;
      case 'auth/user-not-found':
        console.log('💡 This means:');
        console.log('   - User does not exist in this Firebase project');
        console.log('   - Email is incorrect');
        break;
      case 'auth/wrong-password':
        console.log('💡 This means:');
        console.log('   - Password is incorrect for this email');
        console.log('   - Account might have been created with different credentials');
        break;
      case 'auth/invalid-api-key':
        console.log('💡 This means:');
        console.log('   - Firebase API key is incorrect');
        console.log('   - App is connecting to wrong Firebase project');
        break;
    }
    
    return { success: false, error };
  }
};

export const createTestAccount = async (email: string, password: string) => {
  console.log('=== CREATING TEST ACCOUNT ===');
  console.log('Email:', email);
  console.log('Password length:', password.length);
  
  // Log the Firebase config being used for account creation
  console.log('🔥 FIREBASE CONFIG USED FOR ACCOUNT CREATION:');
  console.log('🔥 Project ID:', auth.app.options.projectId);
  console.log('🔥 Auth Domain:', auth.app.options.authDomain);
  console.log('🔥 API Key:', auth.app.options.apiKey);
  console.log('🔥 App ID:', auth.app.options.appId);
  console.log('🔥 Storage Bucket:', auth.app.options.storageBucket);
  console.log('🔥 Messaging Sender ID:', auth.app.options.messagingSenderId);
  console.log('🔥 Full Config Object:', JSON.stringify(auth.app.options, null, 2));
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ ACCOUNT CREATED SUCCESSFULLY!');
    console.log('User details:', {
      uid: result.user.uid,
      email: result.user.email,
      emailVerified: result.user.emailVerified
    });
    console.log('✅ Account created in Firebase project:', auth.app.options.projectId);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.log('❌ ACCOUNT CREATION FAILED');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    return { success: false, error };
  }
};

export const checkUserExists = async (email: string) => {
  console.log('=== CHECKING USER EXISTENCE ===');
  console.log('Email:', email);
  
  try {
    // Try to send password reset email - this will fail if user doesn't exist
    await sendPasswordResetEmail(auth, email);
    console.log('✅ User exists (password reset email sent)');
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ User does not exist');
      return false;
    }
    console.log('❌ Error checking user existence:', error.message);
    throw error;
  }
};

export const getAuthGuidance = () => {
  console.log('=== CROSS-PLATFORM AUTHENTICATION GUIDANCE ===');
  console.log('');
  console.log('PROBLEM: Email/password accounts not working across platforms');
  console.log('');
  console.log('POSSIBLE CAUSES:');
  console.log('');
  console.log('1. DIFFERENT FIREBASE PROJECTS');
  console.log('   - Mobile and web apps using different Firebase projects');
  console.log('   - Solution: Use same project ID and API key');
  console.log('');
  console.log('2. DIFFERENT AUTHENTICATION METHODS');
  console.log('   - Account created with Google Sign-In on one platform');
  console.log('   - Trying to use email/password on another platform');
  console.log('   - Solution: Use same auth method on both platforms');
  console.log('');
  console.log('3. DIFFERENT PASSWORDS');
  console.log('   - Password used on mobile is different from web');
  console.log('   - Solution: Use password reset to set same password');
  console.log('');
  console.log('4. FIREBASE CONFIGURATION ISSUES');
  console.log('   - Different API keys or project settings');
  console.log('   - Solution: Use identical Firebase config');
  console.log('');
  console.log('DEBUGGING STEPS:');
  console.log('1. Run debugFirebaseConfig() on both platforms');
  console.log('2. Compare project IDs and API keys');
  console.log('3. Try creating fresh account with same credentials');
  console.log('4. Use Google Sign-In instead of email/password');
  console.log('===============================================');
};
