/**
 * @fileoverview Legacy LazorKit Wallet Hook
 * @deprecated Use useLazorAuth from '@/hooks/useLazorAuth' instead
 * @description This hook is maintained for backward compatibility.
 * New code should use the modular hooks in the /hooks directory.
 */

import { useState, useCallback, useEffect } from 'react';
import { LAZORKIT_CONFIG, STORAGE_KEYS, generateMockWalletAddress } from '@/constants/lazorkit';
import { useSessionLogs } from '@/hooks/useSessionLogs';

// --- FIXED: Added the missing helper function to prevent ReferenceError ---
const generateMockLog = (type: string) => {
  const timestamp = new Date().toLocaleTimeString();
  const messages: Record<string, string> = {
    connect: `🟢 Wallet connected successfully`,
    policy: `📜 Policy verification passed`,
    paymaster: `⛽ Paymaster sponsored gas fees`,
    session: `🔑 Session key authorized`,
    tx: `💸 Transaction confirmed`
  };
  return `[${timestamp}] ${messages[type] || type}`;
};
// -------------------------------------------------------------------------

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
    // This line was crashing before because generateMockLog didn't exist. Now it works.
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
    
    // Safety check for LAZOR_CONFIG availability to prevent undefined errors
    const rpcUrl = (window as any).LAZOR_CONFIG?.rpcUrl || "https://api.devnet.solana.com";

    console.log('[LazorKit] Initiating WebAuthn passkey authentication...');
    console.log('[LazorKit] Config:', { 
      rpcUrl: rpcUrl,
      rpId: window.location.hostname,
      network: 'devnet' 
    });
    
    try {
      // Generate random challenge and user ID
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);
      
      // Trigger REAL browser WebAuthn prompt (FaceID/TouchID/Windows Hello)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Stream.fun",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: `user_${Date.now()}@stream.fun`,
            displayName: "Stream.fun User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },   // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Use device biometrics
            userVerification: "preferred",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (!credential) {
        throw new Error("Passkey creation failed");
      }

      console.log('[LazorKit] WebAuthn credential created:', credential.id.slice(0, 16) + '...');
      
      // Generate a Solana-style wallet address
      const walletAddress = generateMockWalletAddress();
      
      console.log('[LazorKit] Passkey verified, wallet created:', walletAddress.slice(0, 8) + '...');
      
      // Persist to localStorage for session persistence
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ 
        address: walletAddress,
        credentialId: credential.id,
        connectedAt: Date.now(),
      }));
      
      setState({
        isConnected: true,
        isConnecting: false,
        address: walletAddress,
        error: null,
      });
      
      // Add connection logs with realistic timing (simulates on-chain verification)
      addLog('connect');
      setTimeout(() => addLog('policy'), 400);
      setTimeout(() => addLog('paymaster'), 800);
      
    } catch (error) {
      console.error('[LazorKit] WebAuthn error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
    }
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
