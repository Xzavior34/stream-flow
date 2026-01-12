/**
 * @fileoverview Gasless Transaction Indicator Component
 * @description Visual indicator showing that transactions are gas-sponsored.
 * Displays paymaster information and estimated gas savings.
 * 
 * @example
 * ```tsx
 * import { GaslessIndicator } from '@/components/lazorkit/GaslessIndicator';
 * 
 * function TransactionCard() {
 *   return (
 *     <GaslessIndicator
 *       estimatedGas={0.000005}
 *       sponsor="Kora"
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Props for the GaslessIndicator component
 */
interface GaslessIndicatorProps {
  /** Estimated gas in SOL that would have been charged */
  estimatedGas?: number;
  /** Name of the paymaster sponsor */
  sponsor?: string;
  /** Whether to show the animated version */
  animated?: boolean;
  /** Visual size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Gasless Transaction Indicator
 * 
 * @description
 * Displays sponsorship information for gasless transactions:
 * - Visual "Gas Free" badge
 * - Sponsor name (e.g., Kora Paymaster)
 * - Optional gas savings estimate
 * - Animated sparkle effect
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * // Simple indicator
 * <GaslessIndicator />
 * 
 * // With details
 * <GaslessIndicator estimatedGas={0.000005} sponsor="Kora" animated />
 * ```
 */
export const GaslessIndicator: React.FC<GaslessIndicatorProps> = ({
  estimatedGas,
  sponsor = 'Kora',
  animated = true,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs gap-1 px-2 py-1',
    md: 'text-sm gap-1.5 px-3 py-1.5',
    lg: 'text-base gap-2 px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <motion.div
      className={`
        inline-flex items-center rounded-full 
        bg-primary/10 border border-primary/20 text-primary
        ${sizeStyles[size]}
        ${className}
      `}
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gas Icon with Strike */}
      <div className="relative">
        <Fuel className={`${iconSizes[size]} opacity-60`} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={animated ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        >
          <div className="w-full h-0.5 bg-primary rotate-45 rounded-full" />
        </motion.div>
      </div>

      <span className="font-medium">Gas Free</span>

      {/* Sponsor Badge */}
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">{sponsor}</span>

      {/* Savings Display */}
      {estimatedGas !== undefined && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary font-mono">
            -{estimatedGas.toFixed(9)} SOL
          </span>
        </>
      )}

      {/* Sparkle Animation */}
      {animated && (
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className={`${iconSizes[size]} text-primary`} />
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Compact success indicator for confirmed transactions
 */
export const TransactionConfirmed: React.FC<{ latencyMs?: number; className?: string }> = ({
  latencyMs,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`inline-flex items-center gap-1.5 text-xs text-primary ${className}`}
  >
    <CheckCircle2 className="h-3.5 w-3.5" />
    <span>Confirmed</span>
    {latencyMs !== undefined && (
      <span className="text-muted-foreground font-mono">{latencyMs}ms</span>
    )}
  </motion.div>
);

export default GaslessIndicator;
