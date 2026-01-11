import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Fingerprint, Zap, Shield, Coins, Loader2 } from 'lucide-react';

interface LandingHeroProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export const LandingHero = ({ onConnect, isConnecting }: LandingHeroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-background">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 -z-20">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(152 100% 50% / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(152 100% 50% / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 sm:w-[500px] h-64 sm:h-[500px] rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, hsl(152 100% 50% / 0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 sm:w-[400px] h-48 sm:h-[400px] rounded-full -z-10"
        style={{
          background: 'radial-gradient(circle, hsl(180 100% 50% / 0.1) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
        animate={{ 
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-4 sm:mb-6"
      >
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter">
          <motion.span 
            className="text-neon inline-block"
            animate={{ 
              textShadow: [
                '0 0 20px hsl(152 100% 50% / 0.5), 0 0 40px hsl(152 100% 50% / 0.3)',
                '0 0 30px hsl(152 100% 50% / 0.8), 0 0 60px hsl(152 100% 50% / 0.5)',
                '0 0 20px hsl(152 100% 50% / 0.5), 0 0 40px hsl(152 100% 50% / 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Stream
          </motion.span>
          <span className="text-foreground">.fun</span>
        </h1>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-lg sm:text-xl md:text-2xl text-muted-foreground text-center max-w-xs sm:max-w-xl mb-8 sm:mb-12"
      >
        Support creators with{' '}
        <span className="text-primary font-semibold">real-time micro-payments</span>
        <br className="hidden sm:block" />
        <span className="hidden sm:inline"> powered by </span>
        <span className="sm:hidden"> on </span>
        <span className="text-foreground font-medium">Solana</span>
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative"
      >
        {/* Button Glow */}
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-50"
          style={{ background: 'hsl(152 100% 50%)' }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          size="lg"
          className="relative text-lg sm:text-xl px-8 sm:px-12 py-6 sm:py-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Sign in with Face ID
            </>
          )}
        </Button>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-16 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-8 max-w-xs sm:max-w-2xl w-full"
      >
        <FeatureCard
          icon={Zap}
          title="Gasless"
          description="Zero fees"
        />
        <FeatureCard
          icon={Shield}
          title="Passkey"
          description="No seeds"
        />
        <FeatureCard
          icon={Coins}
          title="Real-Time"
          description="Per second"
        />
      </motion.div>

      {/* Tech Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-12 sm:mt-16 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span>Powered by</span>
        <span className="text-primary font-semibold">LazorKit</span>
        <span className="text-muted-foreground/50">•</span>
        <span>Solana Devnet</span>
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
  <motion.div 
    className="flex flex-col items-center text-center p-3 sm:p-5 rounded-xl bg-secondary/30 border border-border/50 backdrop-blur-sm"
    whileHover={{ scale: 1.05, borderColor: 'hsl(152 100% 50% / 0.3)' }}
    transition={{ duration: 0.2 }}
  >
    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 sm:mb-3">
      <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
    </div>
    <h3 className="font-semibold text-sm sm:text-lg">{title}</h3>
    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
  </motion.div>
);
