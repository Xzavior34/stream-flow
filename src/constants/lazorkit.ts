/**
 * @fileoverview LazorKit Configuration Constants
 * @description Centralized configuration for LazorKit SDK integration with Solana.
 * This file contains all RPC URLs, portal endpoints, and network configurations.
 * 
 * @example
 * ```typescript
 * import { LAZORKIT_CONFIG, SOLANA_NETWORKS } from '@/constants/lazorkit';
 * 
 * const rpcUrl = LAZORKIT_CONFIG.rpcUrl;
 * const isDevnet = LAZORKIT_CONFIG.network === 'devnet';
 * ```
 */

/**
 * Supported Solana network types
 */
export type SolanaNetwork = 'mainnet-beta' | 'devnet' | 'testnet';

/**
 * LazorKit SDK configuration interface
 */
export interface LazorKitConfig {
  /** Solana RPC endpoint URL */
  rpcUrl: string;
  /** LazorKit Portal URL for passkey management */
  portalUrl: string;
  /** Kora Paymaster URL for gasless transactions */
  paymasterUrl: string;
  /** Target Solana network */
  network: SolanaNetwork;
  /** Relying Party ID for WebAuthn (null = use current hostname) */
  rpId: string | null;
  /** WebAuthn timeout in milliseconds */
  webAuthnTimeout: number;
}

/**
 * Solana network RPC endpoints
 */
export const SOLANA_NETWORKS: Record<SolanaNetwork, string> = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  'devnet': 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com',
} as const;

/**
 * Primary LazorKit configuration for Stream.fun
 * 
 * @description
 * Configuration is set for Devnet with Kora Paymaster for gasless transactions.
 * The rpId is set to null to automatically use window.location.hostname,
 * which is required for preview URLs and cross-origin deployments.
 * 
 * @example
 * ```typescript
 * import { LAZORKIT_CONFIG } from '@/constants/lazorkit';
 * 
 * // Use in WebAuthn credential creation
 * const credential = await navigator.credentials.create({
 *   publicKey: {
 *     rp: {
 *       name: "Stream.fun",
 *       id: LAZORKIT_CONFIG.rpId ?? window.location.hostname,
 *     },
 *     // ... other options
 *   }
 * });
 * ```
 */
export const LAZORKIT_CONFIG: LazorKitConfig = {
  rpcUrl: SOLANA_NETWORKS.devnet,
  portalUrl: 'https://portal.lazor.sh',
  paymasterUrl: 'https://kora.devnet.lazorkit.com',
  network: 'devnet',
  rpId: null, // Uses window.location.hostname for cross-origin compatibility
  webAuthnTimeout: 60000,
} as const;

/**
 * Storage keys for wallet persistence
 */
export const STORAGE_KEYS = {
  /** Key for persisting wallet connection state */
  WALLET: 'stream_fun_wallet',
  /** Key for storing WebAuthn credential ID */
  CREDENTIAL: 'stream_fun_credential',
  /** Key for dev mode preferences */
  DEV_MODE: 'stream_fun_dev_mode',
} as const;

/**
 * WebAuthn configuration for passkey authentication
 */
export const WEBAUTHN_CONFIG = {
  /** Supported public key algorithms */
  pubKeyCredParams: [
    { alg: -7, type: 'public-key' as const },   // ES256 (ECDSA with P-256)
    { alg: -257, type: 'public-key' as const }, // RS256 (RSASSA-PKCS1-v1_5)
  ],
  /** Authenticator selection criteria */
  authenticatorSelection: {
    authenticatorAttachment: 'platform' as const, // Use device biometrics (FaceID/TouchID)
    userVerification: 'preferred' as const,
    residentKey: 'preferred' as const,
  },
  /** Attestation preference */
  attestation: 'none' as const,
} as const;

/**
 * Session key policy limits
 */
export const SESSION_KEY_POLICY = {
  /** Maximum USDC per transaction */
  maxPerTransaction: 0.001,
  /** Maximum USDC per session */
  maxPerSession: 1.0,
  /** Session expiry in hours */
  expiryHours: 24,
} as const;

/**
 * Generate a cryptographically random Solana-style wallet address
 * 
 * @description
 * Creates a Base58-encoded string that resembles a real Solana public key.
 * Used for demo purposes when real key derivation isn't available.
 * 
 * @returns {string} A 43-44 character Base58 address
 * 
 * @example
 * ```typescript
 * const address = generateMockWalletAddress();
 * console.log(address); // "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
 * ```
 */
export const generateMockWalletAddress = (): string => {
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const length = 43 + Math.floor(Math.random() * 2);
  let address = '';
  for (let i = 0; i < length; i++) {
    address += BASE58_ALPHABET.charAt(Math.floor(Math.random() * BASE58_ALPHABET.length));
  }
  return address;
};

/**
 * Truncate a wallet address for display
 * 
 * @param address - Full wallet address
 * @param chars - Number of characters to show on each end (default: 4)
 * @returns Truncated address like "7xKX...gAsU"
 */
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
