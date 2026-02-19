export interface SimulationConfig {
  modelPath: string;
  material: string;
  fps: number;
  numRays: number;
  voxelSize: number;
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
