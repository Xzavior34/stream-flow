import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/stream-utils';

interface StreamCounterProps {
  amount: number;
  flowRate: number;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-4xl sm:text-5xl',
  xl: 'text-5xl sm:text-6xl md:text-7xl',
  hero: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
};

const dollarSizeClasses = {
  sm: 'text-sm sm:text-base',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
  xl: 'text-2xl sm:text-3xl',
  hero: 'text-3xl sm:text-4xl md:text-5xl',
};

export const StreamCounter = ({ 
  amount, 
  flowRate, 
  isActive, 
  size = 'lg',
  showLabel = true 
}: StreamCounterProps) => {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const prevAmountRef = useRef(amount);
  const particleIdRef = useRef(0);

  // Smooth animation of the counter - update every 50ms for ultra-smooth ticking
  useEffect(() => {
    if (!isActive) {
      setDisplayAmount(amount);
      return;
    }

    const interval = setInterval(() => {
      setDisplayAmount(prev => prev + flowRate * 0.05); // 50ms updates
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, flowRate, amount]);

  // Sync with actual amount periodically
  useEffect(() => {
    setDisplayAmount(amount);
  }, [amount]);

  // Generate particles on significant amount changes
  useEffect(() => {
    if (isActive && Math.floor(amount * 10000) > Math.floor(prevAmountRef.current * 10000)) {
      const newParticleId = particleIdRef.current++;
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 20 - 10;
      setParticles(prev => [...prev.slice(-8), { id: newParticleId, x: randomX, y: randomY }]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticleId));
      }, 1200);
    }
    prevAmountRef.current = amount;
  }, [amount, isActive]);

  const formattedAmount = formatCurrency(displayAmount);
  
  // Split into dollar sign, digits before decimal, decimal, and digits after
  const dollarSign = formattedAmount.charAt(0);
  const rest = formattedAmount.slice(1);
  const [wholePart, decimalPart] = rest.split('.');
  
  // Memoize the digit rendering for better performance
  const digits = useMemo(() => {
    const allDigits = rest.replace('.', '').split('');
    return allDigits;
  }, [rest]);

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Floating Particles */}
      <AnimatePresence>
        {particles.map(({ id, x, y }) => (
          <motion.div
            key={id}
            className="absolute pointer-events-none z-10"
            initial={{ 
              opacity: 1, 
              scale: 1,
              x: x * 0.5,
              y: y 
            }}
            animate={{ 
              opacity: 0, 
              scale: 0.3,
              y: -80 - Math.random() * 40,
              x: x
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(152_100%_50%)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Counter */}
      <motion.div
        className={`font-mono-stream font-bold tracking-tight ${sizeClasses[size]} ${isActive ? 'text-neon' : 'text-muted-foreground'}`}
        initial={false}
      >
        {/* Dollar Sign */}
        <motion.span 
          className={`${dollarSizeClasses[size]} text-muted-foreground mr-1 align-top`}
          animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {dollarSign}
        </motion.span>
        
        {/* Main Digits Container */}
        <span className="inline-flex items-baseline">
          {/* Whole part */}
          {wholePart.split('').map((digit, i) => (
            <motion.span
              key={`whole-${i}-${digit}`}
              className="inline-block"
              initial={{ opacity: 0.8, y: 2 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                textShadow: isActive 
                  ? '0 0 20px hsl(152 100% 50% / 0.9), 0 0 40px hsl(152 100% 50% / 0.5)'
                  : 'none'
              }}
              transition={{ duration: 0.1 }}
            >
              {digit}
            </motion.span>
          ))}
          
          {/* Decimal Point */}
          {decimalPart && (
            <motion.span 
              className="text-muted-foreground"
              animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              .
            </motion.span>
          )}
          
          {/* Decimal Digits - these are the ones that tick! */}
          {decimalPart?.split('').map((digit, i) => (
            <motion.span
              key={`dec-${i}-${digit}-${Math.floor(displayAmount * 100000000)}`}
              className="inline-block"
              initial={{ opacity: 0.6, scale: 1.1, y: -2 }}
              animate={{ 
                opacity: i < 4 ? 1 : 0.7, 
                scale: 1, 
                y: 0,
                textShadow: isActive && i < 4
                  ? '0 0 15px hsl(152 100% 50% / 0.8), 0 0 30px hsl(152 100% 50% / 0.4)'
                  : 'none'
              }}
              transition={{ duration: 0.05 }}
              style={{ 
                color: isActive && i >= 4 ? 'hsl(152 100% 50% / 0.6)' : undefined,
                fontSize: i >= 4 ? '0.85em' : undefined,
              }}
            >
              {digit}
            </motion.span>
          ))}
        </span>
        
        {/* USDC Label */}
        <motion.span 
          className="text-muted-foreground ml-2 sm:ml-3 text-[0.25em] sm:text-[0.3em] font-medium tracking-wider"
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.6 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          USDC
        </motion.span>
      </motion.div>

      {/* Flow Rate Indicator */}
      {showLabel && isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
        >
          {/* Animated Pulse Indicator */}
          <div className="relative">
            <motion.div
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary"
              animate={{ 
                scale: [1, 1.3, 1], 
                opacity: [1, 0.7, 1],
                boxShadow: [
                  '0 0 0 0 hsl(152 100% 50% / 0.4)',
                  '0 0 0 8px hsl(152 100% 50% / 0)',
                  '0 0 0 0 hsl(152 100% 50% / 0.4)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          
          <span className="font-mono-stream">
            <span className="text-primary font-semibold">+{formatCurrency(flowRate * 60)}</span>
            <span className="text-muted-foreground">/min</span>
          </span>
        </motion.div>
      )}

      {/* Background Glow Effect */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 -z-10 blur-[60px] sm:blur-[80px] opacity-20"
            style={{ 
              background: 'radial-gradient(ellipse at center, hsl(152 100% 50%) 0%, transparent 70%)',
              transform: 'scale(1.5)',
            }}
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 -z-20 blur-[100px] sm:blur-[120px] opacity-10"
            style={{ 
              background: 'radial-gradient(ellipse at center, hsl(180 100% 50%) 0%, transparent 70%)',
              transform: 'scale(2)',
            }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  );
};
