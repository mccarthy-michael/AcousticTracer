import { useSceneStore } from "../stores/useSceneStores";

export default function ConfigPanel() {
  const voxelSize = useSceneStore((state) => state.config.voxelSize);
  const setVoxelSize = useSceneStore((state) => state.setVoxelSize);

  const { showGrid, setShowGrid } = useSceneStore((state) => ({
    showGrid: state.showGrid,
    setShowGrid: state.setShowGrid,
  }));
  return (
    <div className="bg-bg-card p-4 rounded-lg border border-border-primary w-80">
      <h3 className="text-text-primary font-bold mb-4">Settings</h3>

      {/* Voxel Size Slider */}
      <div className="mb-4">
        <label className="text-text-secondary text-xs block mb-1">
          Voxel Size (m)
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={voxelSize}
          onChange={(e) => setVoxelSize(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="text-right text-text-primary font-mono">
          {voxelSize}m
        </div>
      </div>

      {/* Grid Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Show Voxel Grid</span>
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => setShowGrid(e.target.checked)}
          className="accent-button-primary scale-125"
        />
      </div>
    </div>
  );
}
