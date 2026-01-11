// LazorKit Configuration for Stream.fun
// Using Solana Devnet with Paymaster for gasless transactions
// This is a MOCK implementation for hackathon demo purposes

export const LAZOR_CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",
  portalUrl: "https://portal.lazor.sh",
  paymasterUrl: "https://kora.devnet.lazorkit.com",
  network: "devnet" as const,
};

// Generate a mock Solana wallet address (Base58 format)
export const generateMockWalletAddress = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
};

// Mock session key logs for the "Under the Hood" view
export const generateMockLog = (type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx'): string => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const randomId = Math.random().toString(16).slice(2, 8);
  const txNum = Math.floor(Math.random() * 9999);
  const blockNum = Math.floor(Math.random() * 1000000) + 250000000;
  
  const logs: Record<typeof type, string> = {
    connect: `[${timestamp}] [LazorKit] Passkey verified via WebAuthn ✓`,
    policy: `[${timestamp}] [Policy] Session Key Active: 0x${randomId}... | max: 0.001 USDC/tx`,
    paymaster: `[${timestamp}] [Paymaster] Gas Sponsored: 0.000005 SOL | Kora Devnet`,
    session: `[${timestamp}] [Session] Auto-signing micro-payment #${txNum}...`,
    tx: `[${timestamp}] [TX] Confirmed: ${(Math.random() * 5 + 1).toFixed(1)}ms latency | Block: ${blockNum}`,
  };
  
  return logs[type];
};

// Truncate wallet address for display
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};