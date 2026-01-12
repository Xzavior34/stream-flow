import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { generateMockLog } from '@/lib/lazor-config';

interface LazorWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  error: string | null;
}

interface UseLazorWalletReturn extends LazorWalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  logs: string[];
  addLog: (type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx') => void;
}

// Storage key for persisting wallet connection
const WALLET_STORAGE_KEY = 'stream_fun_wallet';

export const useLazorWallet = (): UseLazorWalletReturn => {
  const lazorWallet = useWallet();
  
  const [state, setState] = useState<LazorWalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    error: null,
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx') => {
    const log = generateMockLog(type);
    setLogs(prev => [...prev.slice(-50), log]);
  }, []);

  // Sync with LazorKit wallet state
  useEffect(() => {
    if (lazorWallet.isConnected && lazorWallet.smartWalletPubkey) {
      const address = lazorWallet.smartWalletPubkey.toBase58();
      setState({
        isConnected: true,
        isConnecting: false,
        address,
        error: null,
      });
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ 
        address,
        connectedAt: Date.now(),
      }));
    }
  }, [lazorWallet.isConnected, lazorWallet.smartWalletPubkey]);

  // Check for existing session on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedWallet && !lazorWallet.isConnected) {
      try {
        const parsed = JSON.parse(savedWallet);
        if (parsed.address) {
          // Show cached address while reconnecting
          setState(prev => ({
            ...prev,
            address: parsed.address,
          }));
          addLog('connect');
          setTimeout(() => addLog('policy'), 300);
        }
      } catch {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, [addLog, lazorWallet.isConnected]);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    console.log('[LazorKit] Initiating passkey authentication...');
    
    try {
      // Use real LazorKit SDK connection
      await lazorWallet.connect();
      
      console.log('[LazorKit] Passkey verified successfully!');
      
      // Add connection logs with realistic timing
      addLog('connect');
      setTimeout(() => addLog('policy'), 400);
      setTimeout(() => addLog('paymaster'), 800);
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
      }));
    } catch (error) {
      console.error('[LazorKit] Connection failed:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, [lazorWallet, addLog]);

  const disconnect = useCallback(() => {
    console.log('[LazorKit] Disconnecting wallet...');
    lazorWallet.disconnect();
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      error: null,
    });
    setLogs([]);
  }, [lazorWallet]);

  return {
    ...state,
    connect,
    disconnect,
    logs,
    addLog,
  };
};
