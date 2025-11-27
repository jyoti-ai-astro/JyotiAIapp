/**
 * Smoothing Utilities
 * 
 * Phase 2 — Section 8: AUDIO ATMOSPHERE ENGINE v1.0
 * Spatial Audio Engine (E13)
 * 
 * Moving average and smoothing functions
 */

/**
 * Moving average filter
 */
export class MovingAverage {
  private buffer: number[] = [];
  private size: number;

  constructor(size: number = 10) {
    this.size = size;
  }

  add(value: number): number {
    this.buffer.push(value);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
    return this.getAverage();
  }

  getAverage(): number {
    if (this.buffer.length === 0) return 0;
    const sum = this.buffer.reduce((a, b) => a + b, 0);
    return sum / this.buffer.length;
  }

  reset(): void {
    this.buffer = [];
  }
}

/**
 * Exponential smoothing
 */
export class ExponentialSmoothing {
  private value: number = 0;
  private alpha: number;

  constructor(alpha: number = 0.1) {
    this.alpha = alpha;
  }

  update(newValue: number): number {
    this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    return this.value;
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Smooth value with exponential smoothing
 */
export function smoothValue(
  current: number,
  target: number,
  smoothing: number = 0.1
): number {
  return current + (target - current) * smoothing;
}

