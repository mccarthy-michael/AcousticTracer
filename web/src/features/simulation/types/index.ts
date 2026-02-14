export interface SimulationConfig {
  voxelSize: number;
  fps: number;
  numRays: number;
  numIterations: number;
  materials: {
    floor: string;
    wall: string;
    roof: string;
  };
}

export interface Simulation extends SimulationConfig {
  $id: string;
  $createdAt: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed" | "staging";
  inputFileId: string;
  resultFileId?: string;
  computeTimeMs?: number;
  // Dimensions
  areaX?: number;
  areaY?: number;
  areaZ?: number;
}