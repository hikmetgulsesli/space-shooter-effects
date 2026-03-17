/**
 * Particle System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../systems';
import { ParticleType } from '../types';

describe('ParticleSystem', () => {
  let system: ParticleSystem;

  beforeEach(() => {
    system = new ParticleSystem();
  });

  describe('spawn', () => {
    it('should spawn the correct number of particles', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 200,
        count: 10,
      });

      expect(system.getCount()).toBe(10);
    });

    it('should default to 10 particles when count not specified', () => {
      system.spawn({
        type: 'spark',
        x: 0,
        y: 0,
      });

      expect(system.getCount()).toBe(10);
    });

    it('should set correct position for spawned particles', () => {
      system.spawn({
        type: 'explosion',
        x: 150,
        y: 250,
        count: 1,
      });

      const particles = system.getParticles();
      expect(particles[0].x).toBe(150);
      expect(particles[0].y).toBe(250);
    });

    it('should support all particle types', () => {
      const types: ParticleType[] = ['explosion', 'thruster', 'spark'];

      types.forEach((type) => {
        const testSystem = new ParticleSystem();
        testSystem.spawn({
          type,
          x: 100,
          y: 100,
          count: 5,
        });

        const particles = testSystem.getParticles();
        expect(particles.length).toBe(5);
        expect(particles[0].type).toBe(type);
      });
    });
  });

  describe('spawnExplosion', () => {
    it('should spawn explosion particles', () => {
      system.spawnExplosion(100, 100);

      expect(system.getCount()).toBeGreaterThan(0);
      const particles = system.getParticles();
      expect(particles[0].type).toBe('explosion');
    });

    it('should scale with intensity', () => {
      system.spawnExplosion(100, 100, 0.5);
      const lowIntensityCount = system.getCount();

      system.clear();
      system.spawnExplosion(100, 100, 2.0);
      const highIntensityCount = system.getCount();

      expect(highIntensityCount).toBeGreaterThan(lowIntensityCount);
    });
  });

  describe('spawnThruster', () => {
    it('should spawn thruster particles', () => {
      system.spawnThruster(100, 100);

      expect(system.getCount()).toBeGreaterThan(0);
      const particles = system.getParticles();
      expect(particles[0].type).toBe('thruster');
    });
  });

  describe('spawnSparks', () => {
    it('should spawn spark particles', () => {
      system.spawnSparks(100, 100, 8);

      expect(system.getCount()).toBe(8);
      const particles = system.getParticles();
      expect(particles[0].type).toBe('spark');
    });
  });

  describe('update', () => {
    it('should update particle positions based on velocity', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 100,
        count: 1,
        speed: 100,
      });

      const particle = system.getParticles()[0];
      const initialX = particle.x;
      const initialY = particle.y;

      // Update with 1 second delta time
      system.update(1.0);

      // Position should have changed based on velocity
      expect(particle.x).not.toBe(initialX);
      expect(particle.y).not.toBe(initialY);
    });

    it('should reduce particle life over time', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 100,
        count: 1,
        life: 1.0,
      });

      const particle = system.getParticles()[0];
      const initialLife = particle.life;

      system.update(0.5);

      expect(particle.life).toBeLessThan(initialLife);
    });

    it('should remove particles when life reaches zero', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 100,
        count: 5,
        life: 0.1,
      });

      expect(system.getCount()).toBe(5);

      // Update past particle lifetime
      system.update(0.2);

      expect(system.getCount()).toBe(0);
    });

    it('should update alpha based on remaining life', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 100,
        count: 1,
        life: 1.0,
      });

      const particle = system.getParticles()[0];
      expect(particle.alpha).toBe(1.0);

      system.update(0.5);

      expect(particle.alpha).toBe(0.5);
    });

    it('should apply drag to particle velocity', () => {
      system.spawn({
        type: 'explosion',
        x: 100,
        y: 100,
        count: 1,
        speed: 100,
        life: 10.0, // Long life so particle doesn't die
      });

      const particle = system.getParticles()[0];
      const initialVx = particle.vx;

      system.update(1.0);

      // Velocity should decrease due to drag (multiplied by 0.98)
      expect(Math.abs(particle.vx)).toBeLessThan(Math.abs(initialVx));
    });
  });

  describe('clear', () => {
    it('should remove all particles', () => {
      system.spawnExplosion(100, 100);
      system.spawnThruster(200, 200);
      system.spawnSparks(300, 300);

      expect(system.getCount()).toBeGreaterThan(0);

      system.clear();

      expect(system.getCount()).toBe(0);
    });
  });

  describe('design token colors', () => {
    it('should use design token colors for particles', () => {
      system.spawnExplosion(100, 100);
      system.spawnThruster(100, 100);
      system.spawnSparks(100, 100);

      const particles = system.getParticles();
      
      // All particles should have valid hex colors
      particles.forEach((particle) => {
        expect(particle.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
