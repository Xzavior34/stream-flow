// Stream calculation utilities

// Default flow rate: $0.00001 USDC per second
export const DEFAULT_FLOW_RATE = 0.00001;

// Calculate streamed amount based on elapsed time
export const calculateStreamedAmount = (
  startTime: Date,
  flowRate: number = DEFAULT_FLOW_RATE
): number => {
  const now = new Date();
  const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
  return elapsedSeconds * flowRate;
};

// Format USDC amount with proper decimal places
export const formatUSDC = (amount: number, decimals = 8): string => {
  return amount.toFixed(decimals);
};

// Format as currency display
export const formatCurrency = (amount: number): string => {
  if (amount < 0.01) {
    return `$${amount.toFixed(8)}`;
  } else if (amount < 1) {
    return `$${amount.toFixed(6)}`;
  } else if (amount < 100) {
    return `$${amount.toFixed(4)}`;
  } else {
    return `$${amount.toFixed(2)}`;
  }
};

// Format large numbers with K/M suffixes
export const formatCompact = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Calculate flow rate per time unit
export const flowRatePerUnit = (rate: number, unit: 'second' | 'minute' | 'hour' | 'day'): number => {
  const multipliers = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
  };
  return rate * multipliers[unit];
};
