import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Terminal, ChevronDown, Cpu, Wifi } from 'lucide-react';

interface DevConsoleProps {
  logs: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const DevConsole = ({ logs, isOpen, onToggle }: DevConsoleProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const getLogColor = (log: string): string => {
    if (log.includes('[LazorKit]')) return 'text-blue-400';
    if (log.includes('[Policy]')) return 'text-yellow-400';
    if (log.includes('[Paymaster]')) return 'text-purple-400';
    if (log.includes('[Session]')) return 'text-primary';
    if (log.includes('[TX]')) return 'text-cyan-400';
    if (log.includes('✓')) return 'text-green-400';
    return 'text-muted-foreground';
  };

  const getLogIcon = (log: string): string => {
    if (log.includes('[LazorKit]')) return '🔐';
    if (log.includes('[Policy]')) return '📋';
    if (log.includes('[Paymaster]')) return '⛽';
    if (log.includes('[Session]')) return '🔑';
    if (log.includes('[TX]')) return '✅';
    return '•';
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-[400px] sm:w-[400px] mx-auto sm:mx-0">
      {/* Toggle Button */}
      <motion.div 
        className="flex items-center gap-2 sm:gap-3 mb-2 justify-end bg-card/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50"
        initial={false}
        animate={{ 
          borderColor: isOpen ? 'hsl(152 100% 50% / 0.3)' : 'hsl(0 0% 15% / 0.5)'
        }}
      >
        <Label htmlFor="dev-console" className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 sm:gap-2 cursor-pointer">
          <Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          <span>Under the Hood</span>
        </Label>
        <Switch
          id="dev-console"
          checked={isOpen}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary"
        />
      </motion.div>

      {/* Console Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
                </div>
                <code className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                  lazorkit-session.log
                </code>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </motion.div>
            </div>

            {/* Logs */}
            <div
              ref={scrollRef}
              className="h-[180px] sm:h-[220px] overflow-y-auto p-2.5 sm:p-3 font-mono text-[10px] sm:text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
              {logs.length === 0 ? (
                <div className="text-muted-foreground italic flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Cpu className="h-3 w-3" />
                  </motion.div>
                  Waiting for session activity...
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${getLogColor(log)} leading-relaxed flex items-start gap-1.5`}
                  >
                    <span className="flex-shrink-0">{getLogIcon(log)}</span>
                    <span className="break-all">{log}</span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Status Bar */}
            <div className="px-3 py-2 border-t border-border/50 bg-secondary/20 flex items-center justify-between text-[10px] sm:text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="h-3 w-3" />
                <span>Devnet</span>
                <span className="text-border">•</span>
                <span className="text-primary">Gasless</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ 
                    opacity: [1, 0.4, 1],
                    boxShadow: [
                      '0 0 0 0 hsl(152 100% 50% / 0.4)',
                      '0 0 0 4px hsl(152 100% 50% / 0)',
                      '0 0 0 0 hsl(152 100% 50% / 0.4)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Wifi className="h-3 w-3 text-primary" />
                <span>Session Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
