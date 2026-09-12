import React from 'react';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-panel p-6 rounded-enterprise animate-shimmer space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-dark-700/60 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-dark-700/60 rounded-lg"></div>
    </div>
    <div className="h-8 bg-dark-700/80 rounded w-1/2"></div>
    <div className="h-3 bg-dark-700/50 rounded w-3/4"></div>
  </div>
);

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-72' }) => (
  <div className={`glass-panel p-6 rounded-enterprise animate-shimmer flex flex-col justify-between ${height}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 bg-dark-700/60 rounded w-1/4"></div>
      <div className="h-4 bg-dark-700/40 rounded w-1/6"></div>
    </div>
    <div className="flex-1 flex items-end space-x-3 pt-6 pb-2">
      {[40, 65, 30, 85, 55, 90, 70, 45, 80].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-dark-700/40 rounded-t"
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
    <div className="flex justify-between mt-2 pt-2 border-t border-dark-700/30">
      <div className="h-3 bg-dark-700/40 rounded w-12"></div>
      <div className="h-3 bg-dark-700/40 rounded w-12"></div>
      <div className="h-3 bg-dark-700/40 rounded w-12"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="glass-panel p-6 rounded-enterprise animate-shimmer space-y-4">
    <div className="h-6 bg-dark-700/60 rounded w-1/4 mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 py-3 border-b border-dark-750/50 last:border-0">
        <div className="h-4 bg-dark-700/50 rounded w-1/4"></div>
        <div className="h-4 bg-dark-700/40 rounded w-1/6"></div>
        <div className="h-6 bg-dark-700/60 rounded-full w-20"></div>
        <div className="h-4 bg-dark-700/40 rounded w-1/5 ml-auto"></div>
      </div>
    ))}
  </div>
);
