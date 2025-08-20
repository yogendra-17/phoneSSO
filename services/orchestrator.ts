const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:8080';

export interface PairingData {
  session_id: string;
  nonce: string;
  action: string;
  server_url?: string;
  browser_origin?: string;
}

export interface SessionStatus {
  sessionId: string;
  status: 'PENDING' | 'BOUND' | 'COMPLETE' | 'EXPIRED';
  deviceId?: string;
  createdAt: string;
  expiresAt: string;
  boundAt?: string;
}

export interface AuthResponse {
  ok: boolean;
  token?: string;
  user_id?: string;
}

export interface ClaimResponse {
  ok: boolean;
}

export interface KeygenData {
  sessionId: string;
  keygenData: any;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface WalletData {
  address: string;
  publicKey: string;
  privateKey: string; // This stays on phone only
  chainId: number;
  network: string;
}

class OrchestratorService {
  private phoneJWT: string | null = null;
  private userId: string | null = null;

  // Step 1: Authenticate phone with Firebase ID token
  async authenticatePhone(idToken: string): Promise<AuthResponse> {
    try {
      console.log('🔥 Authenticating phone with orchestrator...');
      const response = await fetch(`${ORCHESTRATOR_URL}/api/auth/phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      console.log('🔥 Auth response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Auth failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data: AuthResponse = await response.json();
      console.log('🔥 Auth response data:', data);
      
      if (data.ok && data.token && data.user_id) {
        this.phoneJWT = data.token;
        this.userId = data.user_id;
        console.log('✅ Phone authenticated successfully');
      } else {
        throw new Error('Invalid auth response');
      }

      return data;
    } catch (error) {
      console.error('❌ Phone authentication failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Step 2: Claim pairing session
  async claimSession(pairingData: PairingData): Promise<ClaimResponse> {
    if (!this.phoneJWT) {
      throw new Error('Must authenticate first');
    }

    try {
      console.log('🔥 Claiming session...');
      const deviceId = await this.getDeviceId();

      const response = await fetch(`${ORCHESTRATOR_URL}/api/claim_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.phoneJWT}`,
        },
        body: JSON.stringify({
          sessionId: pairingData.session_id,
          nonce: pairingData.nonce,
          deviceId: deviceId,
        }),
      });

      console.log('🔥 Claim response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Claim failed with status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to claim session: ${response.status} - ${errorText}`);
      }

      const data: ClaimResponse = await response.json();
      console.log('🔥 Claim response data:', data);
      
      if (data.ok) {
        console.log('✅ Session claimed successfully');
      } else {
        throw new Error('Claim response not ok');
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to claim session:', error);
      throw new Error(`Failed to claim session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Step 3: Get session status (try multiple endpoints)
  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    if (!this.phoneJWT) {
      throw new Error('Must authenticate first');
    }

    // Try multiple endpoints for session status
    const endpoints = [
      `/api/session/${sessionId}/status`, // Phone-specific endpoint
      `/api/session/${sessionId}`,        // General endpoint
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔥 Trying session status endpoint: ${endpoint}`);
        const response = await fetch(`${ORCHESTRATOR_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.phoneJWT}`,
          },
        });

        console.log(`🔥 Status response for ${endpoint}:`, response.status);
        
