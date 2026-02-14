import { ID, Query } from "appwrite";
import { tablesDB, storage, account } from "@/lib/appwrite";
import type { Simulation, SimulationConfig } from "@/features/simulation/types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID_SIMULATIONS;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID_SIMULATIONS;

export async function uploadSimulationFile(file: File) {
  return await storage.createFile({
    bucketId: BUCKET_ID,
    fileId: ID.unique(),
    file: file,
  });
}

export async function createSimulationRow(
  fileId: string,
  name: string,
  config: SimulationConfig,
  dimensions: { x: number; y: number; z: number },
) {
  const user = await account.get();

  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),
    data: {
      name: name,
      status: "pending",
      user_id: user.$id,
      input_file_id: fileId,
      // Map camelCase -> snake_case
      voxel_size: config.voxelSize,
      fps: config.fps,
      num_rays: config.numRays,
      num_iterations: config.numIterations,
      floor_material: config.materials.floor,
      wall_material: config.materials.wall,
      roof_material: config.materials.roof,
      area_x: dimensions.x,
      area_y: dimensions.y,
      area_z: dimensions.z,
    },
  });
}

export async function listSimulations() {
  try {
    const user = await account.get();
    return await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.equal("user_id", user.$id),
        Query.orderDesc("$createdAt"),
      ],
    });
  } catch (err) {
    console.error(err);
    return { rows: [], total: 0 };
  }
}

export async function getSimulation(id: string) {
  try {
    return await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
  } catch (error) {
    console.error("Get Simulation Failed:", error);
    throw error;
  }
}

export async function deleteRow(id: string) {
  try {
    return await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: id,
    });
  } catch (error) {
    console.error("Delete Row failed:", error);
    throw error;
  }
}

export function getFileView(fileId: string) {
  return storage.getFileView({
    bucketId: BUCKET_ID,
    fileId: fileId,
  });
}

export async function deleteFile(fileId: string) {
  try {
    return await storage.deleteFile({
      bucketId: BUCKET_ID,
      fileId: fileId,
    });
  } catch (error) {
    console.error("Delete file failed,", error);
    throw error;
  }
}
