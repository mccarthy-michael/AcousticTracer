import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF, Bounds } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import VoxelGrid from "./VoxelInstancedMesh";

interface SceneCanvasProps {
  modelUrl: string | null;
  voxelSize: number;
  showGrid: boolean;
  bounds: THREE.Box3 | null;
  onBoundsCalculated?: (bounds: THREE.Box3) => void;
}

function Model({
  url,
  onLoad,
}: {
  url: string;
  onLoad: (box: THREE.Box3) => void;
}) {
  const { scene } = useGLTF(url, true);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (clonedScene) {
      const box = new THREE.Box3().setFromObject(clonedScene);
      onLoad(box);
    }
  }, [clonedScene, onLoad]);
  return <primitive object={clonedScene} />;
}

export default function SceneCanvas({
  modelUrl,
  voxelSize,
  showGrid,
  bounds,
  onBoundsCalculated,
}: SceneCanvasProps) {
  if (!modelUrl) return null;

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={2}>
          <Center>
            <Model url={modelUrl} onLoad={onBoundsCalculated || (() => {})} />
            {bounds && showGrid && (
              <VoxelGrid
                bounds={bounds}
                voxelSize={voxelSize}
                visible={showGrid}
              />
            )}
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}
