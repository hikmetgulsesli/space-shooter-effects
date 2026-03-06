/**
 * Weapon Trail System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponTrailSystem } from '../systems';
import { Bullet } from '../types';

describe('WeaponTrailSystem', () => {
  let system: WeaponTrailSystem;

  beforeEach(() => {
    system = new WeaponTrailSystem();
  });

  describe('createTrail', () => {
    it('should create a trail with initial point', () => {
      const trail = system.createTrail('bullet-1', 100, 200);

      expect(trail.points.length).toBe(1);
      expect(trail.points[0].x).toBe(100);
      expect(trail.points[0].y).toBe(200);
    });

    it('should use default color and width', () => {
      const trail = system.createTrail('bullet-1', 100, 200);

      expect(trail.color).toBe('#f59e0b'); // DESIGN_TOKENS.colors.accent
      expect(trail.width).toBe(3);
    });

    it('should accept custom color and width', () => {
      const trail = system.createTrail('bullet-1', 100, 200, '#ff0000', 5);

      expect(trail.color).toBe('#ff0000');
      expect(trail.width).toBe(5);
    });
  });

  describe('updateTrail', () => {
    it('should add new points to the front', () => {
      system.createTrail('bullet-1', 100, 200);
      system.updateTrail('bullet-1', 110, 210);

      const trail = system.getTrail('bullet-1');
      expect(trail!.points.length).toBe(2);
      expect(trail!.points[0].x).toBe(110);
      expect(trail!.points[0].y).toBe(210);
    });

    it('should limit trail length', () => {
      system = new WeaponTrailSystem(5); // Max 5 points
      system.createTrail('bullet-1', 100, 200);

      // Add more points than max
      for (let i = 0; i < 10; i++) {
        system.updateTrail('bullet-1', 100 + i * 10, 200);
      }

      const trail = system.getTrail('bullet-1');
      expect(trail!.points.length).toBe(5);
    });
  });

  describe('attachTrail', () => {
    it('should attach trail to bullet', () => {
      const bullet: Bullet = {
        id: 'bullet-1',
        x: 100,
        y: 200,
        vx: 0,
        vy: -10,
        speed: 10,
        damage: 10,
      };

      system.attachTrail(bullet);

      expect(bullet.trail).toBeDefined();
      expect(bullet.trail!.points.length).toBe(1);
    });
  });

  describe('update', () => {
    it('should age trail points', () => {
      system.createTrail('bullet-1', 100, 200);
      
      const trail = system.getTrail('bullet-1');
      const initialAge = trail!.points[0].age;

      system.update(0.1);

      expect(trail!.points[0].age).toBeGreaterThan(initialAge);
    });

    it('should remove expired points', () => {
      system.createTrail('bullet-1', 100, 200);
      
      // Add another point and age it a bit
      system.updateTrail('bullet-1', 110, 210);
      system.update(0.1);
      
      // Add a third point (newest)
      system.updateTrail('bullet-1', 120, 220);

      // Age past maxAge (0.3 seconds) - only the first 2 points should expire
      system.update(0.25);

      const trail = system.getTrail('bullet-1');
      // Trail should still exist with the newest point
      expect(trail).toBeDefined();
      expect(trail!.points.length).toBe(1);
    });

    it('should remove trails with no points', () => {
      system.createTrail('bullet-1', 100, 200);
      
      // Age past maxAge
      system.update(0.4);

      expect(system.hasTrail('bullet-1')).toBe(false);
    });
  });

  describe('removeTrail', () => {
    it('should remove a trail', () => {
      system.createTrail('bullet-1', 100, 200);
      expect(system.hasTrail('bullet-1')).toBe(true);

      system.removeTrail('bullet-1');
      expect(system.hasTrail('bullet-1')).toBe(false);
    });
  });

  describe('getTrails', () => {
    it('should return all trails', () => {
      system.createTrail('bullet-1', 100, 200);
      system.createTrail('bullet-2', 200, 300);

      const trails = system.getTrails();
      expect(trails.length).toBe(2);
    });
  });

  describe('getCount', () => {
    it('should return trail count', () => {
      expect(system.getCount()).toBe(0);

      system.createTrail('bullet-1', 100, 200);
      expect(system.getCount()).toBe(1);

      system.createTrail('bullet-2', 200, 300);
      expect(system.getCount()).toBe(2);
    });
  });

  describe('clear', () => {
    it('should remove all trails', () => {
      system.createTrail('bullet-1', 100, 200);
      system.createTrail('bullet-2', 200, 300);
      expect(system.getCount()).toBe(2);

      system.clear();
      expect(system.getCount()).toBe(0);
    });
  });

  describe('getPointAlpha', () => {
    it('should return full alpha for new points', () => {
      system.createTrail('bullet-1', 100, 200);
      
      const trail = system.getTrail('bullet-1');
      const alpha = system.getPointAlpha(trail!.points[0]);

      expect(alpha).toBe(1);
    });

    it('should return decreasing alpha for aged points', () => {
      system.createTrail('bullet-1', 100, 200);
      
      system.update(0.15);
      
      const trail = system.getTrail('bullet-1');
      const alpha = system.getPointAlpha(trail!.points[0]);

      expect(alpha).toBeLessThan(1);
      expect(alpha).toBeGreaterThan(0);
    });
  });

  describe('setDefaults', () => {
    it('should update default values', () => {
      system.setDefaults(15, 5, '#ff0000');

      const trail = system.createTrail('bullet-1', 100, 200);
      expect(trail.color).toBe('#ff0000');
      expect(trail.width).toBe(5);
    });
  });

  describe('getPointAt', () => {
    it('should return point at normalized position', () => {
      system.createTrail('bullet-1', 100, 200);
      system.updateTrail('bullet-1', 110, 220);
      system.updateTrail('bullet-1', 120, 240);

      const trail = system.getTrail('bullet-1')!;
      
      // Get head
      const head = system.getPointAt(trail, 0);
      expect(head!.x).toBe(120);
      expect(head!.y).toBe(240);

      // Get tail
      const tail = system.getPointAt(trail, 1);
      expect(tail!.x).toBe(100);
      expect(tail!.y).toBe(200);
    });
  });

  describe('getInterpolatedPointAt', () => {
    it('should interpolate between points', () => {
      system.createTrail('bullet-1', 100, 200);
      system.updateTrail('bullet-1', 120, 240);

      const trail = system.getTrail('bullet-1')!;
      
      // Get midpoint
      const mid = system.getInterpolatedPointAt(trail, 0.5);
      expect(mid!.x).toBe(110);
      expect(mid!.y).toBe(220);
    });
  });
});
