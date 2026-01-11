import { useLazorWallet } from '@/hooks/useLazorWallet';
import { LandingHero } from '@/components/LandingHero';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const {
    isConnected,
    isConnecting,
    address,
    connect,
    disconnect,
    logs,
    addLog,
  } = useLazorWallet();

  if (!isConnected) {
    return <LandingHero onConnect={connect} isConnecting={isConnecting} />;
  }

  return (
    <Dashboard
      walletAddress={address || ''}
      isConnected={isConnected}
      isConnecting={isConnecting}
      onConnect={connect}
      onDisconnect={disconnect}
      logs={logs}
      addLog={addLog}
    />
  );
};

export default Index;
