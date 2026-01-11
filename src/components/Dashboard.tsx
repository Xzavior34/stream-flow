import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { WalletButton } from './WalletButton';
import { CreatorCard } from './CreatorCard';
import { StreamCounter } from './StreamCounter';
import { DevConsole } from './DevConsole';
import { useStreamSubscription } from '@/hooks/useStreamSubscription';
import { Loader2, TrendingUp } from 'lucide-react';

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
    }, 3000);

    return () => clearInterval(interval);
  }, [subscriptions.length, addLog]);

  const handleSubscribe = useCallback(async (creatorId: string, flowRate: number) => {
    try {
      await subscribe(creatorId, flowRate);
      addLog('session');
      setTimeout(() => addLog('paymaster'), 300);
      setTimeout(() => addLog('tx'), 600);
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  }, [subscribe, addLog]);

  const handleUnsubscribe = useCallback(async (creatorId: string) => {
    try {
      await unsubscribe(creatorId);
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  }, [unsubscribe]);

  const activeCount = subscriptions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-neon">Stream</span>
            <span className="text-foreground">.fun</span>
          </h1>
          
          <WalletButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            address={walletAddress}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </header>

      {/* Stats Bar */}
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/30 bg-secondary/10"
        >
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Total Streaming:</span>
            </div>
            <StreamCounter
              amount={totalStreaming}
              flowRate={subscriptions.reduce((sum, s) => sum + s.flow_rate, 0)}
              isActive={true}
              size="lg"
              showLabel={false}
            />
            <div className="text-sm text-muted-foreground">
              to {activeCount} creator{activeCount !== 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Discover Creators</h2>
          <p className="text-muted-foreground">
            Stream micro-payments in real-time. No transactions to sign.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
