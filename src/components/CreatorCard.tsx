import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StreamCounter } from './StreamCounter';
import { formatCompact, formatCurrency } from '@/lib/stream-utils';
import { triggerStreamConfetti } from '@/lib/confetti';
import { Play, Pause, Users, DollarSign } from 'lucide-react';

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
      <Card className={`overflow-hidden transition-all duration-300 ${
        isSubscribed 
          ? 'border-primary/50 glow-neon bg-card/80' 
          : 'border-border/50 hover:border-primary/30'
      }`}>
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-border">
              <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
              <AvatarFallback className="bg-secondary text-sm sm:text-lg">
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{creator.name}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">@{creator.username}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {creator.category}
              </Badge>
            </div>
          </div>

          {/* Description - hidden on very small screens */}
          {creator.description && (
            <p className="hidden sm:block text-sm text-muted-foreground mb-4 line-clamp-2">
              {creator.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatCompact(creator.monthly_supporters)}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatCompact(creator.total_earned)}</span>
            </div>
          </div>

          {/* Stream Counter (only when subscribed) */}
          {isSubscribed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 sm:mb-4 py-3 sm:py-4 rounded-lg bg-secondary/30 flex justify-center"
            >
              <StreamCounter
                amount={streamAmount}
                flowRate={creator.flow_rate}
                isActive={isSubscribed}
                size="sm"
                showLabel={false}
              />
            </motion.div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-full transition-all duration-300 text-sm sm:text-base ${
              isSubscribed
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
            size="lg"
          >
            {isSubscribed ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Stream
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Start Streaming {formatCurrency(creator.flow_rate * 3600)}/hr</span>
                <span className="sm:hidden">Start Stream</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};