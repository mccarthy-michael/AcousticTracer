import { useParams, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { getSimulation, getFileView } from "../api/simulations";
import { type Simulation, type SimulationConfig } from "../types/meta";
import SceneCanvas from "../r3f/SceneCanvas";
import SimDetails from "../components/SimDetails";
import * as THREE from "three";
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
  // The staging state will change later
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const [config, setConfig] = useState<SimulationConfig>({
    voxel_size: 0.5,
    fps: 60,
    num_rays: 10000,
    num_iterations: 100,
    floor_material: "concrete",
    wall_material: "plaster",
    roof_material: "acoustic_tile",
  });

  useEffect(() => {
    async function load() {
      if (!id) return;

      setViewState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        let url: string | null = null;
        let details: any = null;

        if (id === "new") {
          const fileID = searchParams.get("fileId");
          if (!fileID) throw new Error("No file specified for new sim");

          url = getFileView(fileID);
          details = {
            name: searchParams.get("name") || "New Simulation",
            status: "staging",
            input_file_id: fileID,
          };
        } else {
          details = await getSimulation(id);
          if (details.input_file_id) {
            url = getFileView(details.input_file_id);
          }
          // Update config state here if needed
          if (details.voxel_size) {
            setConfig((prev) => ({ ...prev, voxel_size: details.voxel_size }));
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
  }, [id, searchParams]);

  const { loading, error, modelUrl, simDetails } = viewState;

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
          {id ? simDetails?.name : "Scene Viewer"}
        </h1>

        {/* Info Icon & Dropdown - Top Right */}
        <SimDetails simDetails={simDetails} />
      </header>
      <main className="flex-1 p-4 w-full h-full min-h-0 relative">
        <div className="w-full h-full bg-bg-card rounded-xl shadow-md overflow-hidden relative flex items-center justify-center border border-border-primary">
          {loading && (
            <div className="text-text-secondary font-medium">
              Loading scene...
            </div>
          )}
          {error && (
            <div className="text-danger bg-red-500/10 px-4 py-2 rounded font-medium">
              {error}
            </div>
          )}
          {!loading && !error && modelUrl && (
            <div className="w-full h-full relative">
              <SceneCanvas modelUrl={modelUrl} onBoundsCalculated={setBounds} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
