import { ID, Query } from "appwrite";
import { tablesDB, storage, account } from "../lib/appwrite";
import type { SimulationConfig } from "../features/simulation/types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID_SIMULATIONS;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID_SIMULATIONS;

export async function uploadSimulationFile(file: File) {
  try {
    const uploadedFile = await storage.createFile({
      bucketId: BUCKET_ID,
      fileId: ID.unique(),
      file: file,
    });
    return uploadedFile;
  } catch (error) {
    console.error("File Upload Failed:", error);
    throw error;
  }
}

export type CreateSimulationParams = SimulationConfig & {
  name: string;
  file_id: string;
};

export async function createSimulationFromExisting(
  config: CreateSimulationParams,
) {
  try {
    const user = await account.get();
    console.log("Creating database entry for existing file:", config.file_id);

    const row = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: ID.unique(),
      data: {
        name: config.name,
        status: "pending",
        user_id: user.$id,
        input_file_id: config.file_id,
        voxel_size: Number(config.voxel_size),
        fps: Number(config.fps),
        num_rays: Number(config.num_rays),
        num_iterations: Number(config.num_iterations),
        floor_material: config.materials.floor,
        wall_material: config.materials.wall,
        roof_material: config.materials.roof,
        area_x: Number(config.area_x),
        area_y: Number(config.area_y),
        area_z: Number(config.area_z),
      },
    });

    return row;
  } catch (error) {
    console.error("Simulation Creation Failed:", error);
    throw error;
  }
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
