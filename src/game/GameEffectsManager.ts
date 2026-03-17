/**
 * Game Effects Manager
 * 
 * Central manager for all visual effects in the space shooter game.
 * Coordinates particle system, screen shake, starfield, weapon trails, and hit flashes.
 */

import {
  ParticleSystem,
  ScreenShakeSystem,
  StarfieldSystem,
  WeaponTrailSystem,
  HitFlashSystem,
} from './systems';
import {
  Bullet,
  Enemy,
} from './types';

export interface EffectsManagerConfig {
  canvasWidth: number;
  canvasHeight: number;
  enableParticles?: boolean;
  enableScreenShake?: boolean;
  enableStarfield?: boolean;
  enableTrails?: boolean;
  enableHitFlashes?: boolean;
}

export class GameEffectsManager {
  public particles: ParticleSystem;
  public screenShake: ScreenShakeSystem;
  public starfield: StarfieldSystem;
  public trails: WeaponTrailSystem;
  public hitFlashes: HitFlashSystem;

  private config: EffectsManagerConfig;

  constructor(config: EffectsManagerConfig) {
    this.config = {
      enableParticles: true,
      enableScreenShake: true,
      enableStarfield: true,
      enableTrails: true,
      enableHitFlashes: true,
      ...config,
    };

    // Initialize all systems
    this.particles = new ParticleSystem();
    this.screenShake = new ScreenShakeSystem();
    this.starfield = new StarfieldSystem(
      config.canvasWidth,
      config.canvasHeight
    );
    this.trails = new WeaponTrailSystem();
    this.hitFlashes = new HitFlashSystem();
  }

  /**
   * Update all effect systems
   * @param deltaTime Time elapsed since last update in seconds
   * @param scrollDirection Optional scroll direction for starfield
   */
  update(
    deltaTime: number,
    scrollDirection: { x: number; y: number } = { x: 0, y: 1 }
  ): void {
    if (this.config.enableParticles) {
      this.particles.update(deltaTime);
    }
    if (this.config.enableScreenShake) {
      this.screenShake.update(deltaTime);
    }
    if (this.config.enableStarfield) {
      this.starfield.update(deltaTime, scrollDirection);
    }
    if (this.config.enableTrails) {
      this.trails.update(deltaTime);
    }
    if (this.config.enableHitFlashes) {
      this.hitFlashes.update(deltaTime);
    }
  }

  /**
   * Trigger effects when player takes damage
   */
  onPlayerDamage(): void {
    if (this.config.enableScreenShake) {
      this.screenShake.triggerDamage();
    }
    if (this.config.enableParticles) {
      this.particles.spawnSparks(400, 300, 15);
    }
  }

  /**
   * Trigger effects for an explosion
   */
  onExplosion(x: number, y: number, intensity: number = 1.0): void {
    if (this.config.enableScreenShake) {
      this.screenShake.triggerExplosion(intensity);
    }
    if (this.config.enableParticles) {
      this.particles.spawnExplosion(x, y, intensity);
      this.particles.spawnSparks(x, y, Math.floor(10 * intensity));
    }
  }

  /**
   * Trigger effects when an enemy is hit
   */
  onEnemyHit(enemy: Enemy, damage: number): void {
    const x = enemy.x + enemy.width / 2;
    const y = enemy.y + enemy.height / 2;

    if (this.config.enableHitFlashes) {
      if (damage >= enemy.maxHealth * 0.5) {
        this.hitFlashes.spawnCritical(x, y);
      } else {
        this.hitFlashes.spawnHit(x, y);
      }
    }

    if (this.config.enableParticles) {
      this.particles.spawnSparks(x, y, 5);
    }
  }

  /**
   * Trigger effects when an enemy is destroyed
   */
  onEnemyDestroyed(enemy: Enemy): void {
    const x = enemy.x + enemy.width / 2;
    const y = enemy.y + enemy.height / 2;

    if (this.config.enableScreenShake) {
      this.screenShake.triggerExplosion(0.8);
    }
    if (this.config.enableParticles) {
      this.particles.spawnExplosion(x, y, 1.2);
      this.particles.spawnSparks(x, y, 12);
    }
    if (this.config.enableHitFlashes) {
      this.hitFlashes.spawnDestruction(x, y);
    }
  }

  /**
   * Create a trail for a bullet
   */
  createBulletTrail(bullet: Bullet): void {
    if (this.config.enableTrails) {
      this.trails.attachTrail(bullet);
    }
  }

  /**
   * Update bullet trail position
   */
  updateBulletTrail(bullet: Bullet): void {
    if (this.config.enableTrails) {
      this.trails.updateTrail(bullet.id, bullet.x, bullet.y);
    }
  }

  /**
   * Remove a bullet trail
   */
  removeBulletTrail(bullet: Bullet): void {
    if (this.config.enableTrails) {
      this.trails.removeTrail(bullet.id);
    }
  }

  /**
   * Spawn thruster effect at position
   */
  spawnThruster(x: number, y: number, intensity: number = 1.0): void {
    if (this.config.enableParticles) {
      this.particles.spawnThruster(x, y, intensity);
    }
  }

  /**
   * Get total active effect count
   */
  getActiveEffectCount(): number {
    return (
      this.particles.getCount() +
      this.trails.getCount() +
      this.hitFlashes.getCount()
    );
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.particles.clear();
    this.screenShake.stop();
    this.trails.clear();
    this.hitFlashes.clear();
  }

  /**
   * Resize the effects canvas
   */
  resize(width: number, height: number): void {
    this.starfield.resize(width, height);
    this.config.canvasWidth = width;
    this.config.canvasHeight = height;
  }

  /**
   * Enable/disable specific effects
   */
  setEnabled(effect: keyof EffectsManagerConfig, enabled: boolean): void {
    if (effect in this.config) {
      (this.config as Record<keyof EffectsManagerConfig, boolean | number>)[effect] = enabled;
    }
  }
}

export default GameEffectsManager;
