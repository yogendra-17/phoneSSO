import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getOrCreateDeviceId } from '../../services/storage';
import { postClaimSession, setApiBaseOverride } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type QrPayload = {
  sessionId: string;
  nonce: string;
  api?: string;
};

export default function ScanPairingScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed: QrPayload = JSON.parse(data);
      if (parsed.api) setApiBaseOverride(parsed.api.endsWith('/api') ? parsed.api : `${parsed.api}/api`);
      const deviceId = await getOrCreateDeviceId();
      const userToken = await user?.getIdToken?.();
      if (!userToken) throw new Error('missing_user_token');
      await postClaimSession({ sessionId: parsed.sessionId, nonce: parsed.nonce, deviceId, userToken });
      Alert.alert('Paired', 'This device is now bound to the session.');
    } catch (e: any) {
      setScanned(false);
      const message = e?.response?.data?.error || e?.message || 'Scan failed';
      Alert.alert('Pairing failed', message);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}><Text style={styles.info}>Requesting camera permission…</Text></SafeAreaView>
    );
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}><Text style={styles.info}>No access to camera</Text></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scan Pairing QR</Text>
      <View style={styles.scannerBox}>
        <BarCodeScanner
          onBarCodeScanned={onScan}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  info: {
    marginTop: 40,
    textAlign: 'center',
  },
  scannerBox: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

