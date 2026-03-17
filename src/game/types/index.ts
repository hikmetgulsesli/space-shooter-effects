/**
 * Space Shooter Game Types
 * 
 * Design tokens for colors are used throughout.
 */

// Design token colors
export const DESIGN_TOKENS = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
    gray: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  }
} as const;

// Particle types
export type ParticleType = 'explosion' | 'thruster' | 'spark';

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface ParticleConfig {
  type: ParticleType;
  x: number;
  y: number;
  count?: number;
  color?: string;
  speed?: number;
  spread?: number;
  life?: number;
  size?: number;
}

// Screen shake configuration
export interface ScreenShakeConfig {
  intensity: number;
  duration: number;
  decay: number;
}

export interface ScreenShakeState {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
}

// Starfield types
export interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
  alpha: number;
}

export interface StarfieldConfig {
  layerCount: number;
  starsPerLayer: number;
  baseSpeed: number;
}

// Weapon trail types
export interface TrailPoint {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export interface WeaponTrail {
  id: string;
  points: TrailPoint[];
  color: string;
  width: number;
}

// Hit flash types
export interface HitFlash {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  // Animation properties (internal use)
  duration?: number;
  elapsed?: number;
}

// Bullet types
export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  trail?: WeaponTrail;
}

// Enemy types
export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  color: string;
}

// Game state
export interface GameState {
  particles: Particle[];
  screenShake: ScreenShakeState;
  stars: Star[];
  trails: WeaponTrail[];
  hitFlashes: HitFlash[];
  bullets: Bullet[];
  enemies: Enemy[];
}
