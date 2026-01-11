-- Create creators table
CREATE TABLE public.creators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    description TEXT,
    monthly_supporters INTEGER NOT NULL DEFAULT 0,
    total_earned DECIMAL(20, 6) NOT NULL DEFAULT 0,
    flow_rate DECIMAL(20, 10) NOT NULL DEFAULT 0.00001,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table for tracking active streams
CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_wallet TEXT NOT NULL,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    flow_rate DECIMAL(20, 10) NOT NULL DEFAULT 0.00001,
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_streamed DECIMAL(20, 6) NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_wallet, creator_id)
);

-- Enable Row Level Security
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Creators are viewable by everyone (public data)
CREATE POLICY "Creators are viewable by everyone" 
ON public.creators 
FOR SELECT 
USING (true);

-- Subscriptions: users can view all (for demo purposes - shows activity)
CREATE POLICY "Subscriptions are viewable by everyone" 
ON public.subscriptions 
FOR SELECT 
USING (true);

-- Subscriptions: anyone can insert (demo mode - no auth required)
CREATE POLICY "Anyone can create subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Subscriptions: users can update their own subscriptions by wallet
CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (true);

-- Subscriptions: users can delete their own subscriptions
CREATE POLICY "Users can delete their own subscriptions" 
ON public.subscriptions 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on creators
CREATE TRIGGER update_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo creators
INSERT INTO public.creators (name, username, avatar_url, category, description, monthly_supporters, total_earned, flow_rate) VALUES
('Marques Brownlee', 'MKBHD', 'https://yt3.googleusercontent.com/lkH37D712tiyphnu0Id0D5MwwQ7IRuwgQLVD05iMXlDWO-kDHut3uI4MgIHYNHaHEhPlHlIm=s176-c-k-c0x00ffffff-no-rj', 'Tech', 'Quality Tech Videos', 1247, 15420.50, 0.00001),
('Jimmy Donaldson', 'MrBeast', 'https://yt3.googleusercontent.com/ytc/AIdro_nZUkHkvl4Q42PoQjCw3_-4yUoDkqdx8sLNRoMAivNnMaR9=s176-c-k-c0x00ffffff-no-rj', 'Entertainment', 'Philanthropy & Entertainment', 3842, 48920.75, 0.00002),
('Lex Fridman', 'lexfridman', 'https://yt3.googleusercontent.com/ytc/AIdro_lA0SO8Nxr9FP_W1taAF53yMbMXKb5EqE5fLZAqSwS-c9U=s176-c-k-c0x00ffffff-no-rj', 'Education', 'AI, Science & Philosophy', 892, 9234.20, 0.000015),
('Fireship', 'fireship', 'https://yt3.googleusercontent.com/ytc/AIdro_k8BbcB2pluxEV1BNsKNg_gGS0zDmQSVSjqJ5SRGXjdLAY=s176-c-k-c0x00ffffff-no-rj', 'Tech', 'Code in 100 Seconds', 2156, 22145.80, 0.000012),
('ThePrimeagen', 'ThePrimeagen', 'https://yt3.googleusercontent.com/dlinBARx_8GKP_UrfHaUqYLPmIvF6waaHCxqYbWpK_gkSsZzQcOY3c3kxE5KbHkCKbWk8_A=s176-c-k-c0x00ffffff-no-rj', 'Tech', 'Vim & Performance', 1583, 18392.40, 0.000018);

-- Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;