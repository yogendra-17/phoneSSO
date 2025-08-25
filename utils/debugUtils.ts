import { orchestratorService } from '../services/orchestrator';

export const debugOrchestratorState = () => {
  console.log('=== ORCHESTRATOR SERVICE DEBUG ===');
  console.log('Is Authenticated:', orchestratorService.isAuthenticated());
  console.log('User ID:', orchestratorService.getUserId());
  console.log('JWT Token exists:', !!orchestratorService.getPhoneJWT());
  console.log('JWT Token preview:', orchestratorService.getPhoneJWT()?.substring(0, 20) + '...');
  console.log('=== END ORCHESTRATOR SERVICE DEBUG ===');
};

export const clearOrchestratorAuth = () => {
  console.log('🧹 Clearing orchestrator authentication...');
  orchestratorService.clearAuth();
  console.log('✅ Orchestrator authentication cleared');
};

export const checkNetworkConnectivity = async () => {
  console.log('=== NETWORK CONNECTIVITY CHECK ===');
  
  try {
    // Test basic internet connectivity
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ Internet connectivity: OK');
  } catch (error) {
    console.log('❌ Internet connectivity: FAILED');
    console.log('Error:', error);
  }
  
  try {
    // Test orchestrator connectivity
    const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080';
    console.log('🔥 Testing orchestrator at:', orchestratorUrl);
    
    const response = await fetch(`${orchestratorUrl}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ Orchestrator connectivity: OK');
    console.log('Response status:', response.status);
  } catch (error) {
    console.log('❌ Orchestrator connectivity: FAILED');
    console.log('Error:', error);
    
    // Try alternative endpoints
    try {
      const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:8080';
      const response = await fetch(`${orchestratorUrl}/api/auth/browser`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: 'test' }),
        signal: AbortSignal.timeout(5000)
      });
      console.log('✅ Orchestrator API endpoint accessible (expected 400/401):', response.status);
    } catch (apiError) {
      console.log('❌ Orchestrator API endpoint also failed:', apiError);
    }
  }
  
  console.log('=== END NETWORK CONNECTIVITY CHECK ===');
};

export const logActiveTimers = () => {
  console.log('=== ACTIVE TIMERS DEBUG ===');
  // This is a simplified check - in a real app you'd want to track timers more carefully
  console.log('Note: Timer tracking requires manual implementation');
  console.log('Check for any setInterval or setTimeout calls that might be running');
  console.log('=== END ACTIVE TIMERS DEBUG ===');
};
