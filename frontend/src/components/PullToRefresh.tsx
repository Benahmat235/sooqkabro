import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/useSwipeNavigation';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  enabled?: boolean;
  threshold?: number;
}

export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  enabled = true 
}: PullToRefreshProps) => {
  const { handlers, isPulling, pullProgress, isRefreshing } = usePullToRefresh(onRefresh);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div {...handlers} className="relative">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        initial={{ y: -60 }}
        animate={{ 
          y: isRefreshing ? 0 : isPulling ? 0 : -60,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-card/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border flex items-center gap-2">
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-medium text-foreground">
                Actualisation...
              </span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: pullProgress * 360 }}
                transition={{ duration: 0.2 }}
              >
                <RefreshCw className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-xs font-medium text-foreground">
                {pullProgress >= 1 ? 'Relâcher pour actualiser' : 'Tirer pour actualiser'}
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? 40 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
