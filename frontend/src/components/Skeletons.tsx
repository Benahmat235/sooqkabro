import React from 'react';
import { Skeleton } from './ui/skeleton';

export const ListingSkeleton = () => {
  return (
    <div className=\"bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm transition-all\">
      <div className=\"aspect-square w-full relative\">
        <Skeleton className=\"h-full w-full\" />
      </div>
      <div className=\"p-3 space-y-3\">
        <div className=\"flex justify-between items-start\">
          <div className=\"space-y-2 flex-1\">
            <Skeleton className=\"h-4 w-3/4\" />
            <Skeleton className=\"h-3 w-1/2\" />
          </div>
          <Skeleton className=\"h-6 w-16 rounded-full\" />
        </div>
        <div className=\"flex items-center gap-2\">
          <Skeleton className=\"h-3 w-3 rounded-full\" />
          <Skeleton className=\"h-3 w-20\" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className=\"flex flex-col items-center space-y-4 p-6\">
      <Skeleton className=\"h-24 w-24 rounded-full\" />
      <div className=\"space-y-2 w-full max-w-xs\">
        <Skeleton className=\"h-5 w-1/2 mx-auto rounded-lg\" />
        <Skeleton className=\"h-4 w-full rounded-lg\" />
        <Skeleton className=\"h-4 w-5/6 mx-auto rounded-lg\" />
      </div>
    </div>
  );
};
