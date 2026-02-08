import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, useGLTF, Bounds } from "@react-three/drei";
import { Suspense, useCallback, useEffect } from "react";
import * as THREE from "three";

interface SceneCanvasProps {
  modelUrl: string | null;
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

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      onLoad(box);
    }
  }, [scene, onLoad]);
  return <primitive object={scene} />;
}

export default function SceneCanvas({
  modelUrl,
  onBoundsCalculated,
}: SceneCanvasProps) {
  const handleBounds = useCallback(
    (box: THREE.Box3) => {
      if (onBoundsCalculated) {
        onBoundsCalculated(box);
      }
    },
    [onBoundsCalculated],
  );
  if (!modelUrl) return null;

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={2}>
          <Center>
            <Model url={modelUrl} onLoad={handleBounds} />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}
