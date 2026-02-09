import { useParams, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import {
  getSimulation,
  getFileView,
  createSimulationFromExisting,
} from "../api/simulations";
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

  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const [config, setConfig] = useState<SimulationConfig>({
    voxel_size: 2,
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

  const handleStartSimulation = async () => {
    if (!bounds || !simDetails?.input_file_id) return;

    try {
      setViewState((prev) => ({ ...prev, loading: true }));
      const size = new THREE.Vector3();
      bounds.getSize(size);

      await createSimulationFromExisting({
        name: simDetails.name || "Untitled Simulation",
        file_id: simDetails.input_file_id,
        voxel_size: config.voxel_size,
        fps: config.fps,
        num_rays: config.num_rays,
        num_iterations: config.num_iterations,
        floor_material: config.floor_material,
        wall_material: config.wall_material,
        roof_material: config.roof_material,
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
                <div className="absolute top-4 left-4 w-50  bg-bg-card/90 backdrop-blur border border-border-primary p-4 rounded-xl shadow-xl z-10">
                  <h3 className="text-sm font-bold uppercase text-text-secondary mb-4">
                    Simulation Config
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Voxel Grid</span>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="accent-button-primary scale-125"
                    />
                  </div>
                  {simDetails?.status === "staging" && (<div className="space-y-4">
                    {/* Voxel Size Slider */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Voxel Size</span>
                        <span className="font-mono text-button-primary">
                          {config.voxel_size}m
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={config.voxel_size}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            voxel_size: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-button-primary"
                      />
                    </div>

                    {/* Grid Toggle */}
                    {/* Grid Stats Info */}
                    {bounds && (
                      <div className="p-3 bg-black/20 rounded border border-white/5 text-xs font-mono text-text-secondary">
                        <div className="mb-1 text-text-primary font-semibold">
                          Grid Dimensions:
                        </div>
                        <div>
                          {Math.ceil(
                            (bounds.max.x - bounds.min.x) / config.voxel_size,
                          )}{" "}
                          x{" "}
                          {Math.ceil(
                            (bounds.max.y - bounds.min.y) / config.voxel_size,
                          )}{" "}
                          x{" "}
                          {Math.ceil(
                            (bounds.max.z - bounds.min.z) / config.voxel_size,
                          )}
                        </div>
                        <div className="mt-2 text-text-primary font-semibold">
                          Total Voxels:
                        </div>
                        <div>
                          {(
                            Math.ceil(
                              (bounds.max.x - bounds.min.x) / config.voxel_size,
                            ) *
                            Math.ceil(
                              (bounds.max.y - bounds.min.y) / config.voxel_size,
                            ) *
                            Math.ceil(
                              (bounds.max.z - bounds.min.z) / config.voxel_size,
                            )
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>)}
                </div>
              

              <SceneCanvas
                modelUrl={modelUrl}
                voxelSize={config.voxel_size}
                showGrid={showGrid}
                bounds={bounds}
                onBoundsCalculated={setBounds}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
