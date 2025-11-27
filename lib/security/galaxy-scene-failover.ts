/**
 * GalaxyScene Failover Safety (Phase 29 - F44)
 * 
 * Graceful degradation for R3F/Three.js failures
 */

export interface GalaxySceneState {
  isFrozen: boolean;
  animationsDisabled: boolean;
  error: Error | null;
}

let sceneState: GalaxySceneState = {
  isFrozen: false,
  animationsDisabled: false,
  error: null,
};

/**
 * Freeze scene gracefully
 */
export function freezeScene(): void {
  sceneState.isFrozen = true;
  sceneState.animationsDisabled = true;
  console.warn('[GalaxyScene Failover] Scene frozen gracefully');
}

/**
 * Disable animations
 */
export function disableAnimations(): void {
  sceneState.animationsDisabled = true;
  console.warn('[GalaxyScene Failover] Animations disabled');
}

/**
 * Handle scene update failure
 */
export function handleSceneUpdateFailure(error: Error): void {
  sceneState.error = error;
  freezeScene();
  disableAnimations();
  
  // Silent console message (no crash)
  console.warn('[GalaxyScene Failover] Scene update failed, frozen gracefully:', error.message);
}

/**
 * Get current scene state
 */
export function getSceneState(): GalaxySceneState {
  return { ...sceneState };
}

/**
 * Reset scene state (for recovery)
 */
export function resetSceneState(): void {
  sceneState = {
    isFrozen: false,
    animationsDisabled: false,
    error: null,
  };
  console.log('[GalaxyScene] Scene state reset');
}

/**
 * Check if scene should update
 */
export function shouldUpdateScene(): boolean {
  return !sceneState.isFrozen && !sceneState.animationsDisabled;
}

