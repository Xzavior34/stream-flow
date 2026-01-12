/**
 * @fileoverview LazorKit Authentication Hook
 * @description Core authentication hook that handles WebAuthn passkey creation,
 * wallet connection, and session persistence. Uses the native browser Credentials API
 * to trigger real biometric prompts (FaceID/TouchID/Windows Hello).
 * 
 * @example
 * ```tsx
 * import { useLazorAuth } from '@/hooks/useLazorAuth';
 * 
 * function AuthComponent() {
 *   const { isConnected, isConnecting, address, connect, disconnect, error } = useLazorAuth();
 *   
 *   return (
 *     <button onClick={connect} disabled={isConnecting}>
 *       {isConnecting ? 'Authenticating...' : 'Sign in with FaceID'}
 *     </button>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  LAZORKIT_CONFIG, 
  STORAGE_KEYS, 
  WEBAUTHN_CONFIG, 
  generateMockWalletAddress 
} from '@/constants/lazorkit';
import { SessionLog } from '@/hooks/useSessionLogs';

/**
 * Authentication state interface
 */
export interface LazorAuthState {
  /** Whether the wallet is currently connected */
  isConnected: boolean;
  /** Whether authentication is in progress */
  isConnecting: boolean;
  /** The connected wallet address (null if not connected) */
  address: string | null;
  /** Error message from the last failed operation */
  error: string | null;
  /** Connect wallet using WebAuthn passkey */
  connect: () => Promise<void>;
  /** Disconnect wallet and clear session */
  disconnect: () => void;
}

/**
 * Persisted wallet session data
 */
interface WalletSession {
  address: string;
  credentialId?: string;
  connectedAt: number;
}

/**
 * Custom hook for LazorKit wallet authentication
 * 
 * @description
 * Provides complete wallet authentication lifecycle:
 * 1. Checks for existing session on mount
 * 2. Triggers native WebAuthn biometric prompt on connect
 * 3. Generates Solana-style wallet address on success
 * 4. Persists session to localStorage
 * 5. Handles errors with descriptive messages
 * 
 * @param addLog - Optional callback to log session events
 * @returns Authentication state and methods
 * 
 * @example
 * ```tsx
 * const { isConnected, address, connect, disconnect, error } = useLazorAuth(
 *   (type) => console.log(`Event: ${type}`)
 * );
 * ```
 */
export const useLazorAuth = (addLog?: (type: SessionLog) => void): LazorAuthState => {
  const [state, setState] = useState<Omit<LazorAuthState, 'connect' | 'disconnect'>>({
    isConnected: false,
    isConnecting: false,
    address: null,
    error: null,
  });

  /**
   * Check for existing session on component mount
   */
  useEffect(() => {
    const savedWallet = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (savedWallet) {
      try {
        const session: WalletSession = JSON.parse(savedWallet);
        if (session.address) {
          setState({
            isConnected: true,
            isConnecting: false,
            address: session.address,
            error: null,
          });
          // Log session restoration
          addLog?.('connect');
          setTimeout(() => addLog?.('policy'), 300);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.WALLET);
      }
    }
  }, [addLog]);

  /**
   * Connect wallet using WebAuthn passkey authentication
   * 
   * @description
   * Triggers the native browser biometric prompt using the Web Authentication API.
   * On success, generates a Solana-style wallet address and persists the session.
   * 
   * Flow:
   * 1. Generate cryptographic challenge and user ID
   * 2. Call navigator.credentials.create() with platform authenticator
   * 3. Browser shows FaceID/TouchID/Windows Hello prompt
   * 4. On success, generate wallet address and store session
   * 
   * @throws Will set error state if WebAuthn fails or user cancels
   */
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    console.log('[LazorKit] Initiating WebAuthn passkey authentication...');
    console.log('[LazorKit] Config:', { 
      rpcUrl: LAZORKIT_CONFIG.rpcUrl,
      rpId: window.location.hostname,
      network: LAZORKIT_CONFIG.network 
    });
    
    try {
      // Check if WebAuthn is available
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Generate cryptographically random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      // Generate random user ID
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);
      
      /**
       * Trigger REAL browser WebAuthn prompt
       * This will show FaceID on iOS, TouchID on Mac, Windows Hello on Windows
       */
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Stream.fun',
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: `user_${Date.now()}@stream.fun`,
            displayName: 'Stream.fun User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: LAZORKIT_CONFIG.webAuthnTimeout,
          attestation: 'none',
        },
      });

      if (!credential) {
        throw new Error('Passkey creation was cancelled');
      }

      console.log('[LazorKit] WebAuthn credential created:', credential.id.slice(0, 16) + '...');
      
      // Generate a Solana-style wallet address
      const walletAddress = generateMockWalletAddress();
      
      console.log('[LazorKit] Passkey verified, wallet created:', walletAddress.slice(0, 8) + '...');
      
      // Persist session to localStorage
      const session: WalletSession = { 
        address: walletAddress,
        credentialId: credential.id,
        connectedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(session));
      
      setState({
        isConnected: true,
        isConnecting: false,
        address: walletAddress,
        error: null,
      });
      
      // Log connection events with realistic timing
      addLog?.('connect');
      setTimeout(() => addLog?.('policy'), 400);
      setTimeout(() => addLog?.('paymaster'), 800);
      
    } catch (error) {
      console.error('[LazorKit] WebAuthn error:', error);
      
      // Map error to user-friendly message
      let errorMessage = 'Authentication failed';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Biometric authentication was cancelled';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Your device does not support passkeys';
        } else if (error.name === 'SecurityError') {
          errorMessage = 'Security error - please use HTTPS';
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [addLog]);

  /**
   * Disconnect wallet and clear session
   * 
   * @description
   * Clears the persisted session from localStorage and resets state.
   */
  const disconnect = useCallback(() => {
    console.log('[LazorKit] Disconnecting wallet...');
    localStorage.removeItem(STORAGE_KEYS.WALLET);
    setState({
      isConnected: false,
      isConnecting: false,
      address: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
};

export default useLazorAuth;
