import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/stream-utils';

interface StreamCounterProps {
  amount: number;
  flowRate: number;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl md:text-7xl',
};

export const StreamCounter = ({ 
  amount, 
  flowRate, 
  isActive, 
  size = 'lg',
  showLabel = true 
}: StreamCounterProps) => {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [particles, setParticles] = useState<number[]>([]);
  const prevAmountRef = useRef(amount);
  const particleIdRef = useRef(0);

  // Smooth animation of the counter
  useEffect(() => {
    if (!isActive) {
      setDisplayAmount(amount);
      return;
    }

    const interval = setInterval(() => {
      setDisplayAmount(prev => prev + flowRate * 0.1); // 100ms updates
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, flowRate, amount]);

  // Sync with actual amount periodically
  useEffect(() => {
    setDisplayAmount(amount);
  }, [amount]);

  // Generate particles on amount change
  useEffect(() => {
    if (isActive && amount > prevAmountRef.current) {
      const newParticleId = particleIdRef.current++;
      setParticles(prev => [...prev.slice(-5), newParticleId]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(id => id !== newParticleId));
      }, 1000);
    }
    prevAmountRef.current = amount;
  }, [amount, isActive]);

  const formattedAmount = formatCurrency(displayAmount);
  const digits = formattedAmount.split('');

  return (
    <div className="relative flex flex-col items-center">
      {/* Particles */}
      <AnimatePresence>
        {particles.map((id) => (
          <motion.div
            key={id}
            className="absolute pointer-events-none"
            initial={{ 
              opacity: 1, 
              scale: 1,
              x: Math.random() * 40 - 20,
              y: 0 
            }}
            animate={{ 
              opacity: 0, 
              scale: 0,
              y: -60,
              x: Math.random() * 80 - 40
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Counter */}
      <motion.div
        className={`font-mono-stream font-bold ${sizeClasses[size]} ${isActive ? 'text-neon animate-pulse-neon' : 'text-muted-foreground'}`}
        animate={isActive ? {
          textShadow: [
            '0 0 10px hsl(152 100% 50% / 0.8), 0 0 20px hsl(152 100% 50% / 0.5)',
            '0 0 20px hsl(152 100% 50% / 1), 0 0 40px hsl(152 100% 50% / 0.7)',
            '0 0 10px hsl(152 100% 50% / 0.8), 0 0 20px hsl(152 100% 50% / 0.5)',
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="inline-flex">
          {digits.map((digit, i) => (
            <motion.span
              key={`${i}-${digit}`}
              initial={{ opacity: 0.8, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          ))}
        </span>
        <span className="text-muted-foreground ml-2 text-[0.4em]">USDC</span>
      </motion.div>

      {/* Flow Rate Label */}
      {showLabel && isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span>Streaming {formatCurrency(flowRate * 60)}/min</span>
        </motion.div>
      )}

      {/* Glow Effect Behind */}
      {isActive && (
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(152 100% 50%) 0%, transparent 70%)' }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};
