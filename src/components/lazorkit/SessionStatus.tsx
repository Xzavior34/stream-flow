/**
 * @fileoverview Session Status Indicator Component
 * @description Displays the current session key status with visual indicators.
 * Shows whether the session is active, the policy limits, and gas sponsorship status.
 * 
 * @example
 * ```tsx
 * import { SessionStatus } from '@/components/lazorkit/SessionStatus';
 * 
 * function Dashboard() {
 *   return (
 *     <SessionStatus
 *       isActive={true}
 *       policyLimit={0.001}
 *       network="devnet"
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Wifi, Shield, Zap } from 'lucide-react';
import { SolanaNetwork } from '@/constants/lazorkit';

/**
 * Props for the SessionStatus component
 */
interface SessionStatusProps {
  /** Whether the session is currently active */
  isActive: boolean;
  /** Policy limit per transaction in USDC */
  policyLimit?: number;
  /** Current network */
  network?: SolanaNetwork;
  /** Compact display mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Session Status Indicator
 * 
 * @description
 * Visual indicator showing:
 * - Connection status with animated pulse
 * - Network name
 * - Gasless indicator
 * - Session key status
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * // Full display
 * <SessionStatus isActive={true} network="devnet" policyLimit={0.001} />
 * 
 * // Compact mode
 * <SessionStatus isActive={true} compact />
 * ```
 */
export const SessionStatus: React.FC<SessionStatusProps> = ({
  isActive,
  policyLimit = 0.001,
  network = 'devnet',
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`}
          animate={isActive ? { 
            opacity: [1, 0.4, 1],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-muted-foreground">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between text-xs ${className}`}>
      {/* Left: Network & Gas */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Cpu className="h-3 w-3" />
        <span className="capitalize">{network}</span>
        <span className="text-border">•</span>
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-primary">Gasless</span>
      </div>

      {/* Right: Session Status */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {isActive && (
          <>
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-primary">{policyLimit} USDC/tx</span>
            <span className="text-border">•</span>
          </>
        )}
        <motion.div
          className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`}
          animate={isActive ? { 
            opacity: [1, 0.4, 1],
            boxShadow: [
              '0 0 0 0 hsl(152 100% 50% / 0.4)',
              '0 0 0 4px hsl(152 100% 50% / 0)',
              '0 0 0 0 hsl(152 100% 50% / 0.4)',
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Wifi className={`h-3 w-3 ${isActive ? 'text-primary' : 'text-muted'}`} />
        <span>{isActive ? 'Session Active' : 'No Session'}</span>
      </div>
    </div>
  );
};

export default SessionStatus;
