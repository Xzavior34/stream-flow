/**
 * @fileoverview Passkey Authentication Button Component
 * @description A reusable button component for WebAuthn passkey authentication.
 * Displays appropriate states for connecting, connected, and error conditions.
 * 
 * @example
 * ```tsx
 * import { PasskeyButton } from '@/components/lazorkit/PasskeyButton';
 * 
 * function LoginPage() {
 *   return (
 *     <PasskeyButton
 *       onConnect={handleConnect}
 *       isConnecting={false}
 *       variant="hero"
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2, Shield } from 'lucide-react';

/**
 * Props for the PasskeyButton component
 */
interface PasskeyButtonProps {
  /** Handler called when the button is clicked */
  onConnect: () => void;
  /** Whether authentication is in progress */
  isConnecting: boolean;
  /** Button visual variant */
  variant?: 'hero' | 'compact' | 'minimal';
  /** Error message to display */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Passkey Authentication Button
 * 
 * @description
 * A styled button that triggers WebAuthn passkey authentication.
 * Features:
 * - Animated glow effect on hover
 * - Loading state with spinner
 * - Error state display
 * - Multiple size variants
 * 
 * @param props - Component props
 * @returns React component
 * 
 * @example
 * ```tsx
 * // Hero variant for landing pages
 * <PasskeyButton onConnect={connect} isConnecting={false} variant="hero" />
 * 
 * // Compact variant for headers
 * <PasskeyButton onConnect={connect} isConnecting={false} variant="compact" />
 * ```
 */
export const PasskeyButton: React.FC<PasskeyButtonProps> = ({
  onConnect,
  isConnecting,
  variant = 'hero',
  error,
  className = '',
}) => {
  const variantStyles = {
    hero: 'text-lg sm:text-xl px-8 sm:px-12 py-6 sm:py-8',
    compact: 'text-sm px-4 py-2',
    minimal: 'text-base px-6 py-3',
  };

  const iconSizes = {
    hero: 'h-5 w-5 sm:h-6 sm:w-6',
    compact: 'h-4 w-4',
    minimal: 'h-5 w-5',
  };

  return (
    <div className="relative">
      {/* Button Glow Effect (Hero only) */}
      {variant === 'hero' && !isConnecting && (
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-50"
          style={{ background: 'hsl(152 100% 50%)' }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        size="lg"
        className={`
          relative bg-primary text-primary-foreground hover:bg-primary/90 
          font-semibold shadow-2xl transition-all duration-300 
          hover:scale-105 active:scale-95
          ${variantStyles[variant]}
          ${className}
        `}
      >
        {isConnecting ? (
          <>
            <Loader2 className={`${iconSizes[variant]} mr-2 sm:mr-3 animate-spin`} />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <Fingerprint className={`${iconSizes[variant]} mr-2 sm:mr-3`} />
            <span className="hidden sm:inline">Sign in with Face ID</span>
            <span className="sm:hidden">Sign in</span>
          </>
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-0 right-0 text-center"
        >
          <p className="text-xs text-destructive flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            {error}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PasskeyButton;
