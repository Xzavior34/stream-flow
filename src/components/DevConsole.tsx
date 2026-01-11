import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Terminal, ChevronDown } from 'lucide-react';

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
    return 'text-muted-foreground';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <div className="flex items-center gap-3 mb-2 justify-end">
        <Label htmlFor="dev-console" className="text-sm text-muted-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Under the Hood
        </Label>
        <Switch
          id="dev-console"
          checked={isOpen}
          onCheckedChange={onToggle}
        />
      </div>

      {/* Console Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[400px] max-w-[90vw] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">lazorkit-session.log</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>

            {/* Logs */}
            <div
              ref={scrollRef}
              className="h-[200px] overflow-y-auto p-3 font-mono text-xs space-y-1"
            >
              {logs.length === 0 ? (
                <div className="text-muted-foreground italic">
                  Waiting for activity...
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${getLogColor(log)} leading-relaxed`}
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>

            {/* Status Bar */}
            <div className="px-3 py-2 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>Devnet • Gasless Mode</span>
              <span className="flex items-center gap-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Connected
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
