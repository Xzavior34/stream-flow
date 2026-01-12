// src/providers/LazorKitProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useLazorAuth, LazorAuthState } from '@/hooks/useLazorAuth';
import { useSessionLogs, SessionLog } from '@/hooks/useSessionLogs';
import { LazorkitProvider } from '@lazorkit/wallet'; // Ensure this is imported

interface LazorKitContextValue extends LazorAuthState {
  logs: string[];
  addLog: (type: SessionLog) => void;
  clearLogs: () => void;
}

const LazorKitContext = createContext<LazorKitContextValue | null>(null);

/**
 * Helper to get the correct rpId for the current environment
 */
const getRpId = () => {
  if (typeof window === 'undefined') return undefined;
  const hostname = window.location.hostname;
  // If you are on a preview or production Vercel URL, this ensures 
  // the passkey is bound to THAT exact domain.
  return hostname === 'localhost' ? 'localhost' : hostname;
};

export const LazorKitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { logs, addLog, clearLogs } = useSessionLogs();
  const auth = useLazorAuth(addLog);

  const value: LazorKitContextValue = {
    ...auth,
    logs,
    addLog,
    clearLogs,
  };

  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      // ⚠️ THIS LINE IS THE VERCEL FIX
      rpId={getRpId()}
      configPaymaster={{
        paymasterUrl: "https://kora.devnet.lazorkit.com",
      }}
    >
      <LazorKitContext.Provider value={value}>
        {children}
      </LazorKitContext.Provider>
    </LazorkitProvider>
  );
};

export const useLazorKit = (): LazorKitContextValue => {
  const context = useContext(LazorKitContext);
  if (!context) throw new Error('useLazorKit must be used within a LazorKitProvider');
  return context;
};

export default LazorKitProvider;
