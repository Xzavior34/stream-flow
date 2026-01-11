import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Fingerprint, Zap, Shield, Coins } from 'lucide-react';

interface LandingHeroProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export const LandingHero = ({ onConnect, isConnecting }: LandingHeroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
          <span className="text-neon">Stream</span>
          <span className="text-foreground">.fun</span>
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-xl md:text-2xl text-muted-foreground text-center max-w-lg mb-12"
      >
        Support your favorite creators with{' '}
        <span className="text-primary font-medium">real-time micro-payments</span>
        {' '}on Solana
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          size="lg"
          className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 glow-neon-intense transition-all duration-300 hover:scale-105"
        >
          <Fingerprint className="h-5 w-5 mr-2" />
          {isConnecting ? 'Connecting...' : 'Sign in with Face ID'}
        </Button>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl"
      >
        <FeatureCard
          icon={Zap}
          title="Gasless"
          description="No transaction fees. Ever."
        />
        <FeatureCard
          icon={Shield}
          title="Passkey Auth"
          description="No seed phrases or extensions."
        />
        <FeatureCard
          icon={Coins}
          title="Real-Time"
          description="Money streams by the second."
        />
      </motion.div>

      {/* Powered By */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-16 text-sm text-muted-foreground"
      >
        Powered by <span className="text-primary font-medium">LazorKit</span> on Solana Devnet
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string; 
}) => (
  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/20 border border-border/50">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
