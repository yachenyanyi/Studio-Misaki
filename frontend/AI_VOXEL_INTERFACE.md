# Voxel Model Generation Interface Documentation
## AI Developer Guide

This document describes how to generate voxel models for the Voxel World engine using the `window.loadVoxelModel` interface.

### 1. Interface Signature

To inject a new model into the world, execute the following JavaScript code in the browser context:

```javascript
window.loadVoxelModel({
  name: "ModelName",     // Unique identifier string
  description: "...",    // Optional description
  generator: (tools) => {
    // Your procedural generation logic here
    return VoxelData[];  // Must return an array of {x, y, z, color} objects
  }
});
```

### 2. The `generator` Function

The `generator` function receives a `tools` object containing helper functions and constants to simplify voxel creation.

#### 2.1 `tools` Object Structure

```typescript
interface VoxelTools {
  // Sets a single block in the map (handles duplicates automatically)
  setBlock: (map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) => void;
  
  // Generates a filled sphere of voxels
  // sy: Y-axis scale (default 1). Use < 1 for flattened spheres, > 1 for tall ellipses.
  generateSphere: (map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy?: number) => void;
  
  // Standard Color Palette (Hex numbers)
  COLORS: {
    DARK: 0x4A3728,   // Dark Brown
    LIGHT: 0x654321,  // Light Brown
    WHITE: 0xF0F0F0,
    GOLD: 0xFFD700,
    BLACK: 0x111111,
    WOOD: 0x3B2F2F,
    GREEN: 0x228B22,  // Vegetation Green
    TALON: 0xE5C100   // Yellow/Orange
  };

  // World Configuration
  CONFIG: {
    FLOOR_Y: number; // The Y-coordinate of the floor (usually -12)
  };
}
```

#### 2.2 Return Type (`VoxelData`)

The generator **must** return an array of objects matching this structure:

```typescript
interface VoxelData {
  x: number;      // Integer X coordinate
  y: number;      // Integer Y coordinate
  z: number;      // Integer Z coordinate
  color: number;  // Hex color (e.g. 0xFF0000)
}
```

### 3. Example Usage

#### Example 1: Procedural Tree (Algorithm-based)

```javascript
window.loadVoxelModel({
  name: "ProceduralTree",
  generator: (tools) => {
    const { setBlock, generateSphere, COLORS, CONFIG } = tools;
    const map = new Map(); // Use Map to prevent duplicate voxels at same coordinate
    
    const rootX = 0, rootZ = 0;
    const groundY = CONFIG.FLOOR_Y;

    // 1. Trunk
    for (let y = 0; y < 10; y++) {
      setBlock(map, rootX, groundY + y, rootZ, COLORS.WOOD);
    }

    // 2. Leaves (Sphere)
    // Center: (0, groundY + 10, 0), Radius: 4, Color: GREEN
    generateSphere(map, rootX, groundY + 10, rootZ, 4, COLORS.GREEN);

    return Array.from(map.values()); // Convert Map values to Array
  }
});
```

#### Example 2: Explicit Character (Data-based)

```javascript
window.loadVoxelModel({
  name: "SimpleSteve",
  generator: (tools) => {
    const { setBlock } = tools;
    const map = new Map();
    
    // Define explicit coordinates
    const voxels = [
      {x:0, y:0, z:0, color: 0x0000FF}, // Leg
      {x:1, y:0, z:0, color: 0x0000FF}, // Leg
      {x:0, y:1, z:0, color: 0x00FF00}, // Body
      {x:1, y:1, z:0, color: 0x00FF00}, // Body
      {x:0, y:2, z:0, color: 0xFFCCAA}, // Head
      {x:1, y:2, z:0, color: 0xFFCCAA}  // Head
    ];

    // Add to map (handles potential overlap if any)
    voxels.forEach(v => setBlock(map, v.x, v.y, v.z, v.color));

    return Array.from(map.values());
  }
});
```

### 4. Best Practices for AI Generation

1.  **Use the `Map`**: Always create a `new Map()` and use `setBlock` or `generateSphere` with it. This prevents performance issues caused by overlapping voxels.
2.  **Relative Coordinates**: Center your model around `(0, 0, 0)` on the X/Z plane.
3.  **Floor Alignment**: Use `tools.CONFIG.FLOOR_Y` as your ground level reference if building structures.
4.  **Color Format**: Always use hexadecimal numbers (e.g., `0xFF0000`) for colors.
5.  **Error Handling**: The engine wraps execution in a try-catch, but ensure your loops terminate (avoid infinite loops).
