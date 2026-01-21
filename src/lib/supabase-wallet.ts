/**
 * @fileoverview Supabase client with wallet authentication
 * @description Creates a Supabase client that passes the wallet address in headers
 * for RLS policy validation.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Creates a Supabase client with wallet address in headers
 * This allows RLS policies to verify wallet ownership
 * 
 * @param walletAddress - The user's wallet address to include in requests
 * @returns Supabase client configured with wallet header
 */
export const createWalletClient = (walletAddress: string): SupabaseClient<Database> => {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-wallet-address': walletAddress,
      },
    },
  });
};

/**
 * Default client without wallet authentication
 * Use this only for public data access (e.g., reading creators)
 */
export const supabasePublic = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
