import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import QRScanner from '../../components/QRScanner';
import { Scan, FileText, Link, CheckCircle, Key, Shield, Wallet, Copy } from 'lucide-react-native';
import { SessionStatus, KeygenData } from '../../services/orchestrator';

export default function HomeScreen() {
  const { user } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [pairingData, setPairingData] = useState<{
    type: string;
    sessionStatus: SessionStatus;
    pairingData: any;
    keygenData?: KeygenData;
    wallet?: {
      address: string;
      publicKey: string;
      chainId: number;
      network: string;
    };
  } | null>(null);

  const handleScanSuccess = (data: any) => {
    if (data.type === 'pairing_success') {
      setPairingData(data);
      setScannedData(null);
      Alert.alert('Success', 'Successfully paired and created Sepolia wallet!');
    } else {
      setScannedData(data);
      setPairingData(null);
      Alert.alert('Success', 'Data processed successfully!');
    }
    setShowScanner(false);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  const renderDataItem = (key: string, value: any, level: number = 0) => {
    const indent = level * 20;
    
    if (typeof value === 'object' && value !== null) {
      return (
        <View key={key} style={{ marginLeft: indent }}>
          <Text style={styles.dataKey}>{key}:</Text>
          {Object.entries(value).map(([subKey, subValue]) => 
            renderDataItem(subKey, subValue, level + 1)
          )}
        </View>
      );
    } else {
      return (
        <View key={key} style={{ marginLeft: indent, flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={styles.dataKey}>{key}: </Text>
          <Text style={styles.dataValue}>{String(value)}</Text>
        </View>
      );
    }
  };

  const renderPairingData = () => {
    if (!pairingData) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <CheckCircle size={24} color="#34C759" />
          <Text style={styles.cardTitle}>Ethereum Wallet Created Successfully</Text>
        </View>
        
        {pairingData.wallet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Wallet size={20} color="#007AFF" />
                <Text style={styles.walletTitle}>Ethereum Wallet (Sepolia)</Text>
              </View>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Address:</Text>
                <TouchableOpacity 
                  style={styles.addressRow}
                  onPress={() => copyToClipboard(pairingData.wallet!.address)}
                >
                  <Text style={styles.addressText}>{pairingData.wallet.address}</Text>
                  <Copy size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.walletDetails}>
                <Text style={styles.detailText}>Network: {pairingData.wallet.network}</Text>
                <Text style={styles.detailText}>Chain ID: {pairingData.wallet.chainId}</Text>
                <Text style={styles.detailText}>Public Key: {pairingData.wallet.publicKey.substring(0, 20)}...</Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{pairingData.sessionStatus.status}</Text>
          </View>
          <Text style={styles.dataText}>Session ID: {pairingData.sessionStatus.sessionId}</Text>
          <Text style={styles.dataText}>Device ID: {pairingData.sessionStatus.deviceId || 'N/A'}</Text>
          <Text style={styles.dataText}>Created: {new Date(pairingData.sessionStatus.createdAt).toLocaleString()}</Text>
          <Text style={styles.dataText}>Expires: {new Date(pairingData.sessionStatus.expiresAt).toLocaleString()}</Text>
          {pairingData.sessionStatus.boundAt && (
            <Text style={styles.dataText}>Bound: {new Date(pairingData.sessionStatus.boundAt).toLocaleString()}</Text>
          )}
        </View>

        {pairingData.keygenData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keygen Data</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{pairingData.keygenData.status}</Text>
            </View>
            <Text style={styles.dataText}>Session ID: {pairingData.keygenData.sessionId}</Text>
            {pairingData.keygenData.keygenData && (
              <View style={styles.keygenDataContainer}>
                <Text style={styles.dataText}>Keygen Data:</Text>
                {renderDataItem('keygenData', pairingData.keygenData.keygenData, 1)}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Original Pairing Data</Text>
          {renderDataItem('pairingData', pairingData.pairingData, 1)}
        </View>
      </View>
    );
  };

  const renderScannedData = () => {
    if (!scannedData) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FileText size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Scanned Data</Text>
        </View>
        <ScrollView style={styles.dataContainer}>
          {renderDataItem('data', scannedData, 0)}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sepolia Wallet</Text>
        <Text style={styles.headerSubtitle}>Secure Multi-Party Computation</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Shield size={48} color="#007AFF" />
          <Text style={styles.welcomeTitle}>Welcome to Ethereum Wallet</Text>
          <Text style={styles.welcomeText}>
            Your phone is now a secure signing device for your browser wallet. 
            Pair with your browser to create an Ethereum wallet (Sepolia) for transactions.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={() => setShowScanner(true)}
        >
          <Scan size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Create Wallet</Text>
        </TouchableOpacity>

        {renderPairingData()}
        {renderScannedData()}
      </ScrollView>

      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <QRScanner 
          onScanSuccess={handleScanSuccess}
          onClose={handleCloseScanner}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  walletCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1a1a1a',
    flex: 1,
  },
  walletDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
  },
  dataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  dataContainer: {
    maxHeight: 200,
  },
  keygenDataContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dataKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dataValue: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});
