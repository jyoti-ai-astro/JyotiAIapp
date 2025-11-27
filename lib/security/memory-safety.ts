/**
 * Guru Memory Safety (Phase 28 - F43)
 * 
 * Memory purging and limit enforcement
 */

export interface MemoryLimits {
  pastLifeLogs: number;
  visionLogs: number;
  videoLogs: number;
  chatHistory: number;
  maxIdleTime: number; // milliseconds
}

export const DEFAULT_MEMORY_LIMITS: MemoryLimits = {
  pastLifeLogs: 10,
  visionLogs: 100,
  videoLogs: 100,
  chatHistory: 40, // Already applied in Phase 27
  maxIdleTime: 3600000, // 1 hour
};

/**
 * Purge old memory entries
 */
export function purgeOldMemory<T extends { timestamp: number }>(
  entries: T[],
  maxAge: number,
  maxCount: number
): T[] {
  const now = Date.now();
  
  // Remove entries older than maxAge
  let filtered = entries.filter(entry => now - entry.timestamp < maxAge);
  
  // Limit to maxCount (keep most recent)
  if (filtered.length > maxCount) {
    filtered = filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxCount);
  }
  
  return filtered;
}

/**
 * Check if memory should be purged (idle time exceeded)
 */
export function shouldPurgeMemory(lastActivityTime: number, maxIdleTime: number): boolean {
  return Date.now() - lastActivityTime > maxIdleTime;
}

/**
 * Purge memory on tab close (call from beforeunload)
 */
export function purgeMemoryOnClose(): void {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('beforeunload', () => {
    // Clear localStorage/sessionStorage if needed
    // In production, send cleanup request to server
    try {
      sessionStorage.clear();
    } catch (error) {
      // Ignore errors
    }
  });
}

/**
 * Purge memory on session reset
 */
export function purgeMemoryOnReset(): {
  pastLifeLogs: number;
  visionLogs: number;
  videoLogs: number;
  chatHistory: number;
} {
  return {
    pastLifeLogs: 0,
    visionLogs: 0,
    videoLogs: 0,
    chatHistory: 0,
  };
}

