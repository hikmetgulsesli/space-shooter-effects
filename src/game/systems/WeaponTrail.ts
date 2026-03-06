/**
 * Weapon Trail System
 * 
 * Handles rendering of bullet trails that fade over time.
 * Trails follow behind projectiles and create visual motion blur effect.
 */

import {
  WeaponTrail,
  TrailPoint,
  Bullet,
  DESIGN_TOKENS,
} from '../types';

export class WeaponTrailSystem {
  private trails: Map<string, WeaponTrail> = new Map();
  private idCounter = 0;
  private maxTrailLength: number;
  private defaultTrailWidth: number;
  private defaultTrailColor: string;

  constructor(
    maxTrailLength: number = 10,
    defaultTrailWidth: number = 3,
    defaultTrailColor: string = DESIGN_TOKENS.colors.accent
  ) {
    this.maxTrailLength = maxTrailLength;
    this.defaultTrailWidth = defaultTrailWidth;
    this.defaultTrailColor = defaultTrailColor;
  }

  /**
   * Generate a unique ID for trails
   */
  private generateId(): string {
    return `trail-${++this.idCounter}-${Date.now()}`;
  }

  /**
   * Create a new trail for a bullet
   */
  createTrail(
    bulletId: string,
    startX: number,
    startY: number,
    color?: string,
    width?: number
  ): WeaponTrail {
    const trail: WeaponTrail = {
      id: this.generateId(),
      points: [{
        x: startX,
        y: startY,
        age: 0,
        maxAge: 0.3, // Points live for 0.3 seconds
      }],
      color: color || this.defaultTrailColor,
      width: width || this.defaultTrailWidth,
    };

    this.trails.set(bulletId, trail);
    return trail;
  }

  /**
   * Update a bullet's trail with a new position
   */
  updateTrail(bulletId: string, x: number, y: number): void {
    const trail = this.trails.get(bulletId);
    if (!trail) return;

    // Add new point at the front
    trail.points.unshift({
      x,
      y,
      age: 0,
      maxAge: 0.3,
    });

    // Limit trail length
    if (trail.points.length > this.maxTrailLength) {
      trail.points.pop();
    }
  }

  /**
   * Attach a trail to a bullet
   */
  attachTrail(
    bullet: Bullet,
    color?: string,
    width?: number
  ): WeaponTrail {
    const trail = this.createTrail(
      bullet.id,
      bullet.x,
      bullet.y,
      color,
      width
    );
    bullet.trail = trail;
    return trail;
  }

  /**
   * Update all trails (age points, remove old trails)
   * @param deltaTime Time elapsed since last update in seconds
   */
  update(deltaTime: number): void {
    this.trails.forEach((trail, bulletId) => {
      // Age all points
      trail.points = trail.points.filter((point) => {
        point.age += deltaTime;
        return point.age < point.maxAge;
      });

      // Remove trail if no points remain
      if (trail.points.length === 0) {
        this.trails.delete(bulletId);
      }
    });
  }

  /**
   * Remove a trail when bullet is destroyed
   */
  removeTrail(bulletId: string): void {
    this.trails.delete(bulletId);
  }

  /**
   * Get all active trails
   */
  getTrails(): WeaponTrail[] {
    return Array.from(this.trails.values());
  }

  /**
   * Get a specific trail
   */
  getTrail(bulletId: string): WeaponTrail | undefined {
    return this.trails.get(bulletId);
  }

  /**
   * Check if a trail exists
   */
  hasTrail(bulletId: string): boolean {
    return this.trails.has(bulletId);
  }

  /**
   * Get trail count
   */
  getCount(): number {
    return this.trails.size;
  }

  /**
   * Clear all trails
   */
  clear(): void {
    this.trails.clear();
  }

  /**
   * Calculate trail alpha based on point age
   */
  getPointAlpha(point: TrailPoint): number {
    return Math.max(0, 1 - point.age / point.maxAge);
  }

  /**
   * Update default configuration
   */
  setDefaults(
    maxTrailLength?: number,
    defaultTrailWidth?: number,
    defaultTrailColor?: string
  ): void {
    if (maxTrailLength !== undefined) {
      this.maxTrailLength = maxTrailLength;
    }
    if (defaultTrailWidth !== undefined) {
      this.defaultTrailWidth = defaultTrailWidth;
    }
    if (defaultTrailColor !== undefined) {
      this.defaultTrailColor = defaultTrailColor;
    }
  }

  /**
   * Get point at normalized position along trail (0 = head, 1 = tail)
   */
  getPointAt(trail: WeaponTrail, t: number): { x: number; y: number } | null {
    if (trail.points.length === 0) return null;

    const index = Math.floor(t * (trail.points.length - 1));
    const clampedIndex = Math.max(0, Math.min(trail.points.length - 1, index));
    const point = trail.points[clampedIndex];

    return { x: point.x, y: point.y };
  }

  /**
   * Get interpolated point at normalized position
   */
  getInterpolatedPointAt(
    trail: WeaponTrail,
    t: number
  ): { x: number; y: number } | null {
    if (trail.points.length === 0) return null;
    if (trail.points.length === 1) {
      return { x: trail.points[0].x, y: trail.points[0].y };
    }

    const scaledT = t * (trail.points.length - 1);
    const index = Math.floor(scaledT);
    const nextIndex = Math.min(index + 1, trail.points.length - 1);
    const localT = scaledT - index;

    const p1 = trail.points[index];
    const p2 = trail.points[nextIndex];

    return {
      x: p1.x + (p2.x - p1.x) * localT,
      y: p1.y + (p2.y - p1.y) * localT,
    };
  }
}

export default WeaponTrailSystem;
