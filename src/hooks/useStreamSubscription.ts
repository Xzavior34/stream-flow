/**
 * @fileoverview Stream Subscription Hook
 * @description Manages real-time payment streams to creators with secure wallet authentication.
 * Uses wallet-authenticated Supabase client for RLS policy compliance.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createWalletClient } from '@/lib/supabase-wallet';
import { calculateStreamedAmount, DEFAULT_FLOW_RATE } from '@/lib/stream-utils';

interface StreamSubscription {
  id: string;
  creator_id: string;
  started_at: string;
  flow_rate: number;
  is_active: boolean;
  total_streamed: number;
}

interface UseStreamSubscriptionReturn {
  subscriptions: StreamSubscription[];
  activeStreams: Map<string, number>;
  isLoading: boolean;
  subscribe: (creatorId: string, flowRate?: number) => Promise<void>;
  unsubscribe: (creatorId: string) => Promise<void>;
  getStreamAmount: (creatorId: string) => number;
  isSubscribed: (creatorId: string) => boolean;
  totalStreaming: number;
}

/**
 * Hook for managing stream subscriptions with wallet authentication
 * 
 * @param walletAddress - The connected wallet address for authentication
 * @returns Stream subscription state and methods
 */
export const useStreamSubscription = (walletAddress: string | null): UseStreamSubscriptionReturn => {
  const [subscriptions, setSubscriptions] = useState<StreamSubscription[]>([]);
  const [activeStreams, setActiveStreams] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create wallet-authenticated Supabase client
  const supabase = useMemo(() => {
    if (!walletAddress) return null;
    return createWalletClient(walletAddress);
  }, [walletAddress]);

  // Fetch existing subscriptions for this wallet
  useEffect(() => {
    if (!walletAddress || !supabase) {
      setSubscriptions([]);
      setActiveStreams(new Map());
      return;
    }

    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_wallet', walletAddress)
          .eq('is_active', true);

        if (error) throw error;
        setSubscriptions(data || []);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [walletAddress, supabase]);

  // Update stream amounts every 100ms for smooth animation
  useEffect(() => {
    if (subscriptions.length === 0) {
      setActiveStreams(new Map());
      return;
    }

    const updateStreams = () => {
      const newStreams = new Map<string, number>();
      
      subscriptions.forEach(sub => {
        if (sub.is_active) {
          const startTime = new Date(sub.started_at);
          const amount = calculateStreamedAmount(startTime, sub.flow_rate);
          newStreams.set(sub.creator_id, amount + sub.total_streamed);
        }
      });
      
      setActiveStreams(newStreams);
    };

    updateStreams();
    intervalRef.current = setInterval(updateStreams, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [subscriptions]);

  const subscribe = useCallback(async (creatorId: string, flowRate = DEFAULT_FLOW_RATE) => {
    if (!walletAddress || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_wallet: walletAddress,
          creator_id: creatorId,
          flow_rate: flowRate,
          is_active: true,
          started_at: new Date().toISOString(),
          total_streamed: 0,
        }, {
          onConflict: 'user_wallet,creator_id',
        })
        .select()
        .single();

      if (error) throw error;

      setSubscriptions(prev => {
        const filtered = prev.filter(s => s.creator_id !== creatorId);
        return [...filtered, data];
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  }, [walletAddress, supabase]);

  const unsubscribe = useCallback(async (creatorId: string) => {
    if (!walletAddress || !supabase) return;

    try {
      const currentAmount = activeStreams.get(creatorId) || 0;

      const { error } = await supabase
        .from('subscriptions')
        .update({
          is_active: false,
          total_streamed: currentAmount,
        })
        .eq('user_wallet', walletAddress)
        .eq('creator_id', creatorId);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(s => s.creator_id !== creatorId));
      setActiveStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(creatorId);
        return newMap;
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }, [walletAddress, supabase, activeStreams]);

  const getStreamAmount = useCallback((creatorId: string): number => {
    return activeStreams.get(creatorId) || 0;
  }, [activeStreams]);

  const isSubscribed = useCallback((creatorId: string): boolean => {
    return subscriptions.some(s => s.creator_id === creatorId && s.is_active);
  }, [subscriptions]);

  const totalStreaming = Array.from(activeStreams.values()).reduce((sum, val) => sum + val, 0);

  return {
    subscriptions,
    activeStreams,
    isLoading,
    subscribe,
    unsubscribe,
    getStreamAmount,
    isSubscribed,
    totalStreaming,
  };
};
