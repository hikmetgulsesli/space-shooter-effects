/**
 * Screen Shake System
 * 
 * Handles camera shake effects triggered by damage and explosions.
 * Uses decaying intensity over time for smooth effect.
 */

import {
  ScreenShakeState,
  ScreenShakeConfig,
} from '../types';

export class ScreenShakeSystem {
  private state: ScreenShakeState;

  constructor() {
    this.state = {
      active: false,
      intensity: 0,
      duration: 0,
      elapsed: 0,
      offsetX: 0,
      offsetY: 0,
    };
  }

  /**
   * Trigger a screen shake effect
   * @param config Shake configuration
   */
  trigger(config: Partial<ScreenShakeConfig> = {}): void {
    const {
      intensity = 10,
      duration = 0.5,
    } = config;

    // If already shaking, combine intensities (with diminishing returns)
    if (this.state.active) {
      this.state.intensity = Math.max(this.state.intensity, intensity);
      this.state.duration = Math.max(this.state.duration, duration);
    } else {
      this.state.active = true;
      this.state.intensity = intensity;
      this.state.duration = duration;
      this.state.elapsed = 0;
    }
  }

  /**
   * Trigger a small shake for damage
   */
  triggerDamage(): void {
    this.trigger({
      intensity: 5,
      duration: 0.3,
    });
  }

  /**
   * Trigger a large shake for explosions
   */
  triggerExplosion(intensity: number = 1.0): void {
    this.trigger({
      intensity: 15 * intensity,
      duration: 0.6 * intensity,
    });
  }

  /**
   * Update the screen shake effect
   * @param deltaTime Time elapsed since last update in seconds
   */
  update(deltaTime: number): void {
    if (!this.state.active) {
      this.state.offsetX = 0;
      this.state.offsetY = 0;
      return;
    }

    this.state.elapsed += deltaTime;

    if (this.state.elapsed >= this.state.duration) {
      // Shake complete
      this.state.active = false;
      this.state.intensity = 0;
      this.state.offsetX = 0;
      this.state.offsetY = 0;
      return;
    }

    // Calculate remaining shake intensity (decay over time)
    const progress = this.state.elapsed / this.state.duration;
    const currentIntensity = this.state.intensity * (1 - progress);

    // Generate random offset within intensity range
    this.state.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    this.state.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
  }

  /**
   * Get current shake offsets to apply to rendering
   */
  getOffsets(): { x: number; y: number } {
    return {
      x: this.state.offsetX,
      y: this.state.offsetY,
    };
  }

  /**
   * Check if screen shake is currently active
   */
  isActive(): boolean {
    return this.state.active;
  }

  /**
   * Get remaining shake duration
   */
  getRemainingDuration(): number {
    if (!this.state.active) return 0;
    return Math.max(0, this.state.duration - this.state.elapsed);
  }

  /**
   * Stop all shaking immediately
   */
  stop(): void {
    this.state.active = false;
    this.state.intensity = 0;
    this.state.offsetX = 0;
    this.state.offsetY = 0;
  }

  /**
   * Get current state (for debugging/serialization)
   */
  getState(): ScreenShakeState {
    return { ...this.state };
  }
}

export default ScreenShakeSystem;
