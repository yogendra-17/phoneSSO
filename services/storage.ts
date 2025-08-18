import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device:id';

export const getOrCreateDeviceId = async (): Promise<string> => {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
  }
  return id;
};

export const saveKeyshare = async (keyId: string, keyshareB64: string): Promise<void> => {
  await SecureStore.setItemAsync(`keyshare:${keyId}`, keyshareB64, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
};

export const loadKeyshare = async (keyId: string): Promise<string | null> => {
  return SecureStore.getItemAsync(`keyshare:${keyId}`);
};

