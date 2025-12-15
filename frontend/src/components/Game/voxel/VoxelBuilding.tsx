import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppState } from './types';
import type { SimulationVoxel, Building } from './types';
import { CONFIG } from './VoxelGenerators';

interface VoxelBuildingProps {
  data: Building;
  onRemove: (id: string) => void;
}

export const VoxelBuilding: React.FC<VoxelBuildingProps> = ({ data, onRemove }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Local Simulation State
  const voxels = useRef<SimulationVoxel[]>([]);
  const state = useRef<AppState>(AppState.STABLE);
  const progress = useRef<number>(0); // For fade out
  const time = useRef<number>(0);

  // Initialize Voxels (Only once per building)
  useEffect(() => {
    // Convert VoxelData to SimulationVoxel with random initial positions
    voxels.current = data.voxels.map((v, i) => {
        const c = new THREE.Color(v.color);
        // Randomize color slightly for texture
        c.offsetHSL(0, 0, (Math.random() * 0.1) - 0.05);
        
        // Initial fly-in position (Spawn from sky or random)
        const startX = (Math.random() - 0.5) * 50;
        const startY = 50 + Math.random() * 20;
        const startZ = (Math.random() - 0.5) * 50;

        return {
            id: i,
            x: startX, y: startY, z: startZ, color: c,
            vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0,
            rvx: 0, rvy: 0, rvz: 0
        };
    });
    
    state.current = AppState.REBUILDING; // Start by flying in
    time.current = 0;
  }, []);

  // Handle External Status Changes
  useEffect(() => {
    if (data.status === 'DESTROYING' && state.current !== AppState.DISMANTLING) {
        state.current = AppState.DISMANTLING;
        progress.current = 0; // Reset fade progress
        
        // Apply explosion force
        voxels.current.forEach(v => {
            v.vx = (Math.random() - 0.5) * 1.5;
            v.vy = Math.random() * 1.0;
            v.vz = (Math.random() - 0.5) * 1.5;
            v.rvx = (Math.random() - 0.5) * 0.3;
            v.rvy = (Math.random() - 0.5) * 0.3;
            v.rvz = (Math.random() - 0.5) * 0.3;
        });
    }
  }, [data.status]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    time.current += delta;

    // --- Physics Update ---
    
    // 1. Spawning / Rebuilding (Fly to target)
    if (state.current === AppState.REBUILDING) {
        let stableCount = 0;
        const speed = 5.0 * delta;
        
        voxels.current.forEach((v, i) => {
            const targetX = data.voxels[i].x;
            const targetY = data.voxels[i].y;
            const targetZ = data.voxels[i].z;
            
            // Simple spring physics to target
            v.x += (targetX - v.x) * speed;
            v.y += (targetY - v.y) * speed;
            v.z += (targetZ - v.z) * speed;
            
            // Snap if close
            if (Math.abs(v.x - targetX) < 0.1 && Math.abs(v.y - targetY) < 0.1 && Math.abs(v.z - targetZ) < 0.1) {
                stableCount++;
                v.x = targetX; v.y = targetY; v.z = targetZ;
            }
        });

        if (stableCount >= voxels.current.length * 0.95) {
            state.current = AppState.STABLE;
        }
    }

    // 2. Stable (Just render)
    
    // 3. Dismantling (Explode + Fade Out)
    if (state.current === AppState.DISMANTLING) {
        progress.current += delta;
        
        // Physics (Gravity + Velocity)
        voxels.current.forEach(v => {
            v.x += v.vx;
            v.y += v.vy;
            v.z += v.vz;
            v.vy -= 9.8 * delta * 0.5; // Gravity
            
            // Rotation
            v.rx += v.rvx;
            v.ry += v.rvy;
            v.rz += v.rvz;
            
            // Floor bounce
            if (v.y < CONFIG.FLOOR_Y) {
                v.y = CONFIG.FLOOR_Y;
                v.vy *= -0.6;
                v.vx *= 0.8;
                v.vz *= 0.8;
            }
        });

        // Fade Out Check
        if (progress.current > 3.0) { // 3 seconds fade out
            onRemove(data.id);
            return; // Stop rendering
        }
    }

    // --- Render Update ---
    let i = 0;
    
    // Apply color/opacity to material? 
    // InstancedMesh doesn't support per-instance opacity easily without custom shader.
    // BUT we can scale them to 0 to simulate disappearing, or just set visible=false at end.
    // For "Fade Out", standard material transparent=true is needed, but that affects all instances.
    // Workaround: Scale down to 0 during fade out.
    
    const scale = state.current === AppState.DISMANTLING
        ? Math.max(0, 1 - (progress.current / 2.5)) // Shrink to 0
        : 1;

    voxels.current.forEach(v => {
        dummy.position.set(v.x + data.position[0], v.y + data.position[1], v.z + data.position[2]);
        dummy.rotation.set(v.rx, v.ry, v.rz);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        meshRef.current!.setColorAt(i, v.color);
        i++;
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, data.voxels.length]}
        castShadow
        receiveShadow
    >
        <boxGeometry args={[CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95, CONFIG.VOXEL_SIZE * 0.95]} />
        <meshStandardMaterial />
    </instancedMesh>
  );
};
