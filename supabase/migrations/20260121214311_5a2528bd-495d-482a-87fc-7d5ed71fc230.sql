-- Drop existing overly permissive policies on subscriptions
DROP POLICY IF EXISTS "Subscriptions are viewable by everyone" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;

-- Create a function to get the wallet address from request headers
-- This allows passing wallet via RPC header for authentication
CREATE OR REPLACE FUNCTION public.get_request_wallet()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-wallet-address',
    ''
  );
$$;

-- Create secure RLS policies that check wallet ownership

-- SELECT: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
USING (user_wallet = public.get_request_wallet());

-- INSERT: Users can only create subscriptions for their own wallet
CREATE POLICY "Users can create own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (user_wallet = public.get_request_wallet());

-- UPDATE: Users can only update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (user_wallet = public.get_request_wallet())
WITH CHECK (user_wallet = public.get_request_wallet());

-- DELETE: Users can only delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
ON public.subscriptions
FOR DELETE
USING (user_wallet = public.get_request_wallet());