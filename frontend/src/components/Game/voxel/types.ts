import * as THREE from 'three';

// --- Core Data Structures ---

/**
 * Basic Voxel Unit
 * Simplest representation of a block in the world.
 */
export interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: number; // Hex color (e.g., 0xFF0000)
}

export interface VoxelTools {
  setBlock: (map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) => void;
  generateSphere: (map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy?: number) => void;
  COLORS: Record<string, number>;
  CONFIG: { VOXEL_SIZE: number; FLOOR_Y: number; BG_COLOR: string };
}

/**
 * AI Interface for Voxel Generation
 * This is the structure an AI should generate to create a new building.
 */
export interface AIVoxelModel {
  name: string;
  description?: string;
  voxels?: VoxelData[]; 
  generator?: (tools: VoxelTools) => VoxelData[];
}

// --- Simulation Types ---

export const AppState = {
  STABLE: 'STABLE',
  DISMANTLING: 'DISMANTLING',
  REBUILDING: 'REBUILDING'
} as const;

export type AppState = typeof AppState[keyof typeof AppState];

export interface SimulationVoxel {
  id: number;
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  // Physics state
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  rvx: number;
  rvy: number;
  rvz: number;
}

export interface RebuildTarget {
  x: number;
  y: number;
  z: number;
  delay: number;
  isRubble?: boolean;
}

export interface Building {
  id: string;
  name: string;
  voxels: VoxelData[];
  status: 'SPAWNING' | 'STABLE' | 'DESTROYING';
  position: [number, number, number]; // World offset
}
