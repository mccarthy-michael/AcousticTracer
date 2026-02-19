import type { Models } from "appwrite";

export interface SimulationDocument extends Models.Document {
  name: string;
  status: "pending" | "processing" | "completed" | "failed" | "staging";
  input_file_id: string;
  user_id: string;
  result_file_id?: string;
  compute_time_ms?: number;
  // Config columns
  voxel_size: number;
  fps: number;
  num_rays: number;
  num_iterations: number;
  floor_material: string;
  wall_material: string;
  roof_material: string;
  // Dimensions
  area_x?: number;
  area_y?: number;
  area_z?: number;
}

export interface SimulationListResponse {
  total: number;
  documents: SimulationDocument[];
}
