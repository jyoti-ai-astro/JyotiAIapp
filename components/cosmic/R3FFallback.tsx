/**
 * R3F Fallback Component
 * 
 * Fallback UI when WebGL is not available or fails
 */

'use client';

import React from 'react';

export const R3FFallback: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 bg-gradient-to-br from-cosmic-navy via-cosmic-indigo to-cosmic-purple ${className}`}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-purple/20 to-transparent animate-pulse" />
    </div>
  );
};

