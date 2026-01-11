import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StreamCounter } from './StreamCounter';
import { formatCompact, formatCurrency } from '@/lib/stream-utils';
import { triggerStreamConfetti } from '@/lib/confetti';
import { Play, Square, Users, DollarSign, Zap } from 'lucide-react';

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

interface CreatorCardProps {
  creator: Creator;
  isSubscribed: boolean;
  streamAmount: number;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  isLoading?: boolean;
  addLog?: (type: 'session' | 'tx' | 'paymaster') => void;
}

export const CreatorCard = ({
  creator,
  isSubscribed,
  streamAmount,
  onSubscribe,
  onUnsubscribe,
  isLoading,
  addLog,
}: CreatorCardProps) => {
  const handleToggle = () => {
    if (isSubscribed) {
      onUnsubscribe();
    } else {
      // Trigger confetti when subscribing!
      triggerStreamConfetti();
      onSubscribe();
      // Add mock logs when subscribing
      if (addLog) {
        setTimeout(() => addLog('session'), 200);
        setTimeout(() => addLog('paymaster'), 500);
        setTimeout(() => addLog('tx'), 800);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card className={`relative overflow-hidden transition-all duration-500 ${
        isSubscribed 
          ? 'border-primary/50 bg-card/90' 
          : 'border-border/50 hover:border-primary/30 bg-card/60'
      }`}>
        {/* Active Stream Glow */}
        {isSubscribed && (
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(ellipse at top, hsl(152 100% 50% / 0.3) 0%, transparent 60%)',
              }}
            />
          </motion.div>
        )}

        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="relative">
              <Avatar className={`h-12 w-12 sm:h-14 sm:w-14 ring-2 transition-all duration-300 ${
                isSubscribed ? 'ring-primary/50' : 'ring-border'
              }`}>
                <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
                <AvatarFallback className="bg-secondary text-base sm:text-lg font-semibold">
                  {creator.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Live Indicator */}
              {isSubscribed && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      '0 0 0 0 hsl(152 100% 50% / 0.4)',
                      '0 0 0 6px hsl(152 100% 50% / 0)',
                      '0 0 0 0 hsl(152 100% 50% / 0.4)',
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{creator.name}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">@{creator.username}</p>
              <Badge variant="secondary" className="mt-1.5 text-xs">
                {creator.category}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {creator.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 hidden sm:block">
              {creator.description}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{formatCompact(creator.monthly_supporters)} subs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formatCompact(creator.total_earned)} earned</span>
            </div>
          </div>

          {/* Stream Counter - THE MAGIC */}
          {isSubscribed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 py-4 sm:py-5 rounded-xl bg-secondary/40 border border-primary/20 flex justify-center"
            >
              <StreamCounter
                amount={streamAmount}
                flowRate={creator.flow_rate}
                isActive={isSubscribed}
                size="md"
                showLabel={false}
              />
            </motion.div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-full transition-all duration-300 font-medium ${
              isSubscribed
                ? 'bg-destructive/90 hover:bg-destructive text-destructive-foreground'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
            }`}
            size="lg"
          >
            {isSubscribed ? (
              <>
                <Square className="h-4 w-4 mr-2 fill-current" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 fill-current" />
                <span className="hidden sm:inline">Stream {formatCurrency(creator.flow_rate * 3600)}/hr</span>
                <span className="sm:hidden">Start Stream</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
