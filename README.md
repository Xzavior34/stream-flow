

# 📘 Stream.fun: The Developer's Handbook

> **A Reference Implementation for Next-Gen Solana Payments**

## 📜 Prologue: The Friction Problem

In the current Web3 landscape, supporting a creator usually requires:

1. Downloading a wallet extension.
2. Writing down a 12-word seed phrase.
3. Buying SOL for gas fees.
4. Signing a confusing pop-up.

**Stream.fun** eliminates every single one of these steps. By leveraging the **LazorKit SDK**, we turn the donation process into a single, biometric tap—indistinguishable from a Web2 experience, but powered by the Solana blockchain.

---

## 📖 Chapter 1: The Architecture

Stream.fun is not just a UI; it is a specialized integration of three core layers.

### 1. The Identity Layer (Biometric Passkeys)

Instead of a private key stored in local storage (insecure) or a wallet extension (friction), we use **WebAuthn**.

* **Mechanism:** The user's FaceID or Fingerprint generates a secure signature.
* **Result:** No seed phrases. No "Connect Wallet" pop-ups.

### 2. The Sponsorship Layer (Gasless Paymaster)

We utilize a **LazorKit Paymaster** on the Solana Devnet to sponsor transactions.

* **Mechanism:** The app wraps the user's transaction and sends it to a relayer.
* **Result:** The user never needs to hold SOL to pay for gas.

### 3. The Application Layer (Vite + React)

Built on a high-performance **Vite** stack, optimized for mobile responsiveness and real-time state management via **Zustand**.

---

## 🛠 Chapter 2: Installation & Setup

Follow this guide to replicate the Stream.fun environment locally.

### Prerequisites

* Node.js v18+
* A Vercel Account (for deployment)
* A LazorKit Dashboard Account

### Step 1: The Clone

```bash
git clone https://github.com/Xzavior34/stream-fun.git
cd stream-fun
npm install

```

### Step 2: The Environment

Create a `.env` file in the root directory. You **must** prefix variables with `VITE_` for them to be exposed to the client.

```env
VITE_RPC_URL=https://api.devnet.solana.com
VITE_PORTAL_URL=https://portal.lazor.sh
VITE_CLIENT_KEY=your_lazorkit_public_key_here

```

### Step 3: The Launch

```bash
npm run dev

```

---

## ⚙️ Chapter 3: The "Secret Sauce" (Technical Deep Dive)

This section documents the specific engineering challenges overcome to make the Solana SDK compatible with a modern **Vite** environment. Judges looking for technical depth will find it here.

### 3.1 The Polyfill Strategy

Solana's `@solana/web3.js` library relies on Node.js core modules (`Buffer`, `crypto`) that do not exist in the browser. To prevent the "White Screen of Death," we implemented a custom build pipeline.

**The Fix (`vite.config.ts`):**
We injected the `nodePolyfills` plugin at the *top* of the stack and enforced CommonJS transformation for legacy compatibility.

```typescript
plugins: [
  nodePolyfills({
    globals: { Buffer: true, global: true, process: true },
    protocolImports: true,
  }),
  // ... other plugins
]

```

### 3.2 The Runtime Injection

Even with build-time polyfills, the LazorKit SDK expects certain global variables to exist at runtime. We solved the `LAZOR_CONFIG is not defined` crash by injecting a global shim in the application entry point.

**The Shim (`src/main.tsx`):**

```typescript
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  // 1. Polyfill Buffer for Solana transactions
  window.Buffer = window.Buffer || Buffer;

  // 2. Inject Config for LazorKit Hooks
  window.LAZOR_CONFIG = {
    chainId: 103, // Devnet
    rpcUrl: "https://api.devnet.solana.com",
    portalUrl: "https://portal.lazor.sh",
    appName: "Stream.fun"
  };
}

```

---

## 🚀 Chapter 4: Deployment Guide (Vercel)

Deploying a Passkey-enabled app requires strict domain binding.

1. **Environment Variables:**
Ensure `VITE_RPC_URL` and `VITE_PORTAL_URL` are set in the Vercel Dashboard.
2. **Deployment Protection:**
**Disable "Vercel Authentication"**. Passkeys require a public domain to function; a Vercel login screen will block the hardware biometric prompt.
3. **Domain Binding:**
The code dynamically detects the `rpId` (Relying Party ID) to ensure passkeys generated on `localhost` don't clash with `vercel.app`.

---

## 🏁 Epilogue: Roadmap & Credits

**Stream.fun** is currently live on Solana Devnet.

* **Next Milestone:** Mainnet Beta launch with USDC support.
* **License:** MIT
* **Author:** Xavier ([@Xzavior34](https://www.google.com/search?q=https://github.com/Xzavior34))

> *"The future of payments is invisible."*
