import type { VoxelData, AIVoxelModel } from './types';

// --- Constants ---
export const COLORS = {
  DARK: 0x4A3728,
  LIGHT: 0x654321,
  WHITE: 0xF0F0F0,
  GOLD: 0xFFD700,
  BLACK: 0x111111,
  WOOD: 0x3B2F2F,
  GREEN: 0x228B22,
  TALON: 0xE5C100,
};

export const CONFIG = {
  VOXEL_SIZE: 1,
  FLOOR_Y: -12,
  BG_COLOR: '#f0f2f5',
};

// --- Helper Functions ---

function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

export const VoxelTools = {
    setBlock,
    generateSphere,
    COLORS,
    CONFIG
};

// --- Generator Registry ---

type GeneratorFn = () => VoxelData[];

class VoxelGeneratorRegistry {
  private generators: Map<string, GeneratorFn> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public register(name: string, fn: GeneratorFn) {
    this.generators.set(name, fn);
  }

  public get(name: string): GeneratorFn | undefined {
    return this.generators.get(name);
  }

  public getAllNames(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Allows an AI to register a model (static or procedural)
   */
  public registerAIModel(model: AIVoxelModel) {
    if (model.generator) {
        // Wrap the generator with tools
        this.register(model.name, () => model.generator!(VoxelTools));
    } else if (model.voxels) {
        this.register(model.name, () => model.voxels!);
    } else {
        console.warn("AI Model missing both voxels and generator");
    }
  }

  private registerDefaults() {
    this.register('Eagle', this.generateEagle);
    this.register('Cat', this.generateCat);
    this.register('Rabbit', this.generateRabbit);
    this.register('Twins', this.generateTwins);
    this.register('JungleCabin', this.generateJungleCabin);
  }

  // --- Default Implementations ---

  private generateJungleCabin(): VoxelData[] {
      const map = new Map<string, VoxelData>();
      const FLOOR = CONFIG.FLOOR_Y + 4;

      // 1. Ground/Vegetation Base
      for (let x = -10; x <= 10; x++) {
          for (let z = -10; z <= 10; z++) {
              if (x*x + z*z < 80) {
                  setBlock(map, x, FLOOR, z, COLORS.GREEN);
                  // Random grass/bushes
                  if (Math.random() > 0.85) setBlock(map, x, FLOOR + 1, z, COLORS.GREEN);
              }
          }
      }

      // 2. Trees
      const trees = [[-7, -7], [7, -6], [-6, 7], [8, 8]];
      trees.forEach(([tx, tz]) => {
          const height = 8 + Math.random() * 6;
          // Trunk
          for (let y = 0; y < height; y++) {
              setBlock(map, tx, FLOOR + 1 + y, tz, COLORS.WOOD);
          }
          // Leaves
          generateSphere(map, tx, FLOOR + height, tz, 3 + Math.random(), COLORS.GREEN);
      });

      // 3. Cabin (Stilts + House)
      const CX = 0, CZ = 0, CY = FLOOR + 5;
      // Stilts
      [[-3, -3], [-3, 3], [3, -3], [3, 3]].forEach(([sx, sz]) => {
          for (let y = FLOOR; y <= CY; y++) setBlock(map, CX + sx, y, CZ + sz, COLORS.DARK);
      });
      // Floor
      for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) setBlock(map, CX + x, CY, CZ + z, COLORS.WOOD);
      
      // Walls
      for (let x = -3; x <= 3; x++) {
          for (let z = -3; z <= 3; z++) {
              if (Math.abs(x) === 3 || Math.abs(z) === 3) {
                  for (let y = 1; y <= 4; y++) {
                      // Door (Front Z=3)
                      if (z === 3 && x === 0 && y < 3) continue; 
                      // Windows (Side X=3 or X=-3)
                      if (Math.abs(x) === 3 && z === 0 && y === 2) continue;
                      
                      setBlock(map, CX + x, CY + y, CZ + z, COLORS.LIGHT);
                  }
              }
          }
      }
      
      // Roof (Pyramid style)
      for (let h = 0; h <= 3; h++) {
          const size = 4 - h;
          for (let x = -size; x <= size; x++) {
              for (let z = -size; z <= size; z++) {
                  setBlock(map, CX + x, CY + 5 + h, CZ + z, COLORS.DARK);
              }
          }
      }

      return Array.from(map.values());
  }

