import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { debugFirebaseConfig, testAuthentication, createTestAccount, checkUserExists, getAuthGuidance } from '../../utils/firebaseDebug';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug functions
  const handleDebugConfig = () => {
    debugFirebaseConfig();
    Alert.alert('Debug Info', 'Firebase configuration logged to console. Check the console for details.');
  };

  const handleTestAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await testAuthentication(email, password);
      if (result.success) {
        Alert.alert('Test Success', 'Authentication test successful! Check console for details.');
      } else {
        Alert.alert('Test Failed', `Authentication test failed: ${result.error.message}\nCheck console for detailed analysis.`);
      }
    } catch (error: any) {
      Alert.alert('Test Error', `Test error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await createTestAccount(email, password);
      if (result.success) {
        Alert.alert('Success', 'Test account created successfully! You can now try logging in.');
      } else {
        Alert.alert('Failed', `Failed to create test account: ${result.error.message}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Error creating test account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUser = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email first');
      return;
    }
    
    setLoading(true);
    try {
      const exists = await checkUserExists(email);
      Alert.alert('User Check', exists ? 'User exists!' : 'User does not exist');
    } catch (error: any) {
      Alert.alert('Error', `Error checking user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetGuidance = () => {
    getAuthGuidance();
    Alert.alert('Guidance', 'Authentication guidance printed to console. Check the console for detailed solutions.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Sign in to continue'
                : 'Sign up to get started'}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Debug Buttons */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Tools</Text>
              <View style={styles.debugButtons}>
                <TouchableOpacity
                  style={[styles.debugButton, styles.debugButtonSmall]}
                  onPress={handleDebugConfig}
                  disabled={loading}
                >
                  <Text style={styles.debugButtonText}>Debug Config</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.debugButton, styles.debugButtonSmall]}
                  onPress={handleTestAuth}
                  disabled={loading}
                >
                  <Text style={styles.debugButtonText}>Test Auth</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.debugButton, styles.debugButtonSmall]}
                  onPress={handleCreateTest}
                  disabled={loading}
                >
                  <Text style={styles.debugButtonText}>Create Test</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.debugButton, styles.debugButtonSmall]}
                  onPress={handleCheckUser}
                  disabled={loading}
                >
                  <Text style={styles.debugButtonText}>Check User</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.debugButton, styles.debugButtonSmall]}
                  onPress={handleGetGuidance}
                  disabled={loading}
                >
                  <Text style={styles.debugButtonText}>Get Help</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  debugButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  debugButtonSmall: {
    minWidth: 80,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
