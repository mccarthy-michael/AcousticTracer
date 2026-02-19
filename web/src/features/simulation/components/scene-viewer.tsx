import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Bounds,
  Html,
  useProgress,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSceneStore } from "../stores/scene-store";
import VoxelGrid from "./voxel-grid";
// import BoundBoxHelper from "./BoundBoxHelper";

interface SceneCanvasProps {
  modelUrl: string | null;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-text-primary bg-bg-card/80 backdrop-blur px-4 py-2 rounded shadow-lg border border-border-primary font-medium">
        {progress.toFixed(0)}%
      </div>
    </Html>
  );
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
  }, [clonedScene, onLoad]); // Include url to force recalculation when model changes
  return <primitive object={clonedScene} />;
}

export default function SceneCanvas({ modelUrl }: SceneCanvasProps) {
  const setBounds = useSceneStore((state) => state.setBounds);
  const bounds = useSceneStore((state) => state.bounds);
  const showGrid = useSceneStore((state) => state.showGrid);
  if (!modelUrl) return null;

  return (
    <Canvas camera={{ position: [10, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={<Loader />}>
        {/* <Bounds fit clip observe margin={1.5}> */}
        <Bounds fit observe clip margin={2}>
          <Model url={modelUrl} onLoad={setBounds} />
          {bounds && showGrid && <VoxelGrid />}
          {/* <BoundBoxHelper /> */}
        </Bounds>
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}
