/**
 * Hit Flash System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HitFlashSystem } from '../systems';

describe('HitFlashSystem', () => {
  let system: HitFlashSystem;

  beforeEach(() => {
    system = new HitFlashSystem();
  });

  describe('spawn', () => {
    it('should create a flash at position', () => {
      const flash = system.spawn(100, 200, 30, '#ff0000', 0.3);

      expect(flash.x).toBe(100);
      expect(flash.y).toBe(200);
      expect(flash.maxRadius).toBe(30);
      expect(flash.color).toBe('#ff0000');
      expect(flash.radius).toBe(0);
      expect(flash.alpha).toBe(1);
    });

    it('should use default color when not specified', () => {
      const flash = system.spawn(100, 200);

      expect(flash.color).toBe('#ef4444'); // DESIGN_TOKENS.colors.danger
    });
  });

  describe('spawnHit', () => {
    it('should create a small hit flash', () => {
      const flash = system.spawnHit(100, 200);

      expect(flash.maxRadius).toBe(20);
      expect(flash.color).toBe('#f59e0b'); // DESIGN_TOKENS.colors.warning
    });
  });

  describe('spawnDestruction', () => {
    it('should create a large destruction flash', () => {
      const flash = system.spawnDestruction(100, 200);

      expect(flash.maxRadius).toBe(50);
      expect(flash.color).toBe('#ef4444'); // DESIGN_TOKENS.colors.danger
    });
  });

  describe('spawnCritical', () => {
    it('should create a critical hit flash', () => {
      const flash = system.spawnCritical(100, 200);

      expect(flash.maxRadius).toBe(40);
      expect(flash.color).toBe('#f59e0b'); // DESIGN_TOKENS.colors.accent
    });
  });

  describe('update', () => {
    it('should expand radius over time', () => {
      system.spawn(100, 200, 30, '#ff0000', 0.3);

      const flash = system.getFlashes()[0];
      const initialRadius = flash.radius;

      system.update(0.15);

      expect(flash.radius).toBeGreaterThan(initialRadius);
    });

    it('should decrease alpha over time', () => {
      system.spawn(100, 200, 30, '#ff0000', 0.3);

      const flash = system.getFlashes()[0];

      system.update(0.15);

      expect(flash.alpha).toBeLessThan(1);
    });

    it('should remove completed flashes', () => {
      system.spawn(100, 200, 30, '#ff0000', 0.3);
      expect(system.getCount()).toBe(1);

      system.update(0.35);

      expect(system.getCount()).toBe(0);
    });

    it('should calculate correct progress', () => {
      system.spawn(100, 200, 100, '#ff0000', 1.0);

      system.update(0.5);

      const flash = system.getFlashes()[0];
      expect(flash.radius).toBe(50); // Half of max
      expect(flash.alpha).toBe(0.5);
    });
  });

  describe('getFlashes', () => {
    it('should return all active flashes', () => {
      system.spawnHit(100, 100);
      system.spawnDestruction(200, 200);
      system.spawnCritical(300, 300);

      const flashes = system.getFlashes();
      expect(flashes.length).toBe(3);
    });
  });

  describe('clear', () => {
    it('should remove all flashes', () => {
      system.spawnHit(100, 100);
      system.spawnDestruction(200, 200);

      expect(system.getCount()).toBe(2);

      system.clear();

      expect(system.getCount()).toBe(0);
    });
  });

  describe('getCount', () => {
    it('should return flash count', () => {
      expect(system.getCount()).toBe(0);

      system.spawnHit(100, 100);
      expect(system.getCount()).toBe(1);

      system.spawnDestruction(200, 200);
      expect(system.getCount()).toBe(2);
    });
  });

  describe('hasActiveFlashes', () => {
    it('should return false when no flashes', () => {
      expect(system.hasActiveFlashes()).toBe(false);
    });

    it('should return true when flashes exist', () => {
      system.spawnHit(100, 100);
      expect(system.hasActiveFlashes()).toBe(true);
    });

    it('should return false after flashes complete', () => {
      system.spawn(100, 100, 30, '#ff0000', 0.1);
      system.update(0.2);
      expect(system.hasActiveFlashes()).toBe(false);
    });
  });

  describe('getFlashAlpha', () => {
    it('should return full alpha at start', () => {
      system.spawn(100, 200, 30, '#ff0000', 0.3);
      const flash = system.getFlashes()[0];

      const alpha = system.getFlashAlpha(flash);
      expect(alpha).toBe(1);
    });

    it('should return eased alpha during animation', () => {
      system.spawn(100, 200, 100, '#ff0000', 1.0);
      system.update(0.5);

      const flash = system.getFlashes()[0];
      const alpha = system.getFlashAlpha(flash);

      // Should use ease-out (1 - progress^2)
      expect(alpha).toBe(0.75); // 1 - 0.5^2
    });
  });
});
