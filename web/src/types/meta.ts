export interface SimulationConfig {
  voxel_size: number;
  fps: number;
  num_rays: number;
  num_iterations: number;
  floor_material: string;
  wall_material: string;
  roof_material: string;
  // Dimensions determined by the bounding box of the GLB
  area_x?: number;
  area_y?: number;
  area_z?: number;
}

export interface Simulation extends SimulationConfig {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed" | "staging";
  input_file_id: string; // The GLB file in storage
  result_file_id?: string; // The output binary/JSON
  compute_time_ms?: number;
}

// Helper to separate UI-only fields from DB fields if needed
export type NewSimulationPayload = Omit<
  Simulation,
  "$id" | "$createdAt" | "$updatedAt" | "result_file_id" | "compute_time_ms"
>;
