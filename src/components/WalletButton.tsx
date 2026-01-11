import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/lazor-config';
import { Fingerprint, LogOut, Loader2, Wallet } from 'lucide-react';

interface WalletButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletButton = ({
  isConnected,
  isConnecting,
  address,
  onConnect,
  onDisconnect,
}: WalletButtonProps) => {
  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm">{truncateAddress(address, 6)}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-primary text-primary-foreground hover:bg-primary/90 glow-neon"
        size="lg"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Fingerprint className="h-4 w-4 mr-2" />
            Sign in with Passkey
          </>
        )}
      </Button>
    </motion.div>
  );
};