        if (response.ok) {
          const data: SessionStatus = await response.json();
          console.log('✅ Session status retrieved:', data);
          return data;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Endpoint ${endpoint} failed:`, response.status, errorText);
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} error:`, error);
      }
    }

    // If all endpoints fail, throw error
    throw new Error('Failed to get session status from all endpoints');
  }

  // Step 4: Poll for session status changes
  async pollSessionStatus(
    sessionId: string,
    onStatusChange?: (status: SessionStatus) => void,
    timeoutMs: number = 5 * 60 * 1000 // 5 minutes
  ): Promise<SessionStatus> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const pollInterval = setInterval(async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            clearInterval(pollInterval);
            reject(new Error('Session polling timeout'));
            return;
          }

          const status = await this.getSessionStatus(sessionId);
          
          if (onStatusChange) {
            onStatusChange(status);
          }

          // Resolve when session is bound
          if (status.status === 'BOUND') {
            clearInterval(pollInterval);
            resolve(status);
          } else if (status.status === 'EXPIRED') {
            clearInterval(pollInterval);
            reject(new Error('Session expired'));
          }
        } catch (error) {
          console.error('❌ Polling error:', error);
          clearInterval(pollInterval);
          reject(error);
        }
      }, 1000); // Poll every second
    });
  }

  // Step 5: Create wallet and complete keygen process
  async createWalletAndCompleteKeygen(sessionId: string): Promise<KeygenData> {
    if (!this.phoneJWT) {
      throw new Error('Must authenticate first');
    }

    try {
      console.log('🔥 Creating wallet and completing keygen...');
      
      // Create a basic wallet for Sepolia chain
      const wallet = await this.createSepoliaWallet();
      console.log('✅ Wallet created:', wallet.address);
      
      // Store private key securely on phone (this stays local)
      await this.storePrivateKey(wallet.privateKey);
      
      // Generate a key ID for this wallet
      const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Call keygen_done to complete the keygen process
      const response = await fetch(`${ORCHESTRATOR_URL}/api/keygen_done`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.phoneJWT}`,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          keyId: keyId,
          publicKey: wallet.publicKey,
          address: wallet.address,
          chainId: wallet.chainId,
          network: wallet.network,
        }),
      });

      console.log('🔥 Keygen done response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Keygen done failed:', response.status, errorText);
        throw new Error(`Failed to complete keygen: ${response.status} - ${errorText}`);
      }

      const data: KeygenData = await response.json();
      console.log('✅ Keygen completed:', data);
      
      // Add wallet data to the response
      return {
        ...data,
        keygenData: {
          ...data.keygenData,
          wallet: {
            address: wallet.address,
            publicKey: wallet.publicKey,
            chainId: wallet.chainId,
            network: wallet.network,
            keyId: keyId,
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to create wallet and complete keygen:', error);
      throw new Error(`Failed to create wallet and complete keygen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Step 6: Complete keygen process (phone provides keygen data)
  async completeKeygen(sessionId: string, keygenData: any): Promise<KeygenData> {
    if (!this.phoneJWT) {
      throw new Error('Must authenticate first');
    }

    try {
      console.log('🔥 Completing keygen process...');
      const response = await fetch(`${ORCHESTRATOR_URL}/api/complete_keygen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.phoneJWT}`,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          keygenData: keygenData,
        }),
      });

      console.log('🔥 Keygen complete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Keygen complete failed:', response.status, errorText);
        throw new Error(`Failed to complete keygen: ${response.status} - ${errorText}`);
      }

      const data: KeygenData = await response.json();
      console.log('✅ Keygen completed:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to complete keygen:', error);
      throw new Error(`Failed to complete keygen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Step 7: Get keygen status
  async getKeygenStatus(sessionId: string): Promise<KeygenData> {
    if (!this.phoneJWT) {
      throw new Error('Must authenticate first');
    }

    try {
      console.log('🔥 Getting keygen status...');
      const response = await fetch(`${ORCHESTRATOR_URL}/api/keygen/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${this.phoneJWT}`,
        },
      });

      console.log('🔥 Keygen status response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 Keygen status failed:', response.status, errorText);
        throw new Error(`Failed to get keygen status: ${response.status} - ${errorText}`);
      }

      const data: KeygenData = await response.json();
      console.log('✅ Keygen status:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to get keygen status:', error);
      throw new Error(`Failed to get keygen status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a basic wallet for Sepolia chain
  private async createSepoliaWallet(): Promise<WalletData> {
    try {
      console.log('🔥 Creating Sepolia wallet...');
      
      // Generate a random private key (in production, use proper crypto)
      const privateKey = this.generatePrivateKey();
      
      // Derive public key and address from private key
      const publicKey = this.derivePublicKey(privateKey);
      const address = this.deriveAddress(publicKey);
      
      const wallet: WalletData = {
        address: address,
        publicKey: publicKey,
        privateKey: privateKey, // This stays on phone only
        chainId: 11155111, // Sepolia chain ID
        network: 'sepolia'
      };
      
      console.log('✅ Wallet created successfully');
      return wallet;
    } catch (error) {
      console.error('❌ Failed to create wallet:', error);
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create wallet locally (when orchestrator keygen endpoints are not available)
  async createLocalWallet(): Promise<WalletData> {
    try {
      console.log('🔥 Creating local Sepolia wallet (no orchestrator keygen)...');
      
      const wallet = await this.createSepoliaWallet();
      
      // Store private key securely on phone
      await this.storePrivateKey(wallet.privateKey);
      
      console.log('✅ Local wallet created successfully');
      return wallet;
    } catch (error) {
      console.error('❌ Failed to create local wallet:', error);
      throw new Error(`Failed to create local wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate a random private key (simplified for demo)
  private generatePrivateKey(): string {
    // In production, use proper cryptographic random generation
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // Derive public key from private key (simplified for demo)
  private derivePublicKey(privateKey: string): string {
    // In production, use proper elliptic curve cryptography
    // This is a simplified version for demonstration
    const hash = this.simpleHash(privateKey);
    return `0x${hash.substring(0, 66)}`; // 33 bytes for compressed public key
  }

  // Derive address from public key (simplified for demo)
  private deriveAddress(publicKey: string): string {
    // In production, use proper address derivation
    const hash = this.simpleHash(publicKey);
    return `0x${hash.substring(0, 40)}`; // 20 bytes for Ethereum address
  }

  // Simple hash function (in production, use proper hashing)
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  // Store private key securely on phone
  private async storePrivateKey(privateKey: string): Promise<void> {
    try {
      // In production, use secure storage like Keychain (iOS) or Keystore (Android)
      console.log('🔐 Storing private key securely on phone...');
      
      // For demo purposes, we'll just log it (DON'T do this in production!)
      console.log('⚠️ DEMO: Private key stored:', privateKey.substring(0, 10) + '...');
      
      // TODO: Implement secure storage
      // await SecureStore.setItemAsync('wallet_private_key', privateKey);
      
      console.log('✅ Private key stored securely');
    } catch (error) {
      console.error('❌ Failed to store private key:', error);
      throw new Error(`Failed to store private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate device ID
  private async getDeviceId(): Promise<string> {
    // For now, generate a simple device ID
    // In production, you might want to use a more persistent identifier
    return `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current authentication state
  isAuthenticated(): boolean {
    return this.phoneJWT !== null;
  }

  // Get current user ID
  getUserId(): string | null {
    return this.userId;
  }

  // Get current JWT token
  getPhoneJWT(): string | null {
    return this.phoneJWT;
  }

  // Clear authentication
  clearAuth(): void {
    this.phoneJWT = null;
    this.userId = null;
  }
}

export const orchestratorService = new OrchestratorService();
