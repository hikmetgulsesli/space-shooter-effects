/**
 * Hit Flash System
 * 
 * Handles visual feedback when enemies are hit or destroyed.
 * Creates expanding flash rings that fade out.
 */

import {
  HitFlash,
  DESIGN_TOKENS,
} from '../types';

export class HitFlashSystem {
  private flashes: HitFlash[] = [];
  private idCounter = 0;

  /**
   * Generate a unique ID for flashes
   */
  private generateId(): string {
    return `flash-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Spawn a hit flash at position
   */
  spawn(
    x: number,
    y: number,
    maxRadius: number = 30,
    color?: string,
    duration: number = 0.3
  ): HitFlash {
    const flash: HitFlash = {
      id: this.generateId(),
      x,
      y,
      radius: 0,
      maxRadius,
      alpha: 1.0,
      color: color || DESIGN_TOKENS.colors.danger,
    };

    // Store animation parameters on the flash object
    flash.duration = duration;
    flash.elapsed = 0;

    this.flashes.push(flash);
    return flash;
  }

  /**
   * Spawn a small hit flash (for regular hits)
   */
  spawnHit(x: number, y: number): HitFlash {
    return this.spawn(
      x,
      y,
      20,
      DESIGN_TOKENS.colors.warning,
      0.2
    );
  }

  /**
   * Spawn a large destruction flash (for enemy destroyed)
   */
  spawnDestruction(x: number, y: number): HitFlash {
    return this.spawn(
      x,
      y,
      50,
      DESIGN_TOKENS.colors.danger,
      0.4
    );
  }

  /**
   * Spawn a critical hit flash
   */
  spawnCritical(x: number, y: number): HitFlash {
    return this.spawn(
      x,
      y,
      40,
      DESIGN_TOKENS.colors.accent,
      0.35
    );
  }

  /**
   * Update all flashes
   * @param deltaTime Time elapsed since last update in seconds
   */
  update(deltaTime: number): void {
    this.flashes = this.flashes.filter((flash) => {
      const duration = flash.duration ?? 0.3;
      const elapsed = (flash.elapsed ?? 0) + deltaTime;
      flash.elapsed = elapsed;

      const progress = Math.min(1, elapsed / duration);

      // Expand radius
      flash.radius = flash.maxRadius * progress;

      // Fade alpha
      flash.alpha = 1 - progress;

      // Keep flash if not complete
      return progress < 1;
    });
  }

  /**
   * Get all active flashes
   */
  getFlashes(): HitFlash[] {
    return this.flashes;
  }

  /**
   * Clear all flashes
   */
  clear(): void {
    this.flashes = [];
  }

  /**
   * Get flash count
   */
  getCount(): number {
    return this.flashes.length;
  }

  /**
   * Check if any flashes are active
   */
  hasActiveFlashes(): boolean {
    return this.flashes.length > 0;
  }

  /**
   * Get flash alpha with easing (for smoother fade)
   */
  getFlashAlpha(flash: HitFlash): number {
    // Use ease-out for smoother fade
    const progress = flash.radius / flash.maxRadius;
    return 1 - Math.pow(progress, 2);
  }
}

export default HitFlashSystem;
