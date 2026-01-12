/**
 * @fileoverview Session Logging Hook
 * @description Manages session activity logs for the developer console.
 * Generates realistic log entries that simulate LazorKit SDK operations.
 * 
 * @example
 * ```tsx
 * import { useSessionLogs } from '@/hooks/useSessionLogs';
 * 
 * function DevConsole() {
 *   const { logs, addLog, clearLogs } = useSessionLogs();
 *   
 *   return (
 *     <div>
 *       {logs.map((log, i) => <p key={i}>{log}</p>)}
 *       <button onClick={() => addLog('tx')}>Simulate TX</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';

/**
 * Types of session log entries
 */
export type SessionLog = 'connect' | 'policy' | 'paymaster' | 'session' | 'tx';

/**
 * Custom hook for managing session activity logs
 * 
 * @description
 * Provides a log management system for displaying session activity
 * in the developer console. Generates formatted log entries with
 * timestamps and realistic transaction data.
 * 
 * @param maxLogs - Maximum number of logs to retain (default: 50)
 * @returns Log state and management functions
 * 
 * @example
 * ```tsx
 * const { logs, addLog, clearLogs } = useSessionLogs(100);
 * 
 * // Add a transaction log
 * addLog('tx');
 * 
 * // Add a custom log message
 * addLogRaw('[Custom] My message');
 * ```
 */
export const useSessionLogs = (maxLogs = 50) => {
  const [logs, setLogs] = useState<string[]>([]);

  /**
   * Generate a formatted timestamp
   */
  const getTimestamp = (): string => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  /**
   * Generate a random transaction ID (Base58-like)
   */
  const generateTxId = (): string => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  /**
   * Generate a realistic log message based on event type
   * 
   * @param type - Type of session event
   * @returns Formatted log string with timestamp and event details
   */
  const generateLogMessage = useCallback((type: SessionLog): string => {
    const timestamp = getTimestamp();
    const txId = generateTxId();
    const policyId = Math.random().toString(16).slice(2, 6).toUpperCase();
    const txNum = Math.floor(Math.random() * 9999) + 1;
    const blockNum = Math.floor(Math.random() * 1000000) + 280000000;
    const latency = (Math.random() * 8 + 2).toFixed(1);
    const gasAmount = (Math.random() * 0.00001).toFixed(9);
    
    const messages: Record<SessionLog, string> = {
      connect: `[${timestamp}] [LazorKit] WebAuthn passkey verified ✓`,
      policy: `[${timestamp}] [Policy] Session Key #${policyId} | Limit: 0.001 USDC/tx`,
      paymaster: `[${timestamp}] [Paymaster] Gas sponsored: ${gasAmount} SOL | Kora`,
      session: `[${timestamp}] [Session] Auto-signing stream #${txNum}...`,
      tx: `[${timestamp}] [TX] Confirmed ${txId}... | ${latency}ms | Blk ${blockNum}`,
    };
    
    return messages[type];
  }, []);

  /**
   * Add a new log entry
   * 
   * @param type - Type of session event to log
   */
  const addLog = useCallback((type: SessionLog) => {
    const log = generateLogMessage(type);
    setLogs(prev => [...prev.slice(-(maxLogs - 1)), log]);
  }, [generateLogMessage, maxLogs]);

  /**
   * Add a raw log message without formatting
   * 
   * @param message - Raw log message string
   */
  const addLogRaw = useCallback((message: string) => {
    const timestamp = getTimestamp();
    setLogs(prev => [...prev.slice(-(maxLogs - 1)), `[${timestamp}] ${message}`]);
  }, [maxLogs]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    addLogRaw,
    clearLogs,
  };
};

export default useSessionLogs;
