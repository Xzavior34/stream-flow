# Tutorial 01: Passkey Authentication with LazorKit

## Overview

This tutorial explains how Stream.fun implements **passwordless authentication** using WebAuthn passkeys. Users authenticate with FaceID, TouchID, or Windows Hello - no seed phrases required.

## Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│   WebAuthn   │────▶│  LazorKit       │
│  (FaceID)   │     │   Prompt     │     │  Portal         │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Solana Wallet  │
                                         │  (Derived Key)  │
                                         └─────────────────┘
```

## Implementation

### Step 1: Configure WebAuthn

```typescript
// src/constants/lazorkit.ts
export const WEBAUTHN_CONFIG = {
  pubKeyCredParams: [
    { alg: -7, type: 'public-key' },   // ES256 (ECDSA with P-256)
    { alg: -257, type: 'public-key' }, // RS256
  ],
  authenticatorSelection: {
    authenticatorAttachment: 'platform', // Use device biometrics
    userVerification: 'preferred',
    residentKey: 'preferred',
  },
  attestation: 'none',
};
```

### Step 2: Trigger Biometric Prompt

```typescript
// src/hooks/useLazorAuth.ts
const connect = async () => {
  // Generate cryptographic challenge
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  
  // Trigger REAL browser biometric prompt
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: 'Stream.fun',
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: `user_${Date.now()}@stream.fun`,
        displayName: 'Stream.fun User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      timeout: 60000,
    },
  });
  
  // Credential created! User authenticated via FaceID/TouchID
  console.log('Passkey created:', credential.id);
};
```

### Step 3: Persist Session

```typescript
localStorage.setItem('wallet_session', JSON.stringify({
  address: walletAddress,
  credentialId: credential.id,
  connectedAt: Date.now(),
}));
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **WebAuthn** | W3C standard for passwordless authentication |
| **Platform Authenticator** | Device's built-in biometrics (FaceID/TouchID) |
| **Challenge** | Random bytes to prevent replay attacks |
| **Credential** | Public key stored by the authenticator |

## Error Handling

```typescript
try {
  await navigator.credentials.create({ publicKey: options });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User cancelled biometric prompt
  } else if (error.name === 'NotSupportedError') {
    // Device doesn't support passkeys
  }
}
```

## Files Modified

- `src/hooks/useLazorAuth.ts` - Core authentication logic
- `src/constants/lazorkit.ts` - WebAuthn configuration
- `src/components/lazorkit/PasskeyButton.tsx` - UI component
