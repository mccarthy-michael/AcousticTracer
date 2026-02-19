import type { SimulationDocument } from "@/api/contracts";
import type { Simulation } from "@/features/simulation/types";

export function toSimulation(doc: SimulationDocument): Simulation {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    name: doc.name,
    status: doc.status,
    inputFileId: doc.input_file_id,
    resultFileId: doc.result_file_id,
    computeTimeMs: doc.compute_time_ms,
    // Flattened config -> Nested object
    voxelSize: doc.voxel_size,
    fps: doc.fps,
    numRays: doc.num_rays,
    numIterations: doc.num_iterations,
    materials: {
      floor: doc.floor_material,
      wall: doc.wall_material,
      roof: doc.roof_material,
    },
    areaX: doc.area_x,
    areaY: doc.area_y,
    areaZ: doc.area_z,
  };
}
