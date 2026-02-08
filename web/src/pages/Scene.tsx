import { useParams, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { getSimulation, getFileView } from "../api/simulations";
import SceneCanvas from "../r3f/SceneCanvas";
import SimDetails from "../components/SimDetails";
import * as THREE from "three";
export default function Scene() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Different data states
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simDetails, setSimDetails] = useState<any>(null);

  // The staging state will change later
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [config, setConfig] = useState({
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

      if (id === "new") {
        const fileID = searchParams.get("fileId");
        if (!fileID) {
          setError("No file specified for new sim");
          console.log("error");
          setLoading(false);
          return;
        }
        try {
          const url = getFileView(fileID);
          setModelUrl(url);

          setSimDetails({
            name: searchParams.get("name") || "New Simulation",
            status: "staging",
            input_file_id: fileID,
          });
        } catch (err: any) {
          setError(err.message);
          console.log(error);
        } finally {
          setLoading(false);
        }
        return;
      }
      
      try{
        setLoading(true)
        const sim = await getSimulation(id)
        setSimDetails(sim)
        if (sim.voxel_size){
          setConfig((prev) => ({...prev, voxel_size: sim.voxel_size }))
        }
        if (sim.input_file_id){
          const url = getFileView(sim.input_file_id)
          setModelUrl(url)
        }
      }catch(err:any) {
        setError(err.message || "Failed to load Sim")
        console.log(error)
      }finally{
        setLoading(false);
      }
    }
    load();
  }, [id, searchParams]);


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
          {id ? "Simulation View" : "Scene Viewer"}
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
