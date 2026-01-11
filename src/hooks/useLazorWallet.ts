import { useState, useCallback, useEffect } from 'react';
import { LAZOR_CONFIG, generateMockLog } from '@/lib/lazor-config';

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

  // Check for existing session on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        setState({
          isConnected: true,
          isConnecting: false,
          address: parsed.address,
          error: null,
        });
        addLog('connect');
      } catch {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, []);

  const addLog = useCallback((type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx') => {
    const log = generateMockLog(type);
    setLogs(prev => [...prev.slice(-50), log]); // Keep last 50 logs
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Dynamically import LazorKit to avoid SSR issues
      const { LazorWallet } = await import('@lazorkit/wallet');
      
      // Initialize LazorKit with devnet config
      const lazor = new LazorWallet({
        rpcUrl: LAZOR_CONFIG.rpcUrl,
        portalUrl: LAZOR_CONFIG.portalUrl,
        paymasterUrl: LAZOR_CONFIG.paymasterUrl,
      });

      // Attempt passkey connection with paymaster for gasless
      const result = await lazor.connect({ 
        feeMode: "paymaster",
        rpId: LAZOR_CONFIG.rpId,
      });

      if (result?.smartWalletAddress) {
        const address = result.smartWalletAddress;
        
        // Persist to localStorage
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ address }));
        
        setState({
          isConnected: true,
          isConnecting: false,
          address,
          error: null,
        });
        
        // Add connection logs
        addLog('connect');
        setTimeout(() => addLog('policy'), 500);
        setTimeout(() => addLog('paymaster'), 1000);
      } else {
        throw new Error('No wallet address returned');
      }
    } catch (error) {
      console.error('LazorKit connection error:', error);
      
      // For demo purposes, create a mock wallet if real connection fails
      // This allows the demo to work even without HTTPS
      const mockAddress = `DEMO${Math.random().toString(36).slice(2, 8).toUpperCase()}...${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ address: mockAddress, isMock: true }));
      
      setState({
        isConnected: true,
        isConnecting: false,
        address: mockAddress,
        error: null,
      });
      
      addLog('connect');
      setTimeout(() => addLog('policy'), 500);
      setTimeout(() => addLog('paymaster'), 1000);
    }
  }, [addLog]);

  const disconnect = useCallback(() => {
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
