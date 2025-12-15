import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VoxelMorphEngine } from './voxel/VoxelEngine';
import { Generators, CONFIG } from './voxel/VoxelGenerators';
import type { AIVoxelModel, VoxelData } from './voxel/types';

// Pixel Art UI Styles
const UI_STYLES = {
  fontFamily: '"Press Start 2P", monospace', // Use google font or fallback
  header: {
    fontFamily: 'monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: '#333',
    textShadow: '2px 2px 0px #fff',
  },
  panel: {
    background: '#e0e0e0',
    border: '4px solid #333',
    boxShadow: '8px 8px 0px rgba(0,0,0,0.2)',
    padding: '1rem',
    imageRendering: 'pixelated' as const,
  },
  button: {
    fontFamily: 'monospace',
    border: '2px solid #333',
    background: '#fff',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '4px 4px 0px #333',
    transition: 'transform 0.1s, box-shadow 0.1s',
    textTransform: 'uppercase' as const,
  },
  buttonActive: {
    background: '#ffd700',
    transform: 'translate(2px, 2px)',
    boxShadow: '2px 2px 0px #333',
  }
};

const World: React.FC = () => {
  const [activeModelName, setActiveModelName] = useState<string>('Eagle');
  const [currentVoxels, setCurrentVoxels] = useState<VoxelData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial model
  useEffect(() => {
    loadModel('Eagle');
  }, []);

  const loadModel = (name: string) => {
    setLoading(true);
    // Simulate loading delay for effect
    setTimeout(() => {
      const gen = Generators.get(name);
      if (gen) {
        setCurrentVoxels(gen());
        setActiveModelName(name);
      }
      setLoading(false);
    }, 100);
  };

  /**
   * AI Interface
   */
  useEffect(() => {
    (window as any).loadVoxelModel = (model: AIVoxelModel) => {
      console.log("AI Model Injected:", model);
      Generators.registerAIModel(model);
      loadModel(model.name);
    };
    return () => { delete (window as any).loadVoxelModel; }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      background: '#87CEEB', // Sky blue
      fontFamily: 'monospace'
    }}>
      
      {/* 3D Canvas */}
      <Canvas 
        shadows 
        camera={{ fov: 45, position: [30, 30, 60] }}
        style={{ background: '#87CEEB' }} // Sky blue background
      >
        <fog attach="fog" args={['#87CEEB', 60, 140]} />
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[50, 80, 30]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CONFIG.FLOOR_Y, 0]} receiveShadow>
             <planeGeometry args={[500, 500]} />
             <meshStandardMaterial color="#90EE90" />
        </mesh>

        <Suspense fallback={null}>
          <VoxelMorphEngine targetData={currentVoxels} />
          <OrbitControls 
            enableDamping 
            autoRotate={false}
            target={[0, 5, 0]}
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under floor
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>
      
      {loading && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: '2rem', color: 'white', textShadow: '4px 4px 0 #000',
          animation: 'blink 1s infinite'
        }}>
          LOADING...
        </div>
      )}

      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', 
        justifyContent: 'flex-end', // Only bottom
        padding: '1.5rem'
      }}>
        
        {/* Bottom Control Bar */}
        <div style={{ 
          pointerEvents: 'auto', 
          ...UI_STYLES.panel,
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>SELECT MODEL:</span>
          
          {Generators.getAllNames().map(model => {
            const isActive = activeModelName === model;
            return (
              <button
                key={model}
                onClick={() => loadModel(model)}
                style={isActive ? { ...UI_STYLES.button, ...UI_STYLES.buttonActive } : UI_STYLES.button}
                onMouseEnter={(e) => {
                   if (!isActive) e.currentTarget.style.transform = 'translate(0, -2px)';
                }}
                onMouseLeave={(e) => {
                   if (!isActive) e.currentTarget.style.transform = 'translate(0, 0)';
                }}
              >
                {model}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* CSS for blink animation */}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default World;
