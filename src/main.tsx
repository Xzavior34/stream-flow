import { Buffer } from 'buffer';

// 1. ⚠️ Global Shim: Guarantees 'Buffer' exists for the SDK
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  
  // 2. ⚠️ FIX FOR "LAZOR_CONFIG is not defined"
  // This injects the missing configuration object that your hooks are looking for.
  // @ts-ignore
  window.LAZOR_CONFIG = {
    chainId: 103, // Devnet
    rpcUrl: "https://api.devnet.solana.com",
    portalUrl: "https://portal.lazor.sh",
    appName: "Stream.fun"
  };
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
