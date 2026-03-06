/**
 * Starfield System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StarfieldSystem } from '../systems';

describe('StarfieldSystem', () => {
  let system: StarfieldSystem;

  beforeEach(() => {
    system = new StarfieldSystem(800, 600);
  });

  describe('initialization', () => {
    it('should create stars on initialization', () => {
      const stars = system.getStars();
      expect(stars.length).toBeGreaterThan(0);
    });

    it('should create the correct number of stars', () => {
      // Default: 3 layers * 30 stars per layer = 90 stars
      expect(system.getCount()).toBe(90);
    });

    it('should have multiple layers', () => {
      const counts = system.getCountByLayer();
      expect(Object.keys(counts).length).toBe(3);
      expect(counts[0]).toBe(30);
      expect(counts[1]).toBe(30);
      expect(counts[2]).toBe(30);
    });

    it('should position stars within canvas bounds', () => {
      const stars = system.getStars();

      stars.forEach((star) => {
        expect(star.x).toBeGreaterThanOrEqual(0);
        expect(star.x).toBeLessThanOrEqual(800);
        expect(star.y).toBeGreaterThanOrEqual(0);
        expect(star.y).toBeLessThanOrEqual(600);
      });
    });
  });

  describe('layer properties', () => {
    it('should assign layer 0 to far stars', () => {
      const farStars = system.getStarsByLayer(0);
      expect(farStars.length).toBeGreaterThan(0);
      farStars.forEach((star) => {
        expect(star.layer).toBe(0);
      });
    });

    it('should assign layer 1 to mid stars', () => {
      const midStars = system.getStarsByLayer(1);
      expect(midStars.length).toBeGreaterThan(0);
      midStars.forEach((star) => {
        expect(star.layer).toBe(1);
      });
    });

    it('should assign layer 2 to near stars', () => {
      const nearStars = system.getStarsByLayer(2);
      expect(nearStars.length).toBeGreaterThan(0);
      nearStars.forEach((star) => {
        expect(star.layer).toBe(2);
      });
    });

    it('should have increasing speed for closer layers', () => {
      const farStars = system.getStarsByLayer(0);
      const midStars = system.getStarsByLayer(1);
      const nearStars = system.getStarsByLayer(2);

      // Average speeds should increase with layer
      const avgFarSpeed = farStars.reduce((sum, s) => sum + s.speed, 0) / farStars.length;
      const avgMidSpeed = midStars.reduce((sum, s) => sum + s.speed, 0) / midStars.length;
      const avgNearSpeed = nearStars.reduce((sum, s) => sum + s.speed, 0) / nearStars.length;

      expect(avgMidSpeed).toBeGreaterThan(avgFarSpeed);
      expect(avgNearSpeed).toBeGreaterThan(avgMidSpeed);
    });

    it('should have increasing size for closer layers', () => {
      const farStars = system.getStarsByLayer(0);
      const nearStars = system.getStarsByLayer(2);

      const avgFarSize = farStars.reduce((sum, s) => sum + s.size, 0) / farStars.length;
      const avgNearSize = nearStars.reduce((sum, s) => sum + s.size, 0) / nearStars.length;

      expect(avgNearSize).toBeGreaterThan(avgFarSize);
    });

    it('should have increasing alpha for closer layers', () => {
      const farStars = system.getStarsByLayer(0);
      const nearStars = system.getStarsByLayer(2);

      const avgFarAlpha = farStars.reduce((sum, s) => sum + s.alpha, 0) / farStars.length;
      const avgNearAlpha = nearStars.reduce((sum, s) => sum + s.alpha, 0) / nearStars.length;

      expect(avgNearAlpha).toBeGreaterThan(avgFarAlpha);
    });
  });

  describe('update', () => {
    it('should move stars downward by default', () => {
      const stars = system.getStars();
      const initialY = stars[0].y;

      system.update(1.0);

      expect(stars[0].y).not.toBe(initialY);
    });

    it('should wrap stars around vertical edges', () => {
      // Find a near star (fastest) and position it near the bottom
      const nearStars = system.getStarsByLayer(2);
      nearStars[0].y = 595;

      system.update(1.0);

      // Star should have wrapped to the top
      expect(nearStars[0].y).toBeLessThan(600);
    });

    it('should respect scroll direction', () => {
      const stars = system.getStars();
      const star = stars[0];
      const initialX = star.x;
      const initialY = star.y;

      // Move diagonally
      system.update(1.0, { x: 1, y: 0 });

      // X should change when direction has x component
      expect(star.x).not.toBe(initialX);
    });
  });

  describe('resize', () => {
    it('should regenerate stars on resize', () => {
      system.resize(1024, 768);

      const stars = system.getStars();
      stars.forEach((star) => {
        expect(star.x).toBeLessThanOrEqual(1024);
        expect(star.y).toBeLessThanOrEqual(768);
      });
    });
  });

  describe('reset', () => {
    it('should regenerate all stars', () => {
      const initialStars = system.getStars().map((s) => s.id);

      system.reset();

      const newStars = system.getStars();
      // Should have same count but potentially different IDs
      expect(newStars.length).toBe(initialStars.length);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      system.updateConfig({ starsPerLayer: 50 });

      const config = system.getConfig();
      expect(config.starsPerLayer).toBe(50);

      // Should have regenerated stars
      expect(system.getCount()).toBe(150); // 3 layers * 50
    });
  });

  describe('getStarColor', () => {
    it('should return white for far stars', () => {
      const stars = system.getStarsByLayer(0);
      const color = system.getStarColor(stars[0]);
      expect(color).toBe('#ffffff');
    });
  });

  describe('getDefaultColor', () => {
    it('should return white', () => {
      expect(StarfieldSystem.getDefaultColor()).toBe('#ffffff');
    });
  });
});
