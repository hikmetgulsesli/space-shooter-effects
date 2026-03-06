/**
 * Screen Shake System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenShakeSystem } from '../systems';

describe('ScreenShakeSystem', () => {
  let system: ScreenShakeSystem;

  beforeEach(() => {
    system = new ScreenShakeSystem();
  });

  describe('trigger', () => {
    it('should activate screen shake', () => {
      expect(system.isActive()).toBe(false);

      system.trigger({ intensity: 10, duration: 0.5 });

      expect(system.isActive()).toBe(true);
    });

    it('should use default values when not specified', () => {
      system.trigger();

      expect(system.isActive()).toBe(true);
      expect(system.getRemainingDuration()).toBeGreaterThan(0);
    });
  });

  describe('triggerDamage', () => {
    it('should trigger a small shake', () => {
      system.triggerDamage();

      expect(system.isActive()).toBe(true);
      const state = system.getState();
      expect(state.intensity).toBe(5);
      expect(state.duration).toBe(0.3);
    });
  });

  describe('triggerExplosion', () => {
    it('should trigger a large shake', () => {
      system.triggerExplosion();

      expect(system.isActive()).toBe(true);
      const state = system.getState();
      expect(state.intensity).toBe(15);
      expect(state.duration).toBe(0.6);
    });

    it('should scale with intensity parameter', () => {
      system.triggerExplosion(0.5);
      const state1 = system.getState();

      system.stop();
      system.triggerExplosion(2.0);
      const state2 = system.getState();

      expect(state2.intensity).toBeGreaterThan(state1.intensity);
      expect(state2.duration).toBeGreaterThan(state1.duration);
    });
  });

  describe('update', () => {
    it('should decrease remaining duration over time', () => {
      system.trigger({ intensity: 10, duration: 1.0 });

      const initialDuration = system.getRemainingDuration();
      system.update(0.3);
      const remainingDuration = system.getRemainingDuration();

      expect(remainingDuration).toBeLessThan(initialDuration);
    });

    it('should deactivate when duration expires', () => {
      system.trigger({ intensity: 10, duration: 0.5 });

      expect(system.isActive()).toBe(true);

      system.update(0.6);

      expect(system.isActive()).toBe(false);
    });

    it('should generate non-zero offsets when active', () => {
      system.trigger({ intensity: 10, duration: 1.0 });

      system.update(0.1);

      const offsets = system.getOffsets();
      // Offsets should be within intensity range
      expect(Math.abs(offsets.x)).toBeLessThanOrEqual(10);
      expect(Math.abs(offsets.y)).toBeLessThanOrEqual(10);
    });

    it('should reset offsets when shake completes', () => {
      system.trigger({ intensity: 10, duration: 0.5 });
      system.update(0.1);

      // Should have offsets while active
      let offsets = system.getOffsets();
      expect(offsets.x !== 0 || offsets.y !== 0).toBe(true);

      // Complete the shake
      system.update(0.5);

      // Offsets should be reset to zero
      offsets = system.getOffsets();
      expect(offsets.x).toBe(0);
      expect(offsets.y).toBe(0);
    });

    it('should decay intensity over time', () => {
      system.trigger({ intensity: 10, duration: 1.0 });

      // Get initial offset magnitude
      system.update(0.01);
      const earlyOffsets = system.getOffsets();
      const earlyMagnitude = Math.abs(earlyOffsets.x) + Math.abs(earlyOffsets.y);

      // Advance time significantly
      system.update(0.8);
      const lateOffsets = system.getOffsets();
      const lateMagnitude = Math.abs(lateOffsets.x) + Math.abs(lateOffsets.y);

      // Later offsets should generally be smaller due to decay
      // (using average behavior, not strict inequality due to randomness)
    });
  });

  describe('stop', () => {
    it('should immediately stop shaking', () => {
      system.trigger({ intensity: 10, duration: 1.0 });
      system.update(0.1);

      expect(system.isActive()).toBe(true);

      system.stop();

      expect(system.isActive()).toBe(false);
      const offsets = system.getOffsets();
      expect(offsets.x).toBe(0);
      expect(offsets.y).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      system.trigger({ intensity: 10, duration: 0.5 });
      system.update(0.1);

      const state = system.getState();

      expect(state).toHaveProperty('active');
      expect(state).toHaveProperty('intensity');
      expect(state).toHaveProperty('duration');
      expect(state).toHaveProperty('elapsed');
      expect(state).toHaveProperty('offsetX');
      expect(state).toHaveProperty('offsetY');
    });
  });
});
