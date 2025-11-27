/**
 * Mouse Velocity Store
 * 
 * Phase 3 — Section 23: PAGES PHASE 8 (F23)
 * 
 * Global mouse position and velocity tracking
 */

'use client';

import { create } from 'zustand';

export interface MouseState {
  mouseX: number;
  mouseY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
  lastUpdate: number;
}

interface MouseStore extends MouseState {
  updateMouse: (x: number, y: number) => void;
  reset: () => void;
}

const initialState: MouseState = {
  mouseX: 0,
  mouseY: 0,
  deltaX: 0,
  deltaY: 0,
  velocity: 0,
  direction: 'none',
  lastUpdate: Date.now(),
};

// Phase 27 - F42: Throttle mouse updates to 60fps
let mouseRafId: number | null = null;
let pendingMouse: { x: number; y: number } | null = null;

export const useMouseStore = create<MouseStore>((set, get) => ({
  ...initialState,
  
  updateMouse: (x: number, y: number) => {
    // Phase 27 - F42: Throttle to 60fps
    pendingMouse = { x, y };
    
    if (mouseRafId === null) {
      mouseRafId = requestAnimationFrame(() => {
        if (pendingMouse === null) {
          mouseRafId = null;
          return;
        }
        
        const state = get();
        const now = Date.now();
        const deltaTime = Math.max(now - state.lastUpdate, 1) / 1000;
        
        const deltaX = pendingMouse.x - state.mouseX;
        const deltaY = pendingMouse.y - state.mouseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Phase 27 - F42: Smooth velocity with exponential moving average
        const rawVelocity = distance / deltaTime;
        const smoothedVelocity = state.velocity * 0.7 + rawVelocity * 0.3; // EMA smoothing
        
        // Determine direction
        let direction: MouseState['direction'] = 'none';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        set({
          mouseX: pendingMouse.x,
          mouseY: pendingMouse.y,
          deltaX,
          deltaY,
          velocity: smoothedVelocity,
          direction,
          lastUpdate: now,
        });
        
        pendingMouse = null;
        mouseRafId = null;
      });
    }
  },
  
  reset: () => {
    set(initialState);
  },
}));

