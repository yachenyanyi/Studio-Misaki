import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VoxelData } from './types';
import { CONFIG } from './VoxelGenerators';

// Constants for animation
const ANIMATION_DURATION = 1.5; // seconds
const POOL_SIZE = 15000; // Max supported voxels (Object Pool)

interface VoxelMorphEngineProps {
  targetData: VoxelData[]; // The model we want to show
}

interface ParticleState {
  // Current Render State
  x: number; y: number; z: number;
  r: number; g: number; b: number;
  scale: number;
  
  // Transition Source (From)
  fromX: number; fromY: number; fromZ: number;
  fromR: number; fromG: number; fromB: number;
  fromScale: number;

  // Transition Target (To)
  toX: number; toY: number; toZ: number;
  toR: number; toG: number; toB: number;
  toScale: number;

  // Animation Offset (for staggered effect)
  delay: number;
}

export const VoxelMorphEngine: React.FC<VoxelMorphEngineProps> = ({ targetData }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // The big state array for all particles
  // We use a Ref to avoid React re-renders, managing the loop manually
  const particles = useRef<ParticleState[]>([]);
  
  // Animation progress (0.0 to 1.0)
  const progress = useRef(1.0); // Start fully stable
  const prevDataRef = useRef<VoxelData[]>([]);

  // Initialize Pool once
  useEffect(() => {
    particles.current = new Array(POOL_SIZE).fill(null).map(() => ({
      x: 0, y: 0, z: 0, r: 1, g: 1, b: 1, scale: 0,
      fromX: 0, fromY: 0, fromZ: 0, fromR: 1, fromG: 1, fromB: 1, fromScale: 0,
      toX: 0, toY: 0, toZ: 0, toR: 1, toG: 1, toB: 1, toScale: 0,
      delay: 0
    }));
  }, []);

  // Handle Data Change (Trigger Transition)
  useEffect(() => {
    if (particles.current.length === 0) return;

    const nextData = targetData;
    
    // Reset progress to start animation
    progress.current = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const p = particles.current[i];
      
      // 1. Capture Current State as "From"
      p.fromX = p.x; p.fromY = p.y; p.fromZ = p.z;
      p.fromR = p.r; p.fromG = p.g; p.fromB = p.b;
      p.fromScale = p.scale;

      // 2. Determine "To" State
      if (i < nextData.length) {
        // Target exists -> Move to new position
        const target = nextData[i];
        const color = new THREE.Color(target.color);
        
        p.toX = target.x; p.toY = target.y; p.toZ = target.z;
        p.toR = color.r; p.toG = color.g; p.toB = color.b;
        p.toScale = 1; // Full size
        
        // If it was hidden (scale 0), spawn from center
        if (p.fromScale < 0.1) {
             p.fromX = 0; p.fromY = 5; p.fromZ = 0; // Spawn center
        }

      } else {
        // Target doesn't exist -> Hide (Scale to 0)
        p.toX = p.fromX; p.toY = p.fromY; p.toZ = p.fromZ; // Stay in place but shrink
        p.toR = p.fromR; p.toG = p.fromG; p.toB = p.fromB;
        p.toScale = 0;
      }

      // 3. Random Delay for organic feel
      // Distance from center determines delay? Or just random.
      // Let's do random for "Dissolve/Reassemble" effect.
      p.delay = Math.random() * 0.5; 
    }

    prevDataRef.current = nextData;

  }, [targetData]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Advance Progress
    // Speed up slightly to ensure completion
    const speed = 1.0 / ANIMATION_DURATION;
    progress.current = Math.min(1.0, progress.current + delta * speed);
    
    const tGlobal = progress.current;
    
    // Update Particles
    let activeCount = 0;
    
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = particles.current[i];
      
      // Skip processing if completely hidden and stable
      if (p.toScale === 0 && p.fromScale === 0 && tGlobal === 1) {
          // Ensure it's hidden
          dummy.position.set(0, -1000, 0);
          dummy.scale.set(0,0,0);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.matrix);
          continue;
      }
      
      activeCount++;

      // Local Progress based on delay
      // Map global [0, 1] to local [0, 1] considering delay
      // Adjusted T = (GlobalT - Delay) / (1 - Delay) roughly
      // But let's keep it simple: smoothstep
      
      let localT = (tGlobal - p.delay * 0.5) * (1 + p.delay * 0.5); 
      localT = Math.max(0, Math.min(1, localT));
      
      // Easing (Elastic or Cubic)
      // Custom ease: overshoot slightly for expansion
      const ease = localT < 0.5 ? 4 * localT * localT * localT : 1 - Math.pow(-2 * localT + 2, 3) / 2;
      
      // Interpolate
      p.x = THREE.MathUtils.lerp(p.fromX, p.toX, ease);
      p.y = THREE.MathUtils.lerp(p.fromY, p.toY, ease);
      p.z = THREE.MathUtils.lerp(p.fromZ, p.toZ, ease);
      
      p.r = THREE.MathUtils.lerp(p.fromR, p.toR, ease);
      p.g = THREE.MathUtils.lerp(p.fromG, p.toG, ease);
      p.b = THREE.MathUtils.lerp(p.fromB, p.toB, ease);
      
      p.scale = THREE.MathUtils.lerp(p.fromScale, p.toScale, ease);

      // Add a little "pop" or wobble during transition
      if (localT > 0 && localT < 1) {
          p.scale *= (1 + Math.sin(localT * Math.PI) * 0.2);
      }

      // Update Instance
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(p.r, p.g, p.b));
    }

    meshRef.current.count = POOL_SIZE; // Always render full pool? Or optimize?
    // Optimization: We could track max index, but for 15k particles, simple loop is fine.
    // To properly cull, we'd need to sort or swap, which is complex.
    // Instead, we just let the shader handle scale=0 particles (they are invisible).
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, POOL_SIZE]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95]} />
      <meshStandardMaterial roughness={0.7} metalness={0.1} />
    </instancedMesh>
  );
};
