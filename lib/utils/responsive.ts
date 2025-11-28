/**
 * Responsive Utilities
 * 
 * Helper functions for responsive design
 */

export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function useIsTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function useIsDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}

export function getResponsiveValue<T>(values: { mobile?: T; tablet?: T; desktop: T }): T {
  if (typeof window === 'undefined') return values.desktop;
  
  if (window.innerWidth < 768) {
    return values.mobile ?? values.tablet ?? values.desktop;
  }
  
  if (window.innerWidth < 1024) {
    return values.tablet ?? values.desktop;
  }
  
  return values.desktop;
}

// Debounce utility for resize and scroll
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for scroll
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

