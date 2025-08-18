import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

let apiBaseOverride: string | null = null;

export const setApiBaseOverride = (baseUrl: string | null) => {
  apiBaseOverride = baseUrl;
};

export const getApiBase = () => {
  if (apiBaseOverride) return apiBaseOverride;
  const envBase = process.env.EXPO_PUBLIC_API_BASE;
  if (envBase && envBase.length > 0) return envBase;
  // Sensible defaults for local dev
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080/api';
  return 'http://127.0.0.1:8080/api';
};

let client: AxiosInstance | null = null;

export const getClient = () => {
  if (!client) {
    client = axios.create({
      baseURL: getApiBase(),
      timeout: 15_000,
    });
  } else {
    // keep baseURL in sync with override
    client.defaults.baseURL = getApiBase();
  }
  return client;
};

export type OrchestratorAction =
  | { id: string; type: 'KEYGEN'; status: 'PENDING' | 'DONE' | 'FAILED'; createdAt?: string }
  | {
      id: string;
      type: 'SIGN';
      status: 'PENDING' | 'DONE' | 'FAILED';
      createdAt?: string;
      signIntentId: string;
      keyId: string;
      msgHash: string;
    };

export const postClaimSession = async (params: {
  sessionId: string;
  nonce: string;
  deviceId: string;
  userToken: string;
}) => {
  const api = getClient();
  const { data } = await api.post('/claim_session', params);
  return data as { ok: boolean };
};

export const getActions = async (deviceId: string) => {
  const api = getClient();
  const { data } = await api.get('/actions', { params: { deviceId } });
  return data as { actions: OrchestratorAction[] };
};

export const postKeygenDone = async (params: { actionId: string; keyId: string; publicKey: string }) => {
  const api = getClient();
  const { data } = await api.post('/keygen_done', params);
  return data as { ok: boolean };
};

export const postSignDone = async (params: { intentId: string; signature: { r: string; s: string; v: number } }) => {
  const api = getClient();
  const { data } = await api.post('/sign_done', params);
  return data as { ok: boolean };
};

