/**
 * Particle System
 * 
 * Handles creation, updating, and rendering of particles.
 * Supports explosion, thruster, and spark particle types.
 * Uses design token colors.
 */

import {
  Particle,
  ParticleType,
  ParticleConfig,
  DESIGN_TOKENS,
} from '../types';

// Color palettes for different particle types
const PARTICLE_COLORS: Record<ParticleType, string[]> = {
  explosion: [
    DESIGN_TOKENS.colors.danger,
    DESIGN_TOKENS.colors.warning,
    DESIGN_TOKENS.colors.white,
    '#ff6b35',
    '#ff4500',
  ],
  thruster: [
    DESIGN_TOKENS.colors.info,
    DESIGN_TOKENS.colors.primary,
    DESIGN_TOKENS.colors.white,
    '#60a5fa',
    '#93c5fd',
  ],
  spark: [
    DESIGN_TOKENS.colors.warning,
    DESIGN_TOKENS.colors.accent,
    DESIGN_TOKENS.colors.white,
    '#fbbf24',
    '#fcd34d',
  ],
};

export class ParticleSystem {
  private particles: Particle[] = [];
  private idCounter = 0;

  /**
   * Generate a unique ID for particles
   */
  private generateId(): string {
    return `particle-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Get a random color from the palette for a particle type
   */
  private getRandomColor(type: ParticleType): string {
    const colors = PARTICLE_COLORS[type];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Spawn particles based on configuration
   */
  spawn(config: ParticleConfig): void {
    const {
      type,
      x,
      y,
      count = 10,
      color,
      speed = 100,
      spread = Math.PI * 2,
      life = 1.0,
      size = 3,
    } = config;

    const baseAngle = type === 'thruster' ? Math.PI / 2 : 0; // Thrusters point down

    for (let i = 0; i < count; i++) {
      let angle: number;
      let velocity: number;

      switch (type) {
        case 'explosion':
          // Random direction for explosions
          angle = Math.random() * Math.PI * 2;
          velocity = speed * (0.5 + Math.random() * 0.5);
          break;
        case 'thruster':
          // Cone shape for thrusters
          angle = baseAngle + (Math.random() - 0.5) * spread;
          velocity = speed * (0.3 + Math.random() * 0.7);
          break;
        case 'spark':
          // Narrow spread for sparks
          angle = Math.random() * spread - spread / 2;
          velocity = speed * (0.2 + Math.random() * 0.8);
          break;
        default:
          angle = Math.random() * Math.PI * 2;
          velocity = speed * Math.random();
      }

      const particle: Particle = {
        id: this.generateId(),
        type,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random() * 0.5),
        color: color || this.getRandomColor(type),
        alpha: 1.0,
      };

      this.particles.push(particle);
    }
  }

  /**
   * Spawn an explosion effect
   */
  spawnExplosion(x: number, y: number, intensity: number = 1.0): void {
    this.spawn({
      type: 'explosion',
      x,
      y,
      count: Math.floor(20 * intensity),
      speed: 150 * intensity,
      spread: Math.PI * 2,
      life: 0.8 + Math.random() * 0.4,
      size: 4 * intensity,
    });
  }

  /**
   * Spawn a thruster effect
   */
  spawnThruster(x: number, y: number, intensity: number = 1.0): void {
    this.spawn({
      type: 'thruster',
      x,
      y,
      count: Math.floor(5 * intensity),
      speed: 80 * intensity,
      spread: Math.PI / 4,
      life: 0.3 + Math.random() * 0.2,
      size: 2 * intensity,
    });
  }

  /**
   * Spawn spark effects
   */
  spawnSparks(x: number, y: number, count: number = 8): void {
    this.spawn({
      type: 'spark',
      x,
      y,
      count,
      speed: 100,
      spread: Math.PI / 3,
      life: 0.4 + Math.random() * 0.3,
      size: 2,
    });
  }

  /**
   * Update all particles
   * @param deltaTime Time elapsed since last update in seconds
   */
  update(deltaTime: number): void {
    this.particles = this.particles.filter((particle) => {
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Apply drag/friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update life
      particle.life -= deltaTime;

      // Update alpha based on remaining life
      particle.alpha = Math.max(0, particle.life / particle.maxLife);

      // Keep particle if it still has life
      return particle.life > 0;
    });
  }

  /**
   * Get all active particles
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Get particle count
   */
  getCount(): number {
    return this.particles.length;
  }
}

export default ParticleSystem;
