/**
 * @fileoverview LazorKit Context Provider
 * @description Provides wallet state and authentication methods to the entire application.
 * This provider wraps the app and makes LazorKit wallet functionality available via React context.
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * import { LazorKitProvider } from '@/providers/LazorKitProvider';
 * 
 * function App() {
 *   return (
 *     <LazorKitProvider>
 *       <YourApp />
 *     </LazorKitProvider>
 *   );
 * }
 * 
 * // In any component
 * import { useLazorKit } from '@/providers/LazorKitProvider';
 * 
 * function MyComponent() {
 *   const { isConnected, address, connect, disconnect } = useLazorKit();
 *   // ...
 * }
 * ```
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useLazorAuth, LazorAuthState } from '@/hooks/useLazorAuth';
import { useSessionLogs, SessionLog } from '@/hooks/useSessionLogs';

/**
 * Shape of the LazorKit context value
 */
interface LazorKitContextValue extends LazorAuthState {
  /** Session activity logs for dev console */
  logs: string[];
  /** Add a new log entry */
  addLog: (type: SessionLog) => void;
  /** Clear all logs */
  clearLogs: () => void;
}

const LazorKitContext = createContext<LazorKitContextValue | null>(null);

interface LazorKitProviderProps {
  children: ReactNode;
}

/**
 * LazorKit Context Provider Component
 * 
 * @description
 * Wraps the application and provides:
 * - Wallet connection state (isConnected, address, isConnecting)
 * - Authentication methods (connect, disconnect)
 * - Session logging for the developer console
 * 
 * @param props.children - Child components to wrap
 * 
 * @example
 * ```tsx
 * <LazorKitProvider>
 *   <App />
 * </LazorKitProvider>
 * ```
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
 * @throws {Error} If used outside of LazorKitProvider
 * @returns LazorKit context value with auth state and methods
 * 
 * @example
 * ```tsx
 * function WalletStatus() {
 *   const { isConnected, address, connect, disconnect } = useLazorKit();
 *   
 *   if (isConnected) {
 *     return <button onClick={disconnect}>Disconnect {address}</button>;
 *   }
 *   
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 * ```
 */
export const useLazorKit = (): LazorKitContextValue => {
  const context = useContext(LazorKitContext);
  if (!context) {
    throw new Error('useLazorKit must be used within a LazorKitProvider');
  }
  return context;
};

export default LazorKitProvider;
