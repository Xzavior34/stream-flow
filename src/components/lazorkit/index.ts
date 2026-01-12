/**
 * @fileoverview LazorKit UI Components Barrel Export
 * @description Central export point for all LazorKit-specific UI components.
 * Import from this file to access passkey authentication, wallet display,
 * session status, and gasless transaction indicator components.
 * 
 * @example
 * ```tsx
 * import {
 *   PasskeyButton,
 *   WalletDisplay,
 *   SessionStatus,
 *   GaslessIndicator,
 * } from '@/components/lazorkit';
 * 
 * function App() {
 *   return (
 *     <>
 *       <PasskeyButton onConnect={connect} isConnecting={false} />
 *       <WalletDisplay address={address} onDisconnect={disconnect} />
 *       <SessionStatus isActive={true} />
 *       <GaslessIndicator sponsor="Kora" />
 *     </>
 *   );
 * }
 * ```
 */

export { PasskeyButton } from './PasskeyButton';
export { WalletDisplay } from './WalletDisplay';
export { SessionStatus } from './SessionStatus';
export { GaslessIndicator, TransactionConfirmed } from './GaslessIndicator';
