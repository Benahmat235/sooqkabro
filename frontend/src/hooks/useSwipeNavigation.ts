import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';

interface UseSwipeNavigationOptions {
  enabled?: boolean;
  threshold?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const useSwipeNavigation = (options: UseSwipeNavigationOptions = {}): {
  handlers: SwipeableHandlers;
  swipeProgress: number;
  isSwi ping: boolean;
} => {
  const {
    enabled = true,
    threshold = 100,
    onSwipeStart,
    onSwipeEnd,
  } = options;

  const navigate = useNavigate();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleSwipeStart = useCallback(() => {
    setIsSwiping(true);
    onSwipeStart?.();
  }, [onSwipeStart]);

  const handleSwipeEnd = useCallback(() => {
    setIsSwiping(false);
    setSwipeProgress(0);
    onSwipeEnd?.();
  }, [onSwipeEnd]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!enabled) return;
      handleSwipeEnd();
      // Navigate forward (could be customized per page)
    },
    onSwipedRight: () => {
      if (!enabled) return;
      handleSwipeEnd();
      navigate(-1); // Go back
    },
    onSwiping: (eventData) => {
      if (!enabled) return;
      
      if (eventData.dir === 'Left' || eventData.dir === 'Right') {
        if (!isSwiping) handleSwipeStart();
        const progress = Math.min(Math.abs(eventData.deltaX) / threshold, 1);
        setSwipeProgress(progress);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: false,
    rotationAngle: 0,
  });

  return {
    handlers: enabled ? handlers : {},
    swipeProgress,
    isSwiping,
  };
};

// Hook pour pull-to-refresh
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const threshold = 80;

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.dir === 'Down' && window.scrollY === 0) {
        const distance = Math.min(eventData.deltaY, threshold * 1.5);
        setPullDistance(distance);
        setIsPulling(distance > threshold);
      }
    },
    onSwiped: async (eventData) => {
      if (eventData.dir === 'Down' && pullDistance > threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullDistance(0);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
  });

  return {
    handlers,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
};