  private generateEagle(): VoxelData[] {
      const map = new Map<string, VoxelData>();
      // Branch
      for (let x = -8; x < 8; x++) {
          const y = Math.sin(x * 0.2) * 1.5;
          const z = Math.cos(x * 0.1) * 1.5;
          generateSphere(map, x, y, z, 1.8, COLORS.WOOD);
          if (Math.random() > 0.7) generateSphere(map, x, y + 2, z + (Math.random() - 0.5) * 3, 1.5, COLORS.GREEN);
      }
      // Body
      const EX = 0, EY = 2, EZ = 2;
      generateSphere(map, EX, EY + 6, EZ, 4.5, COLORS.DARK, 1.4);
      // Chest
      for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY + 4; y <= EY + 9; y++) setBlock(map, x, y, EZ + 3, COLORS.LIGHT);
      // Wings (Rough approximation)
      for (let x of [-4, -3, 3, 4]) for (let y = EY + 4; y <= EY + 10; y++) for (let z = EZ - 2; z <= EZ + 3; z++) setBlock(map, x, y, z, COLORS.DARK);
      // Tail
      for (let x = EX - 2; x <= EX + 2; x++) for (let y = EY; y <= EY + 4; y++) for (let z = EZ - 5; z <= EZ - 3; z++) setBlock(map, x, y, z, COLORS.WHITE);
      // Head
      const HY = EY + 12, HZ = EZ + 1;
      generateSphere(map, EX, HY, HZ, 2.8, COLORS.WHITE);
      generateSphere(map, EX, HY - 2, HZ, 2.5, COLORS.WHITE);
      // Talons
      [[-2, 0], [-2, 1], [2, 0], [2, 1]].forEach(o => setBlock(map, EX + o[0], EY + o[1], EZ, COLORS.TALON));
      // Beak
      [[0, 1], [0, 2], [1, 1], [-1, 1]].forEach(o => setBlock(map, EX + o[0], HY, HZ + 2 + o[1], COLORS.GOLD));
      setBlock(map, EX, HY - 1, HZ + 3, COLORS.GOLD);
      // Eyes
      [[-1.5, COLORS.BLACK], [1.5, COLORS.BLACK]].forEach(o => setBlock(map, EX + o[0], HY + 0.5, HZ + 1.5, o[1]));
      [[-1.5, COLORS.WHITE], [1.5, COLORS.WHITE]].forEach(o => setBlock(map, EX + o[0], HY + 1.5, HZ + 1.5, o[1]));

