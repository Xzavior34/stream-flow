// LazorKit Configuration for Stream.fun
// Using Solana Devnet with Paymaster for gasless transactions

export const LAZOR_CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",
  portalUrl: "https://portal.lazor.sh",
  paymasterUrl: "https://kora.devnet.lazorkit.com",
  network: "devnet" as const,
  // CRITICAL FIX: Set rpId to null for preview URLs
  rpId: null as null,
};

// Generate a realistic Solana wallet address (Base58 format, 32-44 chars)
export const generateMockWalletAddress = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  // Solana addresses are typically 32-44 characters
  const length = 43 + Math.floor(Math.random() * 2);
  for (let i = 0; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
};

// Generate unique IDs for mock transactions
const generateTxId = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Mock session key logs for the "Under the Hood" view
export const generateMockLog = (type: 'connect' | 'policy' | 'paymaster' | 'session' | 'tx'): string => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const txId = generateTxId();
  const policyId = Math.random().toString(16).slice(2, 6).toUpperCase();
  const txNum = Math.floor(Math.random() * 9999) + 1;
  const blockNum = Math.floor(Math.random() * 1000000) + 280000000;
  const latency = (Math.random() * 8 + 2).toFixed(1);
  const gasAmount = (Math.random() * 0.00001).toFixed(9);
  
  const logs: Record<typeof type, string> = {
    connect: `[${timestamp}] [LazorKit] WebAuthn passkey verified ✓`,
    policy: `[${timestamp}] [Policy] Session Key #${policyId} | Limit: 0.001 USDC/tx`,
    paymaster: `[${timestamp}] [Paymaster] Gas sponsored: ${gasAmount} SOL | Kora`,
    session: `[${timestamp}] [Session] Auto-signing stream #${txNum}...`,
    tx: `[${timestamp}] [TX] Confirmed ${txId}... | ${latency}ms | Blk ${blockNum}`,
  };
  
  return logs[type];
};

// Truncate wallet address for display
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// Format for copying
export const formatAddressForCopy = (address: string): string => {
  return address;
};
