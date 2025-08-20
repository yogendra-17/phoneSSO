import React, { useState } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Scan, Copy, CheckCircle, XCircle, Key, Wallet } from 'lucide-react-native';
import { orchestratorService, PairingData, SessionStatus, KeygenData } from '../services/orchestrator';
import { useAuth } from '../contexts/AuthContext';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [sessionDataInput, setSessionDataInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const { user } = useAuth();

  const handleProcessData = async () => {
    if (!sessionDataInput.trim()) {
      Alert.alert('Error', 'Please enter data');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be authenticated to pair');
      return;
    }

    setIsProcessing(true);
    setPairingStatus('processing');
    setStatusMessage('Processing pairing data...');
    setCurrentStep('parsing');

    try {
      // Parse the input as JSON
      const parsedData = JSON.parse(sessionDataInput.trim());
      console.log('Data processed successfully:', parsedData);

      // Check if it's pairing data
      if (parsedData.session_id && parsedData.nonce && parsedData.action === 'pair') {
        await handlePairingFlow(parsedData);
      } else {
        // If it's not pairing data, just return it as before
        onScanSuccess(parsedData);
        setPairingStatus('success');
        setStatusMessage('Data processed successfully!');
      }
    } catch (error) {
      console.error('Error processing data:', error);
      setPairingStatus('error');
      setStatusMessage('Invalid JSON data');
      Alert.alert('Invalid JSON', 'Please enter valid JSON data.');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const handlePairingFlow = async (pairingData: PairingData) => {
    try {
      setCurrentStep('auth');
      setStatusMessage('Authenticating with orchestrator...');
      
      // Step 1: Get Firebase ID token and authenticate with orchestrator
      const idToken = await user!.getIdToken();
      await orchestratorService.authenticatePhone(idToken);
      
      setCurrentStep('claim');
      setStatusMessage('Claiming session...');
      
      // Step 2: Claim the session
      await orchestratorService.claimSession(pairingData);
      
      setCurrentStep('polling');
      setStatusMessage('Session claimed! Polling for status...');
      
      // Step 3: Poll for session status
      const sessionStatus = await orchestratorService.pollSessionStatus(
        pairingData.session_id,
        (status: SessionStatus) => {
          setStatusMessage(`Session status: ${status.status}`);
        }
      );
      
      setCurrentStep('wallet');
      setStatusMessage('Session bound! Creating Sepolia wallet...');
      
      // Step 4: Create wallet and complete keygen process
      let keygenData = null;
      let wallet = null;
      
      try {
        keygenData = await orchestratorService.createWalletAndCompleteKeygen(pairingData.session_id);
        wallet = keygenData.keygenData.wallet;
        
        setCurrentStep('complete');
        setStatusMessage('Wallet created and keygen completed!');
        
      } catch (keygenError) {
        console.log('⚠️ Keygen failed, creating wallet locally only:', keygenError);
        
        // Create wallet locally without orchestrator keygen
        wallet = await orchestratorService.createLocalWallet();
        
        setCurrentStep('complete');
        setStatusMessage('Wallet created locally!');
      }
      
      setPairingStatus('success');
      setStatusMessage('Successfully paired and created Sepolia wallet!');
      
      // Return the complete pairing and wallet data
      onScanSuccess({
        type: 'pairing_success',
        sessionStatus,
        pairingData,
        keygenData: keygenData,
        wallet: wallet
      });
      
    } catch (error) {
      console.error('Pairing failed:', error);
      setPairingStatus('error');
      setStatusMessage(`Pairing failed at step "${currentStep}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Pairing Failed', `Failed at step "${currentStep}": ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  const handlePasteExample = () => {
    const exampleData = {
      "session_id": "d35e5bdd-93c3-46a8-939f-47359dca13fa",
      "nonce": "sBoXuZ1X0m19UmM0H8klcWGtZ1YLH7IGfOHQ22SYaoY",
      "action": "pair",
      "browser_origin": "http://localhost:8082"
    };
    
    setSessionDataInput(JSON.stringify(exampleData, null, 2));
  };

  const getStatusIcon = () => {
    switch (pairingStatus) {
      case 'success':
        return <CheckCircle size={24} color="#34C759" />;
      case 'error':
        return <XCircle size={24} color="#FF3B30" />;
      case 'processing':
        return <ActivityIndicator size={24} color="#007AFF" />;
      default:
        return <Scan size={24} color="#007AFF" />;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'auth':
        return <Key size={20} color="#007AFF" />;
      case 'claim':
        return <Copy size={20} color="#007AFF" />;
      case 'polling':
        return <Scan size={20} color="#007AFF" />;
      case 'wallet':
        return <Wallet size={20} color="#007AFF" />;
      case 'complete':
        return <CheckCircle size={20} color="#34C759" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Pairing Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          {getStatusIcon()}
          <Text style={styles.infoTitle}>MPC Wallet Pairing</Text>
          <Text style={styles.infoText}>
            Enter the pairing data from your browser wallet to create a secure Sepolia wallet.
          </Text>
        </View>

        {pairingStatus !== 'idle' && (
          <View style={[
            styles.statusCard,
            { backgroundColor: pairingStatus === 'success' ? '#d4edda' : 
                             pairingStatus === 'error' ? '#f8d7da' : '#d1ecf1' }
          ]}>
            <View style={styles.statusRow}>
              {getStepIcon()}
              <Text style={[
                styles.statusText,
                { color: pairingStatus === 'success' ? '#155724' : 
                        pairingStatus === 'error' ? '#721c24' : '#0c5460' }
              ]}>
                {statusMessage}
              </Text>
            </View>
            {currentStep && (
              <Text style={styles.stepText}>
                Current step: {currentStep}
              </Text>
            )}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Pairing Data (JSON):</Text>
          <TextInput
            style={styles.textInput}
            value={sessionDataInput}
            onChangeText={setSessionDataInput}
            placeholder="Paste your pairing JSON data here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            editable={!isProcessing}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.exampleButton, isProcessing && styles.disabledButton]} 
            onPress={handlePasteExample}
            disabled={isProcessing}
          >
            <Copy size={20} color="#007AFF" />
            <Text style={styles.exampleButtonText}>Load Example</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.processButton, isProcessing && styles.disabledButton]} 
            onPress={handleProcessData}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.processButtonText}>Start Pairing</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Sepolia Wallet Creation Process:</Text>
          <Text style={styles.helpText}>
            1. 🔐 Authenticate with orchestrator{'\n'}
            2. 📋 Claim pairing session{'\n'}
            3. 🔄 Poll for session binding{'\n'}
            4. 💰 Create Sepolia wallet{'\n'}
            5. ✅ Complete wallet setup{'\n'}
            6. 🎉 Wallet ready for transactions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  stepText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 120,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exampleButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  processButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
