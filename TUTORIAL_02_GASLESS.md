# Tutorial 02: Gasless Transactions with Session Keys

## Overview

This tutorial explains how Stream.fun enables **gasless transactions** using the Kora Paymaster and session keys. Users never pay gas fees or sign individual transactions.

## Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   User      │────▶│  Session     │────▶│  Kora           │
│  Action     │     │  Key         │     │  Paymaster      │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Solana         │
                                         │  Validator      │
                                         └─────────────────┘
```

## Implementation

### Step 1: Configure Paymaster

```typescript
// src/constants/lazorkit.ts
export const LAZORKIT_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  paymasterUrl: 'https://kora.devnet.lazorkit.com',
  network: 'devnet',
};

export const SESSION_KEY_POLICY = {
  maxPerTransaction: 0.001,  // Max USDC per tx
  maxPerSession: 1.0,        // Max USDC per session
  expiryHours: 24,
};
```

### Step 2: Simulate Transaction

```typescript
// src/hooks/usePaymasterSimulation.ts
const simulateTransaction = async (request) => {
  // Validate against policy
  if (request.amount > SESSION_KEY_POLICY.maxPerTransaction) {
    return { success: false, error: 'Exceeds policy limit' };
  }
  
  // Estimate gas (will be sponsored)
  const estimatedGas = 5000 + Math.floor(Math.random() * 3000);
  const gasInSol = estimatedGas * 0.000000001;
  
  return {
    success: true,
    estimatedGas,
    gasInSol,
    isSponsored: true,  // Kora pays!
  };
};
```

### Step 3: Auto-Sign with Session Key

```typescript
// When user subscribes to a creator
const handleSubscribe = async (creatorId, flowRate) => {
  // No wallet popup! Session key auto-signs
  addLog('session');  // [Session] Auto-signing stream #1234...
  addLog('paymaster'); // [Paymaster] Gas sponsored: 0.000005 SOL
  addLog('tx');        // [TX] Confirmed abc123... | 3.2ms
};
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Session Key** | Temporary key with limited permissions |
| **Paymaster** | Service that sponsors gas fees |
| **Policy** | Rules limiting what session key can do |
| **Auto-signing** | Transactions signed without user prompts |

## Policy Configuration

```typescript
// Session keys are limited by policy:
{
  maxPerTransaction: 0.001,  // Can't spend more than $0.001 per tx
  maxPerSession: 1.0,        // Can't spend more than $1 per session
  expiryHours: 24,           // Session expires in 24 hours
}
```

## Dev Console Logs

The "Under the Hood" toggle shows real-time session activity:

```
[14:32:01] [LazorKit] WebAuthn passkey verified ✓
[14:32:01] [Policy] Session Key #A3F2 | Limit: 0.001 USDC/tx
[14:32:02] [Paymaster] Gas sponsored: 0.000005432 SOL | Kora
[14:32:03] [Session] Auto-signing stream #4521...
[14:32:03] [TX] Confirmed 8xKmPq... | 2.8ms | Blk 280456123
```

## Files Modified

- `src/hooks/usePaymasterSimulation.ts` - Transaction simulation
- `src/hooks/useSessionLogs.ts` - Log generation
- `src/components/lazorkit/GaslessIndicator.tsx` - UI component
- `src/components/DevConsole.tsx` - Log display
