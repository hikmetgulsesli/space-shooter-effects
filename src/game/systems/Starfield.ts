/**
 * Parallax Starfield System
 * 
 * Renders a multi-layered starfield background with parallax scrolling.
 * Each layer moves at different speeds to create depth illusion.
 * - Layer 0 (far): slowest, smaller stars
 * - Layer 1 (mid): medium speed, medium stars  
 * - Layer 2 (near): fastest, larger stars
 */

import {
  Star,
  StarfieldConfig,
  DESIGN_TOKENS,
} from '../types';

export class StarfieldSystem {
  private stars: Star[] = [];
  private config: StarfieldConfig;
  private canvasWidth: number;
  private canvasHeight: number;
  private idCounter = 0;

  constructor(
    canvasWidth: number = 800,
    canvasHeight: number = 600,
    config: Partial<StarfieldConfig> = {}
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.config = {
      layerCount: 3,
      starsPerLayer: 30,
      baseSpeed: 50,
      ...config,
    };

    this.generateStars();
  }

  /**
   * Generate a unique ID for stars
   */
  private generateId(): string {
    return `star-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Generate initial star positions
   */
  private generateStars(): void {
    this.stars = [];

    for (let layer = 0; layer < this.config.layerCount; layer++) {
      const layerMultiplier = layer + 1; // 1, 2, 3

      for (let i = 0; i < this.config.starsPerLayer; i++) {
        const star: Star = {
          id: this.generateId(),
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight,
          size: this.getStarSizeForLayer(layer),
          speed: this.config.baseSpeed * layerMultiplier * 0.5,
          layer,
          alpha: this.getStarAlphaForLayer(layer),
        };
        this.stars.push(star);
      }
    }
  }

  /**
   * Get star size based on layer (near stars are larger)
   */
  private getStarSizeForLayer(layer: number): number {
    // Layer 0: 1-2px, Layer 1: 2-3px, Layer 2: 3-4px
    const baseSize = 1 + layer;
    return baseSize + Math.random();
  }

  /**
   * Get star alpha based on layer (far stars are dimmer)
   */
  private getStarAlphaForLayer(layer: number): number {
    // Layer 0: 0.3-0.5, Layer 1: 0.5-0.7, Layer 2: 0.7-1.0
    const baseAlpha = 0.3 + layer * 0.2;
    return baseAlpha + Math.random() * 0.2;
  }

  /**
   * Update star positions for parallax scrolling
   * @param deltaTime Time elapsed since last update in seconds
   * @param scrollDirection Optional direction vector (default: down)
   */
  update(
    deltaTime: number,
    scrollDirection: { x: number; y: number } = { x: 0, y: 1 }
  ): void {
    this.stars.forEach((star) => {
      // Move star based on its layer speed and scroll direction
      star.x += scrollDirection.x * star.speed * deltaTime;
      star.y += scrollDirection.y * star.speed * deltaTime;

      // Wrap around screen edges
      if (star.y > this.canvasHeight) {
        star.y = 0;
        star.x = Math.random() * this.canvasWidth;
      } else if (star.y < 0) {
        star.y = this.canvasHeight;
        star.x = Math.random() * this.canvasWidth;
      }

      if (star.x > this.canvasWidth) {
        star.x = 0;
        star.y = Math.random() * this.canvasHeight;
      } else if (star.x < 0) {
        star.x = this.canvasWidth;
        star.y = Math.random() * this.canvasHeight;
      }
    });
  }

  /**
   * Get all stars
   */
  getStars(): Star[] {
    return this.stars;
  }

  /**
   * Get stars filtered by layer
   */
  getStarsByLayer(layer: number): Star[] {
    return this.stars.filter((star) => star.layer === layer);
  }

  /**
   * Resize the starfield canvas
   */
  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.generateStars();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StarfieldConfig>): void {
    this.config = { ...this.config, ...config };
    this.generateStars();
  }

  /**
   * Get configuration
   */
  getConfig(): StarfieldConfig {
    return { ...this.config };
  }

  /**
   * Get star count
   */
  getCount(): number {
    return this.stars.length;
  }

  /**
   * Get star count per layer
   */
  getCountByLayer(): Record<number, number> {
    const counts: Record<number, number> = {};
    this.stars.forEach((star) => {
      counts[star.layer] = (counts[star.layer] || 0) + 1;
    });
    return counts;
  }

  /**
   * Reset all stars to new random positions
   */
  reset(): void {
    this.generateStars();
  }

  /**
   * Get default star color from design tokens
   */
  static getDefaultColor(): string {
    return DESIGN_TOKENS.colors.white;
  }

  /**
   * Get star color with varying tint based on layer
   */
  getStarColor(star: Star): string {
    // Near stars can have slight blue tint, far stars are more white/gray
    if (star.layer === 2) {
      return Math.random() > 0.8 
        ? DESIGN_TOKENS.colors.primary 
        : DESIGN_TOKENS.colors.white;
    }
    return DESIGN_TOKENS.colors.white;
  }
}

export default StarfieldSystem;
