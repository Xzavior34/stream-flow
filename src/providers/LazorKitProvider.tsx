/**
 * @fileoverview LazorKit Context Provider
 * @description Provides wallet state and authentication methods to the entire application.
 * Uses native WebAuthn for passkey authentication without external SDK dependencies.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useLazorAuth, LazorAuthState } from '@/hooks/useLazorAuth';
import { useSessionLogs, SessionLog } from '@/hooks/useSessionLogs';

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

/**
 * LazorKit Context Provider Component
 * 
 * Provides authentication state and session logging to the entire application.
 * Uses native WebAuthn API for real biometric prompts.
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
    <LazorKitContext.Provider value={value}>
      {children}
    </LazorKitContext.Provider>
  );
};

/**
 * Hook to access LazorKit wallet context
 * 
 * @throws Error if used outside of LazorKitProvider
 * @returns LazorKitContextValue with auth state and logging methods
 */
export const useLazorKit = (): LazorKitContextValue => {
  const context = useContext(LazorKitContext);
  if (!context) {
    throw new Error('useLazorKit must be used within a LazorKitProvider');
  }
  return context;
};

export default LazorKitProvider;
