import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function TestGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      Alert.alert('Success', 'Google Sign-In successful!');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Sign-In Test</Text>
      
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>Signed in as:</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userName}>{user.displayName}</Text>
        </View>
      ) : (
        <Text style={styles.notSignedIn}>Not signed in</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Google Sign-In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    width: '100%',
  },
  userText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    color: '#666',
  },
  notSignedIn: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
