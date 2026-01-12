import { Buffer } from 'buffer';

// ⚠️ CRITICAL: Global Shim for Solana SDK
// This prevents the "Uncaught ReferenceError: Buffer is not defined" crash
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
