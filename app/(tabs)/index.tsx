import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useActions } from '../../contexts/ActionsContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { deviceId, isPolling, lastPolledAt, lastError, forcePoll } = useActions();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Home!</Text>
        <Text style={styles.subtitle}>
          Hello, {user?.email || 'User'}
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>You&apos;re successfully authenticated</Text>
          <Text style={styles.cardText}>
            This is your main app content. You can now build your amazing features here!
          </Text>
          <View style={{ height: 12 }} />
          <Text style={styles.metaText}>Device ID: {deviceId?.slice(0, 8)}...</Text>
          <Text style={styles.metaText}>Polling: {isPolling ? 'yes' : 'no'} {lastPolledAt ? `(last ${Math.round((Date.now()-lastPolledAt)/1000)}s ago)` : ''}</Text>
          {lastError ? <Text style={[styles.metaText, { color: '#FF3B30' }]}>Error: {lastError}</Text> : null}
          <View style={{ height: 16 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={forcePoll}>
              <Text style={styles.buttonText}>Force poll now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/pairing/scan')}
            >
              <Text style={styles.secondaryButtonText}>Scan Pairing QR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
});
