/**
 * Mandala Overlay Component
 * 
 * Batch 3 - Astro Components
 * 
 * Sacred geometry mandala overlay
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MandalaOverlayProps {
  intensity?: number;
  className?: string;
}

export const MandalaOverlay: React.FC<MandalaOverlayProps> = ({
  intensity = 0.3,
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circle */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="#F2C94C"
          strokeWidth="1"
          opacity={intensity}
        />
        
        {/* Middle Circle */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="#6E2DEB"
          strokeWidth="1"
          opacity={intensity * 0.7}
        />
        
        {/* Inner Circle */}
        <circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="#17E8F6"
          strokeWidth="1"
          opacity={intensity * 0.5}
        />
        
        {/* Sacred Geometry Lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 200 + 60 * Math.cos(rad);
          const y1 = 200 + 60 * Math.sin(rad);
          const x2 = 200 + 180 * Math.cos(rad);
          const y2 = 200 + 180 * Math.sin(rad);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#F2C94C"
              strokeWidth="1"
              opacity={intensity * 0.4}
            />
          );
        })}
      </svg>
    </div>
  );
};

