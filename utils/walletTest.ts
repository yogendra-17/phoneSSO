// Add crypto polyfill for React Native (must be imported first)
import 'react-native-get-random-values';

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

export const testWalletCreation = async () => {
  console.log('=== TESTING WALLET CREATION ===');
  
  try {
    // Generate a private key using viem
    const privateKey = generatePrivateKey();
    console.log('✅ Private key generated:', privateKey.substring(0, 20) + '...');
    
    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    console.log('✅ Account created:');
    console.log('  Address:', account.address);
    console.log('  Public Key:', account.publicKey || 'Not available');
    
    // Test chain information
    console.log('✅ Chain information:');
    console.log('  Chain ID:', sepolia.id);
    console.log('  Chain Name:', sepolia.name);
    console.log('  Network:', 'sepolia');
    
    return {
      success: true,
      address: account.address,
      publicKey: account.publicKey,
      privateKey: privateKey,
      chainId: sepolia.id,
      network: 'sepolia'
    };
  } catch (error) {
    console.error('❌ Wallet creation test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
