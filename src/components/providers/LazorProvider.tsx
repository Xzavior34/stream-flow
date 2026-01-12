import { ReactNode } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';

interface LazorProviderProps {
  children: ReactNode;
}

export const LazorProvider = ({ children }: LazorProviderProps) => {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://kora.devnet.lazorkit.com",
      }}
    >
      {children}
    </LazorkitProvider>
  );
};
