/**
 * @fileoverview LazorKit Context Provider
 * @description Provides wallet state and authentication methods to the entire application.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useLazorAuth, LazorAuthState } from '@/hooks/useLazorAuth';
import { useSessionLogs, SessionLog } from '@/hooks/useSessionLogs';
// 1. Import the official SDK Provider
import { LazorkitProvider } from '@lazorkit/wallet'; 

/**
 * Shape of the LazorKit context value
 */
interface LazorKitContextValue extends LazorAuthState {
  logs: string[];
  addLog: (type: SessionLog) => void;
  clearLogs: () => void;
}

const LazorKitContext = createContext<LazorKitContextValue | null>(null);

interface LazorKitProviderProps {
  children: ReactNode;
}

// Helper to safely get the RP ID (Domain) for Vercel vs Localhost
const getRpId = () => {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname; 
};

/**
 * LazorKit Context Provider Component
 */
export const LazorKitProvider: React.FC<LazorKitProviderProps> = ({ children }) => {
  const { logs, addLog, clearLogs } = useSessionLogs();
  const auth = useLazorAuth(addLog);

  const value: LazorKitContextValue = {
    ...auth,
    logs,
    addLog,
    clearLogs,
  };

  return (
    // 2. Initialize the SDK here. This fixes "Missing params".
    <LazorkitProvider
      appName="Stream.fun"      // ⚠️ Required param
      chainId={103}             // ⚠️ Required param (103 = Devnet)
      rpcUrl={import.meta.env.VITE_RPC_URL || "https://api.devnet.solana.com"}
      portalUrl={import.meta.env.VITE_PORTAL_URL || "https://portal.lazor.sh"}
      rpId={getRpId()}          // ⚠️ Binds Passkey to Vercel URL
      configPaymaster={{
        paymasterUrl: "https://kora.devnet.lazorkit.com",
      }}
    >
      {/* Your custom context lives inside the SDK */}
      <LazorKitContext.Provider value={value}>
        {children}
      </LazorKitContext.Provider>
    </LazorkitProvider>
  );
};

/**
 * Hook to access LazorKit wallet context
 */
export const useLazorKit = (): LazorKitContextValue => {
  const context = useContext(LazorKitContext);
  if (!context) {
    throw new Error('useLazorKit must be used within a LazorKitProvider');
  }
  return context;
};

export default LazorKitProvider;
