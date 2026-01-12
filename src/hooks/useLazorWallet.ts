import { useState, useCallback, useEffect } from 'react';
import { LAZOR_CONFIG, generateMockLog, generateMockWalletAddress } from '@/lib/lazor-config';

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

  // Check for existing session on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        if (parsed.address) {
          setState({
            isConnected: true,
            isConnecting: false,
            address: parsed.address,
            error: null,
          });
          // Add reconnection log
          addLog('connect');
          setTimeout(() => addLog('policy'), 300);
        }
      } catch {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, [addLog]);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    console.log('[LazorKit] Initiating passkey authentication...');
    console.log('[LazorKit] Config:', { 
      rpcUrl: LAZOR_CONFIG.rpcUrl,
      rpId: LAZOR_CONFIG.rpId,
      network: LAZOR_CONFIG.network 
    });
    
    // Simulate realistic passkey authentication timing
    // In production, this would trigger WebAuthn
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate a mock Solana-style wallet address
    const mockAddress = generateMockWalletAddress();
    
    console.log('[LazorKit] Passkey verified, wallet created:', mockAddress.slice(0, 8) + '...');
    
    // Persist to localStorage for session persistence
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ 
      address: mockAddress,
      connectedAt: Date.now(),
    }));
    
    setState({
      isConnected: true,
      isConnecting: false,
      address: mockAddress,
      error: null,
    });
    
    // Add connection logs with realistic timing (simulates on-chain verification)
    addLog('connect');
    setTimeout(() => addLog('policy'), 400);
    setTimeout(() => addLog('paymaster'), 800);
  }, [addLog]);

  const disconnect = useCallback(() => {
    console.log('[LazorKit] Disconnecting wallet...');
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      error: null,
    });
    setLogs([]);
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    logs,
    addLog,
  };
};
