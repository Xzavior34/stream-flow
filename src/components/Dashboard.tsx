import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { WalletButton } from './WalletButton';
import { CreatorCard } from './CreatorCard';
import { StreamCounter } from './StreamCounter';
import { DevConsole } from './DevConsole';
import { useStreamSubscription } from '@/hooks/useStreamSubscription';
import { triggerMoneyRain } from '@/lib/confetti';
import { Loader2, TrendingUp, Sparkles } from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  category: string;
  description: string | null;
  monthly_supporters: number;
  total_earned: number;
  flow_rate: number;
}

interface DashboardProps {
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  logs: string[];
  addLog: (type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx') => void;
}

export const Dashboard = ({
  walletAddress,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
  logs,
  addLog,
}: DashboardProps) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const {
    subscriptions,
    isSubscribed,
    getStreamAmount,
    subscribe,
    unsubscribe,
    totalStreaming,
  } = useStreamSubscription(walletAddress);

  // Fetch creators
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .order('monthly_supporters', { ascending: false });

        if (error) throw error;
        setCreators(data || []);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Add periodic logs when streaming
  useEffect(() => {
    if (subscriptions.length === 0) return;

    const interval = setInterval(() => {
      const logTypes: ('session' | 'tx')[] = ['session', 'tx'];
      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
      addLog(randomType);
    }, 2500);

    return () => clearInterval(interval);
  }, [subscriptions.length, addLog]);

  const handleSubscribe = useCallback(async (creatorId: string, flowRate: number) => {
    try {
      await subscribe(creatorId, flowRate);
      addLog('session');
      setTimeout(() => addLog('paymaster'), 300);
      setTimeout(() => addLog('tx'), 600);
      // Trigger money rain for first subscription
      if (subscriptions.length === 0) {
        setTimeout(() => triggerMoneyRain(), 500);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  }, [subscribe, addLog, subscriptions.length]);

  const handleUnsubscribe = useCallback(async (creatorId: string) => {
    try {
      await unsubscribe(creatorId);
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  }, [unsubscribe]);

  const activeCount = subscriptions.length;
  const totalFlowRate = subscriptions.reduce((sum, s) => sum + s.flow_rate, 0);

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <motion.h1 
            className="text-xl sm:text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-neon">Stream</span>
            <span className="text-foreground">.fun</span>
          </motion.h1>
          
          <WalletButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            address={walletAddress}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </header>

      {/* Hero Stats Section - Only when streaming */}
      {activeCount > 0 && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative border-b border-border/20 bg-gradient-to-b from-primary/5 to-transparent"
        >
          {/* Background Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center top, hsl(152 100% 50% / 0.08) 0%, transparent 50%)',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center gap-4 sm:gap-6 relative">
            {/* Label */}
            <motion.div 
              className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Total Streaming to {activeCount} Creator{activeCount !== 1 ? 's' : ''}</span>
            </motion.div>

            {/* The Main Counter - THE WOW FACTOR */}
            <StreamCounter
              amount={totalStreaming}
              flowRate={totalFlowRate}
              isActive={true}
              size="hero"
              showLabel={true}
            />

            {/* Magic Indicator */}
            <motion.div
              className="flex items-center gap-2 text-xs sm:text-sm text-primary/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">Session Key Auto-Signing</span>
              <span className="text-muted-foreground">• No transactions to approve</span>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">
            {activeCount > 0 ? 'Your Creators' : 'Discover Creators'}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {activeCount > 0 
              ? 'Manage your real-time payment streams'
              : 'Stream micro-payments in real-time. No transactions to sign.'
            }
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <CreatorCard
                  creator={creator}
                  isSubscribed={isSubscribed(creator.id)}
                  streamAmount={getStreamAmount(creator.id)}
                  onSubscribe={() => handleSubscribe(creator.id, creator.flow_rate)}
                  onUnsubscribe={() => handleUnsubscribe(creator.id)}
                  addLog={addLog}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Dev Console */}
      <DevConsole
        logs={logs}
        isOpen={isConsoleOpen}
        onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
      />
    </div>
  );
};
