import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";

interface VoxelGridProps {
  bounds: THREE.Box3;
  voxelSize: number;
  visible: boolean;
}

export default function VoxelGrid({
  bounds,
  voxelSize,
  visible,
}: VoxelGridProps) {
  // 1. Direct access to the GPU instance layer
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // 2. Calculate how many voxels we actually need
  const { count, gridDims } = useMemo(() => {
    // Get total size of the room
    const size = new THREE.Vector3();
    bounds.getSize(size);

    // How many cubes fit in each dimension?
    const nx = Math.ceil(size.x / voxelSize);
    const ny = Math.ceil(size.y / voxelSize);
    const nz = Math.ceil(size.z / voxelSize);

    return {
      count: nx * ny * nz,
      gridDims: { nx, ny, nz },
    };
  }, [bounds, voxelSize]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    // 1. Get direct access to the binary data
    const array = mesh.instanceMatrix.array;
    const halfSize = voxelSize / 2;
    const scale = 0.95; // simple for aesthetic purposes, slight gap between voxels

    // Pre-extract dimensions to avoid property access in loop
    const { nx, ny } = gridDims;

    // Flat loop is cleaner for the JIT compiler
    for (let i = 0; i < count; i++) {
      // fast integer math for 3D coordinates
      const x = i % nx;
      const y = Math.floor(i / nx) % ny;
      const z = Math.floor(i / (nx * ny));

      const posX = bounds.min.x + x * voxelSize + halfSize;
      const posY = bounds.min.y + y * voxelSize + halfSize;
      const posZ = bounds.min.z + z * voxelSize + halfSize;

      // Pointer to the start of this matrix in the big array
      const offset = i * 16;

      // Unrolled Matrix4 set (Fastest possible way in JS)
      // Column 0
      array[offset + 0] = scale;
      array[offset + 1] = 0;
      array[offset + 2] = 0;
      array[offset + 3] = 0;

      // Column 1
      array[offset + 4] = 0;
      array[offset + 5] = scale;
      array[offset + 6] = 0;
      array[offset + 7] = 0;

      // Column 2
      array[offset + 8] = 0;
      array[offset + 9] = 0;
      array[offset + 10] = scale;
      array[offset + 11] = 0;

      // Column 3 (Position)
      array[offset + 12] = posX;
      array[offset + 13] = posY;
      array[offset + 14] = posZ;
      array[offset + 15] = 1;
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [bounds, voxelSize, gridDims, count]);

  // 3. Render the specific "Instance" container
  // args={[geometry, material, count]}
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      visible={visible}
    >
      <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
      <meshStandardMaterial
        color="#00ff00"
        transparent
        opacity={0.15}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}
