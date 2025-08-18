import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getOrCreateDeviceId, saveKeyshare, loadKeyshare } from '../services/storage';
import { OrchestratorAction, getActions, postKeygenDone, postSignDone } from '../services/api';
import { demoKeygen, demoSign } from '../services/crypto-demo';

type PollState = {
  deviceId: string | null;
  lastError: string | null;
  isPolling: boolean;
  lastPolledAt: number | null;
};

type ActionsContextType = PollState & {
  forcePoll: () => Promise<void>;
};

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const useActions = () => {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error('useActions must be used within ActionsProvider');
  return ctx;
};

export const ActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<number | null>(null);
  const backoffRef = useRef<number>(3000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef<boolean>(false);

  useEffect(() => {
    (async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
    })();
  }, []);

  const handleKeygen = async (action: Extract<OrchestratorAction, { type: 'KEYGEN' }>) => {
    const { keyshareB64, publicKeyB64, keyId } = await demoKeygen();
    await saveKeyshare(keyId, keyshareB64);
    await postKeygenDone({ actionId: action.id, keyId, publicKey: publicKeyB64 });
  };

  const handleSign = async (action: Extract<OrchestratorAction, { type: 'SIGN' }>) => {
    const hasShare = await loadKeyshare(action.keyId);
    if (!hasShare) throw new Error('missing_keyshare');
    const sig = await demoSign(action.keyId, action.msgHash);
    await postSignDone({ intentId: action.signIntentId, signature: sig });
  };

  const pollOnce = async () => {
    if (!deviceId || !user || runningRef.current) return;
    runningRef.current = true;
    setIsPolling(true);
    try {
      const { actions } = await getActions(deviceId);
      setLastPolledAt(Date.now());
      setLastError(null);
      backoffRef.current = 3000;
      for (const action of actions) {
        if (action.status !== 'PENDING') continue;
        if (action.type === 'KEYGEN') {
          await handleKeygen(action);
        } else if (action.type === 'SIGN') {
          await handleSign(action);
        }
      }
    } catch (err: any) {
      const message = String(err?.message || err);
      setLastError(message);
      // backoff 3 -> 5 -> 8s
      if (backoffRef.current < 5000) backoffRef.current = 5000; else backoffRef.current = 8000;
    } finally {
      setIsPolling(false);
      runningRef.current = false;
    }
  };

  const scheduleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pollOnce().finally(scheduleNext);
    }, backoffRef.current);
  };

  useEffect(() => {
    if (!user) return;
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, deviceId]);

  const forcePoll = async () => {
    await pollOnce();
  };

  const value: ActionsContextType = {
    deviceId,
    lastError,
    isPolling,
    lastPolledAt,
    forcePoll,
  };

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
};

