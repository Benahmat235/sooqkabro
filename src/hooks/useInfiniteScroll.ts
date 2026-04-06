import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions<T> {
  items: T[];
  initialCount?: number;
  incrementCount?: number;
  threshold?: number;
}

interface UseInfiniteScrollResult<T> {
  visibleItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>({
  items,
  initialCount = 12,
  incrementCount = 8,
  threshold = 200,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasMore = visibleCount < items.length;
  const visibleItems = items.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Small delay for smooth UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + incrementCount, items.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, incrementCount, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  // Reset when items change significantly
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items.length, initialCount]);

  // IntersectionObserver for automatic loading
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore, threshold]);

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore,
    reset,
    sentinelRef,
  };
}

// Loading spinner component for infinite scroll
export const InfiniteScrollLoader = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex justify-center py-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Chargement...</span>
      </div>
    </div>
  );
};

// Sentinel element for intersection observer
export const InfiniteScrollSentinel = ({
  sentinelRef,
  hasMore,
}: {
  sentinelRef: React.RefObject<HTMLDivElement>;
  hasMore: boolean;
}) => {
  if (!hasMore) return null;
  
  return <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />;
};