      return Array.from(map.values());
  }

  private generateCat(): VoxelData[] {
      const map = new Map<string, VoxelData>();
      const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
      // Paws
      generateSphere(map, CX - 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
      generateSphere(map, CX + 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
      // Body
      for (let y = 0; y < 7; y++) {
          const r = 3.5 - (y * 0.2);
          generateSphere(map, CX, CY + 2 + y, CZ, r, COLORS.DARK);
          generateSphere(map, CX, CY + 2 + y, CZ + 2, r * 0.6, COLORS.WHITE);
      }
      // Legs
      for (let y = 0; y < 5; y++) {
          setBlock(map, CX - 1.5, CY + y, CZ + 3, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 3, COLORS.WHITE);
          setBlock(map, CX - 1.5, CY + y, CZ + 2, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 2, COLORS.WHITE);
      }
      // Head
      const CHY = CY + 9;
      generateSphere(map, CX, CHY, CZ, 3.2, COLORS.LIGHT, 0.8);
      // Ears
      [[-2, 1], [2, 1]].forEach(side => {
          setBlock(map, CX + side[0], CHY + 3, CZ, COLORS.DARK); setBlock(map, CX + side[0] * 0.8, CHY + 3, CZ + 1, COLORS.WHITE);
          setBlock(map, CX + side[0], CHY + 4, CZ, COLORS.DARK);
      });
      // Tail
      for (let i = 0; i < 12; i++) {
          const a = i * 0.3, tx = Math.cos(a) * 4.5, tz = Math.sin(a) * 4.5;
          if (tz > -2) { setBlock(map, CX + tx, CY, CZ + tz, COLORS.DARK); setBlock(map, CX + tx, CY + 1, CZ + tz, COLORS.DARK); }
      }
      // Face
      setBlock(map, CX - 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD); setBlock(map, CX + 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD);
      setBlock(map, CX - 1, CHY + 0.5, CZ + 3, COLORS.BLACK); setBlock(map, CX + 1, CHY + 0.5, CZ + 3, COLORS.BLACK);
      setBlock(map, CX, CHY, CZ + 3, COLORS.TALON);
      return Array.from(map.values());
  }

  private generateRabbit(): VoxelData[] {
      const map = new Map<string, VoxelData>();
      const LOG_Y = CONFIG.FLOOR_Y + 2.5;
      const RX = 0, RZ = 0;
      // Log
      for (let x = -6; x <= 6; x++) {
          const radius = 2.8 + Math.sin(x * 0.5) * 0.2;
          generateSphere(map, x, LOG_Y, 0, radius, COLORS.DARK);
          if (x === -6 || x === 6) generateSphere(map, x, LOG_Y, 0, radius - 0.5, COLORS.WOOD);
          if (Math.random() > 0.8) setBlock(map, x, LOG_Y + radius, (Math.random() - 0.5) * 2, COLORS.GREEN);
      }
      // Body
      const BY = LOG_Y + 2.5;
      generateSphere(map, RX - 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
      generateSphere(map, RX + 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
      generateSphere(map, RX, BY + 2, RZ, 2.2, COLORS.WHITE, 0.8);
      generateSphere(map, RX, BY + 2.5, RZ + 1.5, 1.5, COLORS.WHITE);
      setBlock(map, RX - 1.2, BY, RZ + 2.2, COLORS.LIGHT); setBlock(map, RX + 1.2, BY, RZ + 2.2, COLORS.LIGHT);
      setBlock(map, RX - 2.2, BY, RZ - 0.5, COLORS.WHITE); setBlock(map, RX + 2.2, BY, RZ - 0.5, COLORS.WHITE);
      generateSphere(map, RX, BY + 1.5, RZ - 2.5, 1.0, COLORS.WHITE);
      // Head
      const HY = BY + 4.5; const HZ = RZ + 1;
      generateSphere(map, RX, HY, HZ, 1.7, COLORS.WHITE);
      generateSphere(map, RX - 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
      generateSphere(map, RX + 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
      // Ears
      for (let y = 0; y < 5; y++) {
          const curve = y * 0.2;
          setBlock(map, RX - 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX - 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
          setBlock(map, RX - 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
          setBlock(map, RX + 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX + 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
          setBlock(map, RX + 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
      }
      setBlock(map, RX - 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK); setBlock(map, RX + 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK);
      setBlock(map, RX, HY - 0.5, HZ + 1.8, COLORS.TALON);
      return Array.from(map.values());
  }

  private generateTwins(): VoxelData[] {
      const map = new Map<string, VoxelData>();
      function buildMiniEagle(offsetX: number, offsetZ: number) {
          // Branch
          for (let x = -5; x < 5; x++) {
              const y = Math.sin(x * 0.4) * 0.5;
              generateSphere(map, offsetX + x, y, offsetZ, 1.2, COLORS.WOOD);
              if (Math.random() > 0.8) generateSphere(map, offsetX + x, y + 1, offsetZ, 1, COLORS.GREEN);
          }
          const EX = offsetX, EY = 1.5, EZ = offsetZ;
          generateSphere(map, EX, EY + 4, EZ, 3.0, COLORS.DARK, 1.4);
          for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 6; y++) setBlock(map, x, y, EZ + 2, COLORS.LIGHT);
          for (let x = EX - 1; x <= EX + 1; x++) for (let y = EY + 2; y <= EY + 3; y++) setBlock(map, x, y, EZ - 3, COLORS.WHITE);
          for (let y = EY + 2; y <= EY + 6; y++) for (let z = EZ - 1; z <= EZ + 2; z++) { setBlock(map, EX - 3, y, z, COLORS.DARK); setBlock(map, EX + 3, y, z, COLORS.DARK); }
          const HY = EY + 8, HZ = EZ + 1;
          generateSphere(map, EX, HY, HZ, 2.0, COLORS.WHITE);
          setBlock(map, EX, HY, HZ + 2, COLORS.GOLD); setBlock(map, EX, HY - 0.5, HZ + 2, COLORS.GOLD);
          setBlock(map, EX - 1, HY + 0.5, HZ + 1, COLORS.BLACK); setBlock(map, EX + 1, HY + 0.5, HZ + 1, COLORS.BLACK);
          setBlock(map, EX - 1, EY, EZ, COLORS.TALON); setBlock(map, EX + 1, EY, EZ, COLORS.TALON);
      }
      buildMiniEagle(-10, 2);
      buildMiniEagle(10, -2);
      return Array.from(map.values());
  }
}

export const Generators = new VoxelGeneratorRegistry();
