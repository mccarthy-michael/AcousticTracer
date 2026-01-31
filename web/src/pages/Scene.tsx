import { useParams, useNavigate } from "react-router";

export default function Scene() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <button
          className="button button-ghost"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>
        <h1 className="h1">{id ? `Simulation: ${id}` : "Scene Viewer"}</h1>
        <div style={{ width: "64px" }}></div> {/* Spacer for centering grid */}
      </header>
      <main
        className="home-main"
        style={{ height: "calc(100vh - 80px)", position: "relative" }}
      >
        <div
          className="card"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="text-secondary">
            R3F Canvas will go here for simulation: {id}
          </p>
        </div>
      </main>
    </div>
  );
}
