import { create } from "zustand";
import * as THREE from "three";

interface SceneState {
  config: {
    voxelSize: number;
    numRays: number;
    numIterations: number;
    fps: number;
    materials: {
      floor: string;
      wall: string;
      roof: string;
    };
  };
  bounds: THREE.Box3 | null;
  showGrid: boolean;
  pendingFile: File | null;

  setVoxelSize: (size: number) => void;
  setBounds: (box: THREE.Box3) => void;
  setShowGrid: (visible: boolean) => void;
  setPendingFile: (file: File | null) => void;
  setMaterial: (type: "floor" | "wall" | "roof", value: string) => void;
}

export const useSceneStore = create<SceneState>()((set, get) => ({
  config: {
    voxelSize: 2,
    numRays: 10000,
    numIterations: 100,
    fps: 60,
    materials: {
      floor: "concrete",
      wall: "plaster",
      roof: "acoustic_tile",
    },
  },
  bounds: null,
  showGrid: true,
  pendingFile: null,

  // the actions functions to call when updating state
  setVoxelSize: (size) =>
    set((state) => ({
      config: { ...state.config, voxelSize: size },
    })),
  setBounds: (box) => set({ bounds: box }),
  setShowGrid: (visible) => set({ showGrid: visible }),
  setPendingFile: (file) => set({ pendingFile: file }),
  setMaterial: (type, value) =>
    set((state) => ({
      config: {
        ...state.config,
        materials: { ...state.config.materials, [type]: value },
      },
    })),
}));
