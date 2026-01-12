/**
 * @fileoverview Wallet Display Component
 * @description Displays connected wallet information with disconnect functionality.
 * Shows truncated address with copy capability and disconnect button.
 * 
 * @example
 * ```tsx
 * import { WalletDisplay } from '@/components/lazorkit/WalletDisplay';
 * 
 * function Header() {
 *   return (
 *     <WalletDisplay
 *       address="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
 *       onDisconnect={handleDisconnect}
 *     />
 *   );
 * }
 * ```
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/constants/lazorkit';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

/**
 * Props for the WalletDisplay component
 */
interface WalletDisplayProps {
  /** Full wallet address */
  address: string;
  /** Handler called when disconnect is clicked */
  onDisconnect: () => void;
  /** Whether to show the full address display (desktop) */
  showFullDisplay?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Wallet Display Component
 * 
 * @description
 * Displays the connected wallet with:
 * - Truncated address display
 * - Copy to clipboard functionality
 * - Visual feedback on copy
 * - Disconnect button
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * <WalletDisplay
 *   address={walletAddress}
 *   onDisconnect={() => disconnect()}
 *   showFullDisplay={true}
 * />
 * ```
 */
export const WalletDisplay: React.FC<WalletDisplayProps> = ({
  address,
  onDisconnect,
  showFullDisplay = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  /**
   * Copy wallet address to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      {/* Address Display (Desktop) */}
      {showFullDisplay && (
        <div 
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={handleCopy}
          title="Click to copy address"
        >
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm">{truncateAddress(address, 6)}</span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Mobile Address */}
      {!showFullDisplay && (
        <span className="font-mono text-sm text-muted-foreground">
          {truncateAddress(address, 4)}
        </span>
      )}
      
      {/* Disconnect Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDisconnect}
        className="text-muted-foreground hover:text-destructive"
        title="Disconnect wallet"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default WalletDisplay;
