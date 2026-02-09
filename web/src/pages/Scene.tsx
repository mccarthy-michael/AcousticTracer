import { useParams, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import {
  getSimulation,
  getFileView,
  createSimulationFromExisting,
  uploadSimulationFile,
} from "../api/simulations";
import { type Simulation } from "../types/meta";
import SceneCanvas from "../r3f/SceneCanvas";
import SimDetails from "../components/SimDetails";
import ConfigPanel from "../components/ConfigPanel";
import * as THREE from "three";
import { useSceneStore } from "../stores/useSceneStore";

export default function Scene() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Different data states
  const [viewState, setViewState] = useState<{
    loading: boolean;
    error: string | null;
    modelUrl: string | null;
    // It can be a full Simulation (from DB) or a Staging Draft (Partial)
    simDetails: Simulation | Partial<Simulation> | null;
  }>({
    loading: true,
    error: null,
    modelUrl: null,
    simDetails: null,
  });

  // Use store for state
  const setVoxelSize = useSceneStore((state) => state.setVoxelSize);
  const pendingFile = useSceneStore((state) => state.pendingFile);

  useEffect(() => {
    async function load() {
      if (!id) return;

      setViewState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let url: string | null = null;
        let details: any = null;

        if (id === "new") {
          // Local file mode
          if (!pendingFile) {
            throw new Error("No file selected. Please upload a file first.");
          }

          url = URL.createObjectURL(pendingFile);
          details = {
            name: searchParams.get("name") || "New Simulation",
            status: "staging",
            input_file_id: null,
          };
        } else {
          details = await getSimulation(id);
          if (details.input_file_id) {
            url = getFileView(details.input_file_id);
          }
          // Update config state here if needed
          if (details.voxel_size) {
            setVoxelSize(details.voxel_size);
          }
        }

        setViewState({
          loading: false,
          error: null,
          modelUrl: url,
          simDetails: details,
        });
      } catch (err: any) {
        setViewState((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    }
    load();

    // Cleanup blob URL
    return () => {
      if (id === "new" && viewState.modelUrl) {
        URL.revokeObjectURL(viewState.modelUrl);
      }
    };
  }, [id, searchParams, setVoxelSize]); // omitted pendingFile to avoid reload loops

  const { loading, error, modelUrl, simDetails } = viewState;

  // Use store for bounds and config
  const bounds = useSceneStore((state) => state.bounds);
  const config = useSceneStore((state) => state.config);

  const handleStartSimulation = async () => {
    if (!bounds) return;

    try {
      setViewState((prev) => ({ ...prev, loading: true }));

      let fileId = simDetails?.input_file_id;

      // If no file ID, we need to upload the local file first
      if (!fileId && id === "new") {
        if (!pendingFile) throw new Error("File lost. Please re-upload.");
        console.log("Uploading file to storage...");
        const uploadedFile = await uploadSimulationFile(pendingFile);
        fileId = uploadedFile.$id;
      }

      if (!fileId) throw new Error("No file ID available");

      const size = new THREE.Vector3();
      bounds.getSize(size);

      await createSimulationFromExisting({
        name: simDetails?.name || "Untitled Simulation",
        file_id: fileId,
        voxel_size: config.voxelSize,
        fps: config.fps,
        num_rays: config.numRays,
        num_iterations: config.numIterations,
        floor_material: config.materials.floor,
        wall_material: config.materials.wall,
        roof_material: config.materials.roof,
        area_x: size.x,
        area_y: size.y,
        area_z: size.z,
      });

      // Redirect to dashboard or reload to view 'pending' state
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to start simulation");
      setViewState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary overflow-hidden">
      <header className="flex-none flex items-center p-4 gap-4 bg-bg-primary border-b border-white/5 relative z-20">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent font-medium"
          onClick={() => navigate("/dashboard")}
        >
          <span>←</span> Back
        </button>
        <h1 className="text-xl font-bold text-text-primary m-0">
          {simDetails?.name || "Scene Viewer"}
          {simDetails?.status === "staging" && (
            <span className="ml-3 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
              Draft
            </span>
          )}
        </h1>

        <div className="ml-auto flex items-center gap-4">
          {/* Staging Actions */}
          {simDetails?.status === "staging" && (
            <button
              onClick={handleStartSimulation}
              disabled={loading || !bounds}
              className="px-4 py-2 bg-button-primary text-white text-sm font-semibold rounded hover:bg-button-hover disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? "Starting..." : "Run Simulation"}
            </button>
          )}
          <SimDetails simDetails={simDetails} />
        </div>
      </header>
      <main className="flex-1 p-4 w-5/6 h-full min-h-0 relative">
        <div className="w-full h-full bg-bg-card rounded-xl shadow-md overflow-hidden relative flex items-center justify-center border border-border-primary">
          {loading && (
            <div className="text-text-primary bg-bg-card/80 backdrop-blur px-4 py-2 rounded shadow-lg border border-border-primary font-medium">
              Initializing Scene...
            </div>
          )}
          {error && (
            <div className="text-danger bg-red-500/10 px-4 py-2 rounded font-medium">
              {error}
            </div>
          )}
          {!loading && !error && modelUrl && (
            <div className="w-full h-full relative">
              <div className="absolute top-4 left-4 w-50 z-10">
                <ConfigPanel isEditable={simDetails?.status === "staging"} />
              </div>

              <SceneCanvas modelUrl={modelUrl} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
