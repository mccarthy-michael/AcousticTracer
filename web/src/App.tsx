import { UserProvider, useUser } from "./lib/context/user";
import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import "./Login.css";
import "./App.css";

function AppContent() {
  const { current, isLoading } = useUser();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Routes>
      {!current ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
