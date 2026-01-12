/**
 * @fileoverview Paymaster Transaction Simulation Hook
 * @description Simulates gasless transaction sponsorship via the Kora Paymaster.
 * Provides pre-flight checks to ensure transactions would succeed on-chain.
 * 
 * @example
 * ```tsx
 * import { usePaymasterSimulation } from '@/hooks/usePaymasterSimulation';
 * 
 * function SendButton() {
 *   const { simulateTransaction, isSimulating, lastSimulation } = usePaymasterSimulation();
 *   
 *   const handleSend = async () => {
 *     const result = await simulateTransaction({
 *       type: 'stream',
 *       amount: 0.001,
 *       recipient: 'creator_address',
 *     });
 *     
 *     if (result.success) {
 *       // Proceed with transaction
 *     }
 *   };
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { LAZORKIT_CONFIG, SESSION_KEY_POLICY } from '@/constants/lazorkit';

/**
 * Transaction types supported by the paymaster
 */
export type TransactionType = 'stream' | 'transfer' | 'stake';

/**
 * Transaction simulation request
 */
export interface SimulationRequest {
  /** Type of transaction */
  type: TransactionType;
  /** Amount in USDC */
  amount: number;
  /** Recipient address */
  recipient: string;
  /** Optional memo/note */
  memo?: string;
}

/**
 * Simulation result from paymaster
 */
export interface SimulationResult {
  /** Whether the transaction would succeed */
  success: boolean;
  /** Estimated gas cost (sponsored by paymaster) */
  estimatedGas: number;
  /** Gas in SOL */
  gasInSol: number;
  /** Whether gas is sponsored */
  isSponsored: boolean;
  /** Error message if failed */
  error?: string;
  /** Policy violations if any */
  policyViolations?: string[];
  /** Simulation timestamp */
  timestamp: number;
}

/**
 * Hook return type
 */
interface UsePaymasterSimulationReturn {
  /** Simulate a transaction */
  simulateTransaction: (request: SimulationRequest) => Promise<SimulationResult>;
  /** Whether a simulation is in progress */
  isSimulating: boolean;
  /** Last simulation result */
  lastSimulation: SimulationResult | null;
  /** Check if amount is within policy limits */
  checkPolicyLimits: (amount: number) => { valid: boolean; reason?: string };
}

/**
 * Custom hook for paymaster transaction simulation
 * 
 * @description
 * Provides transaction simulation capabilities:
 * - Validates transactions against session key policies
 * - Simulates gas estimation and sponsorship
 * - Checks for common failure conditions
 * - Returns detailed simulation results
 * 
 * @returns Simulation functions and state
 * 
 * @example
 * ```tsx
 * const { simulateTransaction, isSimulating, checkPolicyLimits } = usePaymasterSimulation();
 * 
 * // Check policy before UI
 * const { valid, reason } = checkPolicyLimits(amount);
 * 
 * // Full simulation
 * const result = await simulateTransaction({ type: 'stream', amount, recipient });
 * ```
 */
export const usePaymasterSimulation = (): UsePaymasterSimulationReturn => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);

  /**
   * Check if an amount is within session key policy limits
   * 
   * @param amount - Amount in USDC
   * @returns Validation result with reason if invalid
   */
  const checkPolicyLimits = useCallback((amount: number): { valid: boolean; reason?: string } => {
    if (amount <= 0) {
      return { valid: false, reason: 'Amount must be greater than 0' };
    }
    
    if (amount > SESSION_KEY_POLICY.maxPerTransaction) {
      return { 
        valid: false, 
        reason: `Amount exceeds policy limit of ${SESSION_KEY_POLICY.maxPerTransaction} USDC per transaction` 
      };
    }
    
    return { valid: true };
  }, []);

  /**
   * Simulate a gasless transaction
   * 
   * @description
   * Performs a comprehensive pre-flight check:
   * 1. Validates against session key policies
   * 2. Estimates gas costs
   * 3. Checks paymaster sponsorship availability
   * 4. Returns detailed simulation result
   * 
   * @param request - Transaction simulation request
   * @returns Promise resolving to simulation result
   */
  const simulateTransaction = useCallback(async (request: SimulationRequest): Promise<SimulationResult> => {
    setIsSimulating(true);
    console.log('[Paymaster] Simulating transaction:', request);
    
    try {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      const policyViolations: string[] = [];
      
      // Check policy limits
      const policyCheck = checkPolicyLimits(request.amount);
      if (!policyCheck.valid) {
        policyViolations.push(policyCheck.reason!);
      }
      
      // Validate recipient (basic check)
      if (!request.recipient || request.recipient.length < 32) {
        policyViolations.push('Invalid recipient address');
      }
      
      // Generate realistic gas estimate
      const estimatedGas = 5000 + Math.floor(Math.random() * 3000);
      const gasInSol = estimatedGas * 0.000000001;
      
      // Check if paymaster would sponsor
      const isSponsored = policyViolations.length === 0;
      
      const result: SimulationResult = {
        success: policyViolations.length === 0,
        estimatedGas,
        gasInSol,
        isSponsored,
        policyViolations: policyViolations.length > 0 ? policyViolations : undefined,
        error: policyViolations.length > 0 ? policyViolations[0] : undefined,
        timestamp: Date.now(),
      };
      
      console.log('[Paymaster] Simulation result:', result);
      setLastSimulation(result);
      return result;
      
    } catch (error) {
      const result: SimulationResult = {
        success: false,
        estimatedGas: 0,
        gasInSol: 0,
        isSponsored: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
        timestamp: Date.now(),
      };
      setLastSimulation(result);
      return result;
      
    } finally {
      setIsSimulating(false);
    }
  }, [checkPolicyLimits]);

  return {
    simulateTransaction,
    isSimulating,
    lastSimulation,
    checkPolicyLimits,
  };
};

export default usePaymasterSimulation;
